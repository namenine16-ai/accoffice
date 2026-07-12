# Tax Rules

Business rules for the Tax Compliance module, written before any database design or implementation begins. Builds directly on the decisions already recorded in `docs/TAX_DATA_MODEL.md` and the scope defined in `docs/MILESTONES/EPIC-05-TAX-COMPLIANCE-MANAGEMENT.md` — nothing here contradicts either.

## Overview

This document describes *what the business rules are*, independent of how they'll eventually be stored or coded: which tax types the system tracks, how a filing moves from document collection to completion, how due dates are calculated and adjusted, which customers owe which taxes, and how the dashboard should classify a task as upcoming, due, or overdue.

## Tax Types

### VAT (ภาษีมูลค่าเพิ่ม / PP30)

- **Purpose:** Value-added tax on goods and services.
- **Filing Frequency:** Monthly.
- **Due Date:** By day 15 of the following month.
- **Responsible Role:** The employee assigned to the customer's tax workflow.
- **Required Documents:** Sales tax invoices, purchase tax invoices, VAT report.
- **Dependencies:** Only applies to customers who are VAT-registered (see Customer Rules).

### PND1 (ภ.ง.ด.1 — withholding tax on employment income)

- **Purpose:** Withholding tax remitted on salaries and wages paid to employees.
- **Filing Frequency:** Monthly.
- **Due Date:** By day 7 of the following month.
- **Responsible Role:** The employee assigned to the customer's tax workflow.
- **Required Documents:** Payroll withholding summary.
- **Dependencies:** Only applies to customers with employees on payroll (see Customer Rules).

### PND3 (ภ.ง.ด.3 — withholding tax on payments to individuals)

- **Purpose:** Withholding tax on payments made to individual (non-corporate) service providers.
- **Filing Frequency:** Monthly.
- **Due Date:** By day 7 of the following month.
- **Responsible Role:** The employee assigned to the customer's tax workflow.
- **Required Documents:** Withholding tax certificates issued, payment records.
- **Dependencies:** Only applies to customers who made withholding-applicable payments to individuals during the period (see Customer Rules).

### PND53 (ภ.ง.ด.53 — withholding tax on payments to juristic persons)

- **Purpose:** Withholding tax on payments made to corporate/juristic entities.
- **Filing Frequency:** Monthly.
- **Due Date:** By day 7 of the following month.
- **Responsible Role:** The employee assigned to the customer's tax workflow.
- **Required Documents:** Withholding tax certificates issued, payment records.
- **Dependencies:** Only applies to customers who made withholding-applicable payments to juristic persons during the period (see Customer Rules).

### Social Security (ประกันสังคม / SSO)

- **Purpose:** Employer and employee social security fund contributions.
- **Filing Frequency:** Monthly.
- **Due Date:** By day 15 of the following month.
- **Responsible Role:** The employee assigned to the customer's tax workflow.
- **Required Documents:** Payroll/employee contribution report.
- **Dependencies:** Only applies to customers with employees on payroll (see Customer Rules).

## Filing Workflow

```
Document Collection → Review → Ready to File → Submitted → Completed
```

- **Document Collection** — gathering the required documents for this tax type/period from the customer. Corresponds to the stored `TaxTask` status `Pending` or `Waiting Documents` (`docs/TAX_DATA_MODEL.md`).
- **Review** — staff verifies the collected documents are complete and correct. Corresponds to stored status `In Progress`.
- **Ready to File** — all information is verified and the filing is prepared. Corresponds to stored status `Ready`.
- **Submitted** — the filing has been sent to the relevant authority. Corresponds to stored status `Filed`, and creates a `TaxSubmission` record.
- **Completed** — the submission is confirmed accepted. Corresponds to stored status `Completed`, the terminal state.

This business-level narrative and the `TaxTask` Status Flow in `docs/TAX_DATA_MODEL.md` describe the same process at two different levels — this section does not introduce a second, competing state machine.

## Due Date Rules

