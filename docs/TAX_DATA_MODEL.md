# Tax Data Model

Defines the complete data model for the Tax Compliance module (Epic 5) before any `schema.prisma` change is made. This is a design document, not a schema — no Prisma model, migration, or code is included here. See `docs/MILESTONES/EPIC-05-TAX-COMPLIANCE-MANAGEMENT.md` for the epic plan this model supports.

## Overview

Tax Compliance Management needs to track, for every client company, which taxes are due each month (VAT, PND1, PND3, PND53, Social Security), when they're due, who's responsible, whether they've been filed, and what was submitted. Today this is approximated by seven boolean flags (`receiveDoc`, `vat`, `pnd1`, `pnd3`, `pnd53`, `sso`, `closing`) and a single shared `deadline` field on `CustomerTask` — one deadline for all tax types in a given month, no due-date rules, no filing history, no per-type assignment or status. This document proposes six entities that replace that approximation with a real per-tax-type model, while deciding deliberately (see Design Decisions (Approved)) how they relate to what already exists rather than silently duplicating it.

## Design Principles

- **Repository → Service → API → UI.** Every entity here gets a repository once its model exists, per `docs/DEVELOPMENT_RULES.md` — no speculative repositories for models not yet approved.
- **Reuse existing infrastructure, don't parallel it.** Activity logging goes through the existing shared `activityService` (ADR-014), employee assignment reuses the `assignedEmployeeId` pattern already proven on `CustomerTask`, and documents continue to flow through the existing `Document` model rather than a second file-storage mechanism.
- **Master data separate from transactional data.** What a tax type *is* (`TaxType`) and when it's *due* (`DueDateRule`) are separate from the per-customer, per-month obligation to actually file it (`TaxTask`) — so a due-date rule can change without rewriting historical obligations.
- **History is not overwritten.** A filing event (`TaxSubmission`) is a new record, not a field update on the task — so amendments and refiling don't destroy the original record.
- **No schema change without approval.** Every entity below is a proposal. Nothing here is built until `schema.prisma` changes are explicitly approved.

## Core Entities

### TaxType

**Purpose:** Master/reference data for each kind of tax obligation the office tracks — VAT, PND1, PND3, PND53, Social Security, and any future type (e.g. PND1Kor, PND90/91).

**Key Fields:** code (e.g. `VAT`, `PND1`), name (Thai display name), description, isActive.

**Relationships:** Has many `DueDateRule` (a type's due-date rule can change over time); referenced by `TaxTask`.

**Future Expansion:** Additional tax types can be added as new rows without a schema change — this is exactly why it's master data rather than a hardcoded enum like `DocumentCategory`.

### TaxPeriod (concept)

**Purpose:** Represents one filing period (a specific month/year) that a `TaxTask` belongs to — the basis for the Tax Calendar.

**v1:** Not a separate Prisma model. `month` and `year` are stored directly as plain integer fields on `TaxTask`, mirroring how `CustomerTask` already works (see Design Decisions (Approved), item 5).

**Future:** A dedicated `TaxPeriod` model, if business requirements justify it — e.g. period-level metadata (a public holiday adjustment, a period-wide note) that doesn't belong on every individual `TaxTask` row, or periods that need to exist independently of any task.

**Relationships:** In v1, none — `month`/`year` are just fields on `TaxTask`. In a future dedicated model, `TaxTask` would reference `TaxPeriod` instead.

### DueDateRule

**Purpose:** Defines when a given `TaxType` is due — e.g. "PND1 is due by day 7 of the following month," "VAT is due by day 15."

**Key Fields:** taxTypeId, dayOfMonth, monthOffset (0 = same month, 1 = following month), effectiveFrom, effectiveTo (nullable — open-ended if still current), notes.

**Relationships:** Belongs to `TaxType`.

**Future Expansion:** Effective-dating supports a future law change (a new due date starting a given month) without losing the rule that applied historically — relevant for accurately computing due dates on past `TaxTask` records.

### TaxTask

**Purpose:** The central transactional entity — one customer's obligation to file one tax type for one period. This is the per-tax-type equivalent of what `CustomerTask`'s boolean flags currently approximate.

**Key Fields:** customerId, customerTaskId (reference to the owning `CustomerTask`, see Design Decisions (Approved), items 1–2), taxTypeId, month, year, dueDate (computed from `DueDateRule` at creation, stored for querying), status (see Status Flow), assignedEmployeeId, priority, remarks, completedAt, deletedAt (see Design Decisions (Approved), item 4).

**Relationships:** Belongs to `Customer`, `TaxType`, and its owning `CustomerTask`; optionally assigned to an `Employee`; has many `TaxSubmission`. No direct relationship to `Document` in v1 — related documents are reached via the owning `CustomerTask` (see Design Decisions (Approved), item 9).

**Future Expansion:** A natural home for future per-task automation (recurring generation at the start of each period, reminder scheduling via a future `TaxNotification`).

### TaxSubmission

**Purpose:** Records an actual filing event against a `TaxTask` — evidence that something was submitted, not just that a status changed.

**Key Fields:** taxTaskId, submittedById (Employee/User), submittedAt, referenceNumber, amount, status (submitted / accepted / rejected), notes.

**Relationships:** Belongs to `TaxTask`; belongs to the submitting `Employee`. No direct relationship to `Document` in v1 — a filed receipt/proof, if attached, is reached via the owning `CustomerTask` (see Design Decisions (Approved), item 9).

**Future Expansion:** Supporting multiple submissions per task (amendments, refiling after rejection) is the reason this is its own entity rather than fields on `TaxTask`.

### TaxReport (concept)

**Purpose:** A generated tax report or statistics view (Milestone 4) — e.g. "Monthly Tax Summary — July 2026."

**v1:** Not a persisted Prisma model. Computed at read time by aggregating `TaxTask` and `TaxSubmission` records, the same approach the (paused) Document Statistics work took (see Design Decisions (Approved), item 6).

**Future:** A persisted `TaxReport` model, if reporting requirements later require stored snapshots — e.g. a report that must reflect state at generation time even after underlying tasks change, or output too expensive to recompute on every read.

**Relationships:** None in v1 (no table exists). In a future persisted model, would reference the relevant period/tasks and the generating `Employee`.

## Relationships

- **Customer** — `TaxTask.customerId` → `Customer`. One customer has many tax tasks across periods and types, mirroring how `CustomerTask.customerId` already works.
- **CustomerTask** — `CustomerTask` remains the operational workflow and is not replaced. Each `TaxTask` carries a reference back to its owning `CustomerTask`. The existing `vat`/`pnd1`/`pnd3`/`pnd53`/`sso` boolean flags on `CustomerTask` remain in place as a coarse, legacy-compatible summary; `TaxTask` is the real per-type record going forward (see Design Decisions (Approved), items 1–2).
- **Employee** — `TaxTask.assignedEmployeeId` and `TaxSubmission.submittedById`, reusing the exact assignment pattern already proven by `CustomerTask.assignedEmployeeId` (Epic 3, ADR-009-adjacent) rather than inventing a new one.
- **ActivityLog** — every `TaxTask` status change and every `TaxSubmission` creation logs through the existing shared `activityService.logActivity()` (ADR-014) — no new or parallel logging mechanism. Proposed action names: `tax.task_status_changed`, `tax.submission_filed`.
- **Document** — tax filings need supporting evidence (receipts, filed forms). `Document.taskId` continues to link only to `CustomerTask`, unchanged. `TaxTask` reaches related documents by way of its owning `CustomerTask` rather than through a new direct relation — no `Document → TaxTask` or `Document → TaxSubmission` relationship is introduced in v1 (see Design Decisions (Approved), item 9).

## Status Flow

```
Pending → Ready → In Progress → Waiting Documents → Filed → Completed
                        ↑______________|
                                                  ↘
                                              Cancelled
```

- **Pending** — task exists (generated for the period) but work hasn't started.
- **Ready** — all prerequisite information is available; work can begin.
- **In Progress** — actively being prepared.
- **Waiting Documents** — blocked on a customer document; can return to In Progress once resolved.
- **Filed** — a `TaxSubmission` has been recorded; awaiting final confirmation.
- **Completed** — filing confirmed accepted, terminal state.
- **Overdue** — not a stored status. Computed at read time from `dueDate` vs. the current date, matching how `TaxDeadlineDashboard` already computes "due soon" (see Design Decisions (Approved), item 3).
- **Cancelled** — terminal state, reachable from any non-completed status (e.g. the obligation no longer applies to this customer/period).

## Future Models

Reserved, not designed in detail here — out of scope for Epic 5:

- **TaxPeriod (dedicated model)** — see Core Entities; v1 uses plain `month`/`year` fields on `TaxTask` instead. Only worth a dedicated model if period-level metadata or independent-of-any-task periods become a real requirement.
- **TaxReport (persisted model)** — see Core Entities; v1 computes reports at read time. Only worth persisting if reporting requirements come to require stored snapshots.
- **TaxCalendar** — may not need its own table at all; could be a computed view over `TaxTask` + `DueDateRule` (no dedicated `TaxPeriod` table needed in v1).
- **TaxNotification** — reminders/alerts for upcoming or overdue tax tasks; likely depends on the cross-cutting Notification Center (`docs/ROADMAP.md`, Platform & Operations), not built standalone here.
- **TaxPenalty** — tracking late-filing penalties or fines per `TaxTask` (amount, reason, paid status).
- **TaxAudit** — tracking an actual tax-authority audit/inspection of a customer, distinct from `ActivityLog` (which is a generic system audit trail, not a tax-authority audit record).

## Design Decisions

- `TaxType` and `DueDateRule` are separate entities so a due-date rule can change (effective-dated) without altering the type definition or losing the historical rule.
- `TaxPeriod` is a concept, not a separate v1 entity — `month`/`year` are stored directly on `TaxTask`, matching how `CustomerTask` already works (see Design Decisions (Approved), item 5). A dedicated period model remains a possible future addition, not a v1 decision.
- `TaxTask` is the single per-customer-per-type-per-period obligation record — the direct analog of what `CustomerTask`'s boolean flags approximate today, but real, queryable, and independently assignable/status-tracked per tax type instead of bundled into one task.
- `TaxSubmission` is separated from `TaxTask` specifically to preserve filing history across amendments/refiling, rather than overwriting a single "filed" field.
- Status transitions are validated in `services/tax.service.ts`, not the database — consistent with "business logic lives in services/" (`docs/DEVELOPMENT_RULES.md`).
- Employee assignment reuses the existing `assignedEmployeeId` pattern rather than a new mechanism.

## Design Decisions (Approved)

1. **CustomerTask remains the operational workflow.** `CustomerTask` is not replaced or deprecated — it stays the system of record for the customer's overall monthly workflow (assignment, general progress, non-tax deliverables).
2. **`TaxTask` is introduced as a tax-specific workflow, linked to `CustomerTask`.** Each `TaxTask` carries a reference back to its owning `CustomerTask`, rather than existing fully independently or replacing the boolean flags outright. The existing `vat`/`pnd1`/`pnd3`/`pnd53`/`sso` flags on `CustomerTask` remain as a coarse, legacy-compatible summary; `TaxTask` becomes the real per-type record going forward.
3. **Overdue is derived, not stored.** No `Overdue` status is written to the database — it's computed at read time from `dueDate` vs. the current date, matching the existing `TaxDeadlineDashboard` pattern.
4. **`TaxTask` uses soft delete.** Adds a `deletedAt` field, following the same pattern as `Document` rather than the hard-delete pattern used by `Customer`/`CustomerTask`.
5. **`TaxPeriod` remains month/year fields in v1.** No separate `TaxPeriod` table for now — `TaxTask` carries plain `month`/`year` integer fields directly, mirroring how `CustomerTask` already works. A dedicated period table is deferred, not ruled out permanently.
6. **`TaxReport` is computed, not persisted.** No `TaxReport` Prisma model in v1 — Milestone 4 reports and statistics are generated by aggregation at read time, the same approach the (paused) Document Statistics work took.
7. **`DueDateRule` supports one active rule per `TaxType` in v1.** Effective-dating (multiple historical rules per type) is deferred — one current rule per tax type is sufficient to start.
8. **`TaxSubmission` supports multiple submissions per `TaxTask`.** Amendments and refiling are supported from v1 — a `TaxTask` can have more than one `TaxSubmission` record.
9. **Document Relationship.**
   - In v1, `Document` continues to relate only to `CustomerTask` through the existing relationship.
   - `TaxTask` references `CustomerTask` to gain access to related documents.
   - No direct `Document → TaxTask` or `Document → TaxSubmission` relationship will be introduced in v1.
   - This keeps the existing document architecture unchanged during Epic 5.
   - Direct document relationships may be introduced in a future version if document validation or submission history requires it.

## Future Decisions

All nine items previously raised as open data-model questions have now been resolved above, including the `Document` relationship (item 9). No unresolved data-model questions remain at this time. New questions may surface once Milestone 1 implementation begins — this section is reserved for those, not populated speculatively.