- **Monthly filing** — each tax type has exactly one due date per period, computed from its `DueDateRule` (day of month + month offset), per `docs/TAX_DATA_MODEL.md`.
- **Weekend adjustment** — if the computed due date falls on a Saturday or Sunday, the effective due date moves to the next business day.
- **Public holiday adjustment** — if the computed (or weekend-adjusted) due date falls on a public holiday, it moves to the next business day. This requires a holiday calendar, which does not yet exist anywhere in the system — see Open Questions.
- **Late filing** — a `TaxTask` past its effective due date without a `Completed` status is overdue. This is a derived condition, not a stored one (see Dashboard Rules). Real financial consequences of late filing (penalties) are not tracked yet — reserved for the future `TaxPenalty` model.

## Customer Rules

- **VAT registered** — the customer is eligible for a VAT `TaxTask` every period.
- **Non-VAT** — the customer is not VAT-registered; no VAT `TaxTask` is generated for them.
- **No employees** — the customer has no employees on payroll; no PND1 or Social Security `TaxTask` is generated for them.
- **No withholding tax** — the customer made no withholding-applicable payments in the period; no PND3/PND53 `TaxTask` is generated for that period.

A `TaxTask` is only generated for a tax type a given customer is actually subject to for a given period — not every customer gets every tax type every month.

## Validation Rules

- Required documents must exist before a `TaxTask` can move to `Submitted`.
- A submission date cannot be before the start of the filing period it belongs to.
- `Completed` requires a successful `TaxSubmission` — a rejected submission cannot mark the task `Completed`.
- A due date must be defined before a `TaxTask` can be created or displayed — every task resolves to a due date via its tax type's `DueDateRule`.

## Dashboard Rules

- **Upcoming** — due date is in the future, within a look-ahead window (e.g. 7 days), and the task is not yet `Completed` or `Cancelled`.
- **Due Today** — due date equals today's date, and the task is not yet `Completed` or `Cancelled`.
- **Overdue** — due date is in the past and the task is not yet `Completed` or `Cancelled`. **Overdue is a derived status, computed at read time from the due date versus the current date — it is never written to the database as a stored value**, consistent with `docs/TAX_DATA_MODEL.md`'s Design Decisions (Approved), item 3.
- **Completed** — the task's stored status is `Completed`.

## Notification Rules

Timing only — no delivery mechanism, channel, or implementation is defined here:

- A reminder before the due date (exact lead time configurable, not fixed by this document).
- A reminder on the due date itself.
- A reminder after the due date if the task is still not completed.
- An escalation reminder if the task remains overdue beyond a further threshold.

## Future Rules

Reserved, not defined in detail here — out of scope for Epic 5:

- **Payroll Integration** — how tax rules interact with the future Payroll module (v0.7.0), e.g. PND1 figures potentially populated from payroll data.
- **AI Recommendation** — AI-assisted suggestions for filing preparation (v1.1.0 AI Assistant).
- **OCR Automation** — automatic extraction of data from required documents (v2.0.0 AI Accounting Platform).
- **Client Portal** — customers submitting required documents themselves (v1.0.0 Client Portal).

## Open Questions

Unresolved business questions only — data-model questions already closed in `docs/TAX_DATA_MODEL.md` are not repeated here:

1. **Holiday calendar** — weekend adjustment is straightforward, but public holiday adjustment requires a Thai public holiday calendar that doesn't exist anywhere in the system yet. Is building/maintaining this in scope for Epic 5, or deferred?
2. **Required documents per tax type** — is the "required documents" list a fixed set per tax type, or configurable per customer (some customers may have additional requirements)?
3. **Responsible Role assignment** — is the responsible employee for a `TaxTask` always the same as the customer's already-assigned employee (`CustomerTask.assignedEmployeeId`), or can each tax type be assigned to a different person?
4. **Late filing consequences** — does late filing need any real tracking now (even a simple flag/note), or is this fully deferred to the future `TaxPenalty` model with no interim tracking?
5. **TaxTask generation trigger** — what actually creates a `TaxTask` for a customer/period: a scheduled job at the start of each month, a manual "start new period" action, or something else? Not yet defined.
6. **Document linkage for validation** — the "required documents must exist before filing" rule depends on how documents attach to a `TaxTask`, which is itself unresolved in `docs/TAX_DATA_MODEL.md` (the `Document` relationship was never explicitly decided in the approved Design Decisions — flagging this dependency, not re-deciding it here).
