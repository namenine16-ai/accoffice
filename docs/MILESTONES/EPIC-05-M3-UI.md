# Epic 5 — Milestone 3 (UI Layer)

## Epic Overview

This document plans the UI layer that consumes the already-shipped Epic 5 tax backend — repositories (`8ac3a5f`), services (`5979570`), and API routes (`2b2955a`), all on `main`. It replaces the `/tax` stub page (`app/tax/page.tsx`) with four real pages: Tax Type management, Due Date Rule management, Tax Task management, and a Tax Calendar dashboard.

**Note on numbering:** this document's "Milestone 3" refers to *this session's* UI-layer sequencing (Repository → Service → API → UI), matching how the preceding three implementation turns were labeled in this conversation. It is a different scope than `docs/MILESTONES/EPIC-05-TAX-COMPLIANCE-MANAGEMENT.md`'s own "Milestone 2 — Tax Calendar & Dashboard" and "Milestone 3 — Monthly Filing Workflows" (VAT/PND1/PND3/PND53/SSO-specific filing forms), which remain unbuilt and are carried into Future Work below. Flagging this so the two documents' milestone numbers are not read as the same axis.

## Objective

Build the four UI pages (`/tax/types`, `/tax/due-date-rules`, `/tax/tasks`, `/tax/calendar`) needed to operate the Epic 5 tax backend end to end, using only the already-shipped API — no schema, repository, or service changes.

## Business Value

Gives accounting office staff a working screen to actually use the tax compliance system built in Milestones 1–2 — configuring which taxes exist and when they're due, tracking each customer's monthly filing obligations, and seeing at a glance what's upcoming, due today, overdue, or completed. Without this UI, the backend delivered so far has no user-facing value.

## Success Metrics

- All 4 planned pages (`/tax/types`, `/tax/due-date-rules`, `/tax/tasks`, `/tax/calendar`) are reachable from the `/tax` entry point in 1 click from the Sidebar.
- Every mutating action available in the shipped API (create/update/delete for Tax Types and Due Date Rules; create/update/status-change/soft-delete for Tax Tasks; file/accept/reject for Tax Submissions) is reachable from the UI — 0 mutations require a direct API call.
- Every mutation surfaces a success or error toast with the server's actual message — 0 silent failures.
- 100% of applicable existing shared components (`Table`, `Card`, `Dialog`, `AlertDialog`, `Select`, `Skeleton`, `EmptyState`, `ErrorState`, `useToast`, `Badge`, `Input`, `Label`, `Textarea`, `Checkbox`, `Button`) are reused — 0 duplicate low-level UI primitives created.
- `npm run lint`, `npx tsc --noEmit`, `npm run build` pass with zero errors after every milestone (3.1–3.4).
- These metrics support, and do not duplicate, the Epic-level metrics in `docs/MILESTONES/EPIC-05-TAX-COMPLIANCE-MANAGEMENT.md` ("Display tax status for every customer") and the Roadmap's v0.6.0 metrics (`docs/ROADMAP.md`) — this milestone makes the already-built backend visible and usable, it does not itself measure "100 client companies" or "reduce overdue tax tasks," which are outcomes of the whole Epic, not the UI layer alone.

## Scope

### Included

- `/tax/types` — list, create, edit, delete Tax Types.
- `/tax/due-date-rules` — list, create, edit, delete Due Date Rules.
- `/tax/tasks` — list + filter Tax Tasks (by customer, tax type, employee, status, month, year, due date range), create, edit assignment/priority/remarks, change status, soft delete.
- Tax Submission actions (file a submission, accept/reject a submission) embedded as dialogs/inline actions on `/tax/tasks` — no separate `/tax/submissions` page, since only 4 pages were requested and every submission action is always performed in the context of a specific Tax Task.
- `/tax/calendar` — Upcoming / Due Today / Overdue / Completed dashboard, filterable by month, year, customer, assigned employee, and look-ahead window (`windowDays`).
- Replacing `app/tax/page.tsx` (currently a static stub) with a landing view for the tax module, and a small shared sub-navigation between the 4 pages.
- A new `types/tax.ts` (canonical read-model interfaces, per ADR-005) and a new `components/tax/` folder (per-domain feature components, per `docs/PROJECT_STRUCTURE.md`).

### Not Included

- Monthly Filing Workflow UI (VAT/PND1/PND3/PND53/SSO-specific forms) — this is `EPIC-05-TAX-COMPLIANCE-MANAGEMENT.md`'s own "Milestone 3 — Monthly Filing Workflows," not this document's scope. See the numbering note above.
- Tax Reports & Statistics UI — `EPIC-05-TAX-COMPLIANCE-MANAGEMENT.md`'s "Milestone 4."
- A per-customer "Tax" panel on `/customers/[id]` (mentioned as "likely" in the Epic doc's UI Impact, but not one of the 4 pages requested here).
- A `/tax/tasks/[id]` detail page — this milestone handles task detail/edit/status/submission actions via dialogs on the list page, not a dedicated route (see Page Structure).
- Server-side pagination, bulk actions, notifications, or any chart/`recharts` usage.
- Any schema, repository, or service change — this milestone consumes the API exactly as already shipped.
- Any new UI-level permission (`hasPermission()`) gating — none exists anywhere in the codebase today (verified: zero call sites), consistent with ADR-008's deferred action-level enforcement; this milestone does not introduce the first one as a side effect.

## Architecture Impact

- No new services, repositories, or API routes — this is a pure UI-consumer milestone, per the explicit constraint.
- New `components/tax/` folder, mirroring the existing one-folder-per-domain pattern (`components/customer/`, `components/workflow/`, `components/employee/`, `components/document/`) documented in `docs/PROJECT_STRUCTURE.md`.
- New `types/tax.ts`, per ADR-005 ("exactly one canonical TypeScript interface per read model, living in `types/`") — no tax read-model type currently exists outside the Prisma-generated types re-exported by the repositories.
- Client components call `app/api/tax/*` via `fetch()` only, never a service or Prisma directly (ADR-001, `docs/PROJECT_STRUCTURE.md`'s `app/`/`components/` rules).
- Client-side form validation reuses the exact same `validators/tax.ts` schemas already shipped with the API (via `zodResolver`), per the documented Validation Rule that client-side validation is a UX convenience pointed at the same schema, never a second source of truth.
- Respects ADR-004 (recharts confinement) by not introducing any chart — the Calendar page is a counts/table view, not a chart. If a future iteration wants a chart there, it must reuse `components/dashboard/charts/` primitives, not open a new import zone.
- Does not touch `components/dashboard/TaxDeadlineDashboard.tsx` — that component reads the legacy `CustomerTask` boolean tax flags via `WorkflowTask`, a separate, still-live data source from the new `TaxTask` model. Reconciling or replacing it is out of scope here (see Future Work).

## API Impact

| Endpoint | Change |
|---|---|
| `GET/POST /api/tax/types` | Consumed by UI (no change) |
| `GET/PATCH/DELETE /api/tax/types/[id]` | Consumed by UI (no change) |
| `GET/POST /api/tax/due-date-rules` | Consumed by UI (no change) |
| `GET/PATCH/DELETE /api/tax/due-date-rules/[id]` | Consumed by UI (no change) |
| `GET/POST /api/tax/tasks` | Consumed by UI (no change) |
| `GET/PATCH/DELETE /api/tax/tasks/[id]` | Consumed by UI (no change) |
| `GET/POST /api/tax/submissions` | Consumed by UI (no change) |
| `GET/PATCH /api/tax/submissions/[id]` | Consumed by UI (no change) |
| `GET /api/tax/calendar` | Consumed by UI (no change) |
| `GET /api/customers` | Consumed by UI (existing endpoint — customer-select dropdowns) |
| `GET /api/employees` | Consumed by UI (existing endpoint — employee-assign dropdowns) |
| `GET /api/workflow` | Consumed by UI (existing endpoint — resolves the `customerTaskId` a new Tax Task must reference, by filtering `?customerId=&year=&month=`; no new backend needed) |

## UI Impact

- **New pages:** `app/tax/types/page.tsx`, `app/tax/due-date-rules/page.tsx`, `app/tax/tasks/page.tsx`, `app/tax/calendar/page.tsx`.
- **Replaced:** `app/tax/page.tsx` (stub → landing view + sub-navigation).
- **New shared components:** `components/tax/` (see Component Reuse Plan and each Milestone's "New components required" below).
- **Reused, not duplicated:** every applicable existing `components/ui/*` primitive, plus the existing data-fetch/loading/empty/error page pattern established by `app/documents/page.tsx`.

## Component Reuse Plan

Existing components identified for reuse across all 4 pages, instead of duplicating:

| Existing component | Reused for |
|---|---|
| `components/ui/table.tsx` (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`, `TableHead`) | Tax Type, Due Date Rule, and Tax Task list tables — mirrors `DocumentTable`, `EmployeeTable`, `WorkflowTaskTable` |
| `components/ui/card.tsx` | Page sections, filter panels, summary cards |
| `components/ui/dialog.tsx` | Create/edit forms for Tax Type, Due Date Rule, Tax Task, Tax Submission — mirrors `DocumentUploadDialog`/`DocumentRenameDialog` |
| `components/ui/alert-dialog.tsx` | Delete confirmations — mirrors the existing delete-confirm pattern on Customer/Employee/Document tables |
| `components/ui/select.tsx` | Tax type / status / customer / employee dropdowns — mirrors `DocumentFilters` |
| `components/ui/input.tsx`, `label.tsx`, `textarea.tsx`, `checkbox.tsx` | Form fields (`isActive`, `allowWeekendAdjustment`, `allowHolidayAdjustment` as checkboxes; dates as `<Input type="date">`, matching `CustomerForm`'s existing convention, not `Popover`+`Calendar`) |
| `components/ui/badge.tsx` | Underlying primitive for the two new status badges (see New Components) — mirrors `WorkflowStatusBadge` |
| `components/ui/skeleton.tsx` | Loading state — mirrors `DocumentsPage`'s inline `Skeleton` block |
| `components/ui/empty-state.tsx` (`EmptyState`) | Empty states — mirrors `DocumentsPage` |
| `components/ui/error-state.tsx` (`ErrorState`) | Fetch-error states — mirrors `DocumentsPage` |
| `components/ui/use-toast.tsx` (`useToast`) | Success/error feedback on every mutation — mirrors every existing mutating page |
| `components/ui/button.tsx` | All actions |

No new low-level `components/ui/*` primitive is required — everything needed already exists.

## Page Structure

```
app/tax/
  page.tsx                    (landing/hub — links to the 4 sub-pages, replaces the stub)
  types/page.tsx               (Milestone 3.1)
  due-date-rules/page.tsx      (Milestone 3.2)
  tasks/page.tsx                (Milestone 3.3)
  calendar/page.tsx            (Milestone 3.4)
```

No `[id]` dynamic routes are planned in this milestone. Unlike `/customers/[id]`, `/employees/[id]`, `/workflow/[id]`, all 4 tax pages are list pages; create/edit/status/submission actions happen via dialogs on the list page rather than a dedicated detail route. This is a deliberate scope reduction — only the 4 pages explicitly requested are planned; a `/tax/tasks/[id]` detail page remains possible future work if dialog-based editing proves insufficient (see Future Work).

Since no existing `Tabs` primitive exists in `components/ui/`, cross-page navigation between the 4 tax pages is a small new `components/tax/TaxSubNav.tsx` — a plain link bar (mirrors `Sidebar.tsx`'s own `pathname === menu.href` active-link pattern), not a new shadcn primitive or dependency.

## State Management

- **Server state:** fetched via `fetch()` inside `useEffect` on mount (and on filter change, for `/tax/tasks` and `/tax/calendar`), stored in `useState`, refetched via a local `refresh*()` helper after every mutation — the exact pattern already used by `app/documents/page.tsx`. No data-fetching library (React Query, SWR) is used anywhere in this codebase today; none is introduced here.
- **Local UI state:** `useState` for dialog open/closed, the row selected for edit/delete/status-change/submission, and filter values (a single `*FiltersState` object per page, mirroring `DocumentFiltersState`). Active sub-nav highlight is derived from `usePathname()`, mirroring `Sidebar.tsx`.
- **Form state:** `react-hook-form` + `zodResolver`, pointed at the existing `validators/tax.ts` schemas (`taxTypeCreateSchema`/`taxTypeUpdateSchema`, `dueDateRuleCreateSchema`/`dueDateRuleUpdateSchema`, `taxTaskCreateSchema`/`taxTaskUpdateSchema`/`taxTaskStatusUpdateSchema`, `taxSubmissionCreateSchema`/`taxSubmissionUpdateSchema`/`taxSubmissionStatusUpdateSchema`) — mirrors `CustomerForm`. The server's `.safeParse()` remains authoritative; client-side validation is a UX convenience only, per `docs/CODING_GUIDELINES.md`'s Validation Rules.

## Milestones

### Milestone 3.1 — Tax Type Management

**Page:** `/tax/types`
**Purpose:** Manage tax master data (VAT, PND1, PND3, PND53, Social Security, and any future type) — list, create, edit, deactivate/delete.
**API endpoints used:** `GET /api/tax/types`, `POST /api/tax/types`, `PATCH /api/tax/types/[id]`, `DELETE /api/tax/types/[id]`.
**Main components:** `TaxTypeTable`, `TaxTypeFormDialog`, `TaxSubNav`.
**Existing components to reuse:** `Card`, `Table`/`TableHeader`/`TableBody`/`TableRow`/`TableCell`, `Dialog`, `AlertDialog`, `Input`, `Label`, `Textarea`, `Checkbox` (`isActive`), `Badge` (active/inactive), `Button`, `Skeleton`, `EmptyState`, `ErrorState`, `useToast`.
**New components required:** `components/tax/TaxTypeTable.tsx`, `components/tax/TaxTypeFormDialog.tsx`, `components/tax/TaxSubNav.tsx` (shared across all 4 pages, listed once here).
**Loading state:** Inline `Skeleton` block inside `Card` while `GET /api/tax/types` is in flight — mirrors `DocumentsPage`.
**Empty state:** `EmptyState` ("ยังไม่มีประเภทภาษี") when the list is empty.
**Error state:** `ErrorState` + toast on fetch failure; toast alone for mutation failures. A `DELETE` conflict (409 — the type is still referenced by a `TaxTask`) must surface the server's exact Thai message ("กรุณาปิดการใช้งาน (isActive) แทนการลบ"), not a generic one, so the user knows to deactivate instead of delete.
**Permissions required:** Any authenticated user (`admin` or `staff`) — both roles hold `tax:read`/`tax:write` in `lib/permissions.ts`, and `/tax` is not in `middleware.ts`'s `ADMIN_ONLY_PATHS`.

### Milestone 3.2 — Due Date Rule Management

**Page:** `/tax/due-date-rules`
**Purpose:** Configure when each Tax Type is due — day of month, month offset, and weekend/holiday adjustment flags.
**API endpoints used:** `GET /api/tax/due-date-rules`, `POST /api/tax/due-date-rules`, `PATCH /api/tax/due-date-rules/[id]`, `DELETE /api/tax/due-date-rules/[id]`, plus `GET /api/tax/types` (to populate the `taxTypeId` select on create, and to display each rule's tax type name — already included via the repository's `withRelations`).
**Main components:** `DueDateRuleTable`, `DueDateRuleFormDialog`.
**Existing components to reuse:** `Card`, `Table`*, `Dialog`, `AlertDialog`, `Input` (`dayOfMonth`, `monthOffset`), `Checkbox` (`allowWeekendAdjustment`, `allowHolidayAdjustment`), `Select` (`taxTypeId`, create-only — the API does not accept `taxTypeId` on `PATCH`), `Textarea` (`notes`), `Button`, `Skeleton`, `EmptyState`, `ErrorState`, `useToast`.
**New components required:** `components/tax/DueDateRuleTable.tsx`, `components/tax/DueDateRuleFormDialog.tsx`.
**Loading state:** Same `Skeleton` pattern as 3.1.
**Empty state:** `EmptyState` ("ยังไม่มีกฎวันครบกำหนด").
**Error state:** Same pattern as 3.1. A `POST` conflict (409 — a rule already exists for that tax type) must surface the server's message, not a generic one, since `DueDateRule` is 1-per-`TaxType` in v1.
**Permissions required:** Same as 3.1.

### Milestone 3.3 — Tax Task Management

**Page:** `/tax/tasks`
**Purpose:** The core operational view — list/filter each customer's monthly tax obligations, create new tax tasks, edit assignment/priority/remarks, move a task through its filing status, and file/accept/reject submissions against it.
**API endpoints used:** `GET /api/tax/tasks` (with `customerId`/`taxTypeId`/`assignedEmployeeId`/`status`/`month`/`year`/`dueDateFrom`/`dueDateTo`), `POST /api/tax/tasks`, `PATCH /api/tax/tasks/[id]` (both the field-update and `{status}` shapes), `DELETE /api/tax/tasks/[id]` (soft delete); `GET /api/tax/submissions?taxTaskId=`, `POST /api/tax/submissions`, `PATCH /api/tax/submissions/[id]`; plus `GET /api/tax/types`, `GET /api/customers`, `GET /api/employees` (dropdowns) and `GET /api/workflow?customerId=&year=&month=` (to resolve the required `customerTaskId` when creating a task).
**Main components:** `TaxTaskFilters`, `TaxTaskTable`, `TaxTaskFormDialog`, `TaxTaskStatusBadge`, `TaxTaskStatusDialog`, `TaxSubmissionDialog`, `TaxSubmissionStatusBadge`.
**Existing components to reuse:** `Card`, `Table`*, `Dialog`, `AlertDialog`, `Select` (customer/tax type/employee/status filters — mirrors `DocumentFilters` exactly), `Input`, `Textarea`, `Badge`, `Button`, `Skeleton`, `EmptyState`, `ErrorState`, `useToast`.
**New components required:** `components/tax/TaxTaskFilters.tsx`, `components/tax/TaxTaskTable.tsx`, `components/tax/TaxTaskFormDialog.tsx`, `components/tax/TaxTaskStatusBadge.tsx`, `components/tax/TaxTaskStatusDialog.tsx`, `components/tax/TaxSubmissionDialog.tsx`, `components/tax/TaxSubmissionStatusBadge.tsx`.
**Loading state:** Same `Skeleton` pattern as 3.1, shown while the initial `GET /api/tax/tasks` (plus dropdown data) is in flight.
**Empty state:** Two-tier, mirroring `DocumentsPage` exactly: `EmptyState` "ยังไม่มีงานภาษี" when there are zero tasks at all, vs. "ไม่พบงานภาษีที่ตรงกับตัวกรอง" when filters produce zero results from a non-empty list.
**Error state:** `ErrorState` + toast on fetch failure. Mutation/status-transition failures must surface the server's actual message via toast (e.g. `"ไม่สามารถเปลี่ยนสถานะจาก IN_PROGRESS เป็น COMPLETED ได้"`), not a generic one — the API's `TaxTaskError`/`TaxSubmissionError` messages are specific and meant to be shown, not swallowed.
**Permissions required:** Same as 3.1.

### Milestone 3.4 — Tax Calendar Dashboard

**Page:** `/tax/calendar`
**Purpose:** At-a-glance dashboard of Upcoming / Due Today / Overdue / Completed tax tasks for a given period, filterable by customer and employee — the default landing view for the tax module.
**API endpoints used:** `GET /api/tax/calendar` (with `month`/`year`/`customerId`/`assignedEmployeeId`/`windowDays`), `GET /api/customers`, `GET /api/employees` (filter dropdowns).
**Main components:** `TaxCalendarFilters`, `TaxCalendarSummaryCards`, `TaxCalendarTaskList`.
**Existing components to reuse:** `Card`/`CardHeader`/`CardTitle`/`CardContent` (summary cards, mirrors `DashboardCard`), `Select` (month/year/customer/employee), `Input` (`windowDays`, number), `Badge` (bucket labels), `Table`* (reused inside `TaxCalendarTaskList`, in a read-only/no-row-actions mode, rather than a second table implementation), `Skeleton`, `EmptyState`, `ErrorState`, `useToast`.
**New components required:** `components/tax/TaxCalendarFilters.tsx`, `components/tax/TaxCalendarSummaryCards.tsx`, `components/tax/TaxCalendarTaskList.tsx` (thin wrapper around `TaxTaskTable`).
**Loading state:** Same `Skeleton` pattern as 3.1.
**Empty state:** Per-bucket, not one blanket empty state — a period can validly have zero Overdue but nonzero Upcoming, etc. Each of the 4 buckets shows its own short empty message (e.g. "ไม่มีงานที่เกินกำหนด" for a zero-count Overdue bucket) rather than hiding the section entirely.
**Error state:** Same pattern as 3.1.
**Permissions required:** Same as 3.1.

## Verification Plan

- `npm run lint`, `npx tsc --noEmit`, `npm run build` after every milestone (3.1–3.4), per the project's Verification Gate.
- Live functional checks against the running dev server for each page: create/edit/delete flows, filter combinations, and every status/submission transition.
- Tax Task status transitions: verify the UI surfaces the server's rejection message for an invalid transition (e.g. attempting `FILED → PENDING`) rather than failing silently.
- Tax Calendar counts cross-checked against a manual count for known seeded data, per the same standard already used for the Epic's other dashboard verification.
- Due Date Rule creation verified to correctly surface a 409 conflict when a second rule is attempted for a tax type that already has one.
- Tax Type deletion verified to correctly surface the "deactivate instead" message when the type is still referenced by a `TaxTask`.
- No automated test suite exists in this codebase (`docs/CODING_GUIDELINES.md` Testing Rules) — verification here is manual/live-functional, consistent with every other epic to date.

## Commit Plan

### UI
1. `feat(tax): add tax type and due date rule management ui` (Milestone 3.1 + 3.2)
2. `feat(tax): add tax task management ui` (Milestone 3.3)
3. `feat(tax): add tax calendar dashboard and replace tax stub` (Milestone 3.4)

### Documentation
1. `docs: update project docs after Epic 5 Milestone 3 — UI layer`

## Risks

- `app/tax/page.tsx` is a live stub with a real Sidebar nav link (`ภาษี` → `/tax`) — replacing it must not leave a broken or dead link, and must land as its own clean UI commit (ADR-016), not mixed with the 4 sub-pages.
- No server-side pagination exists anywhere yet (documented technical debt, `docs/CODING_GUIDELINES.md`) — `/tax/tasks` can grow large across many customers × 5 tax types × 12 months. Client-side-only filtering is accepted for this milestone, matching the current `Document`/`Customer` pattern, but the same known scalability gap applies.
- The status-transition guard (`ALLOWED_TRANSITIONS` in `taxTaskService`) is enforced server-side only. The UI's "valid next status" options must be kept as a manually-maintained constant mirroring that map (services aren't importable into client components) — if the two drift out of sync, a user could see a transition offered in the UI that the server then rejects. Flagged as an accepted, manually-synced duplication, not a shared import.
- Creating a Tax Task requires a valid `customerTaskId`, resolved via `GET /api/workflow?customerId=&year=&month=`. If no matching `CustomerTask` exists for the selected customer/period, task creation must be blocked in the UI with a clear message, rather than submitting a request that the API would reject with a 400 FK-violation.
- Permission enforcement is still deferred at the API layer (ADR-008, unresolved). This milestone does not close that gap — both `admin` and `staff` get full tax UI access, matching current API behavior exactly, not introducing a new inconsistency.
- No automated tests exist — a regression in one page's dialog/table logic would only be caught by the manual Verification Plan above, the same limitation every prior epic has carried.

## Future Work

- Monthly Filing Workflow UI (VAT/PND1/PND3/PND53/SSO-specific forms) — `EPIC-05-TAX-COMPLIANCE-MANAGEMENT.md`'s "Milestone 3."
- Tax Reports & Statistics UI — `EPIC-05-TAX-COMPLIANCE-MANAGEMENT.md`'s "Milestone 4."
- A per-customer "Tax" panel on `/customers/[id]`, mirroring `CustomerRecentDocuments`.
- A `/tax/tasks/[id]` detail page, if dialog-based editing proves insufficient once real usage volume is seen.
- Server-side pagination for `/tax/tasks`, if data volume grows enough to matter.
- Reconciling `components/dashboard/TaxDeadlineDashboard.tsx` (legacy `CustomerTask` boolean-flag view) with the new `TaxTask`-based Calendar, so the dashboard doesn't carry two parallel sources of tax-deadline truth indefinitely.
- UI-level `hasPermission()` gating, once ADR-008's action-level enforcement is closed.

## Definition of Done

- [ ] All milestones implemented via separate, correctly-scoped Backend/UI/Docs commits
- [ ] `npm run lint`, `npx tsc --noEmit`, `npm run build` pass after every milestone
- [ ] Live functional verification performed against the running dev server with real records
- [ ] No schema change or new dependency added without prior explicit approval
- [ ] `CHANGELOG.md`, `docs/PROJECT_CHECKPOINT.md`, `docs/EPIC_PROGRESS.md`, `docs/ROADMAP.md` updated to reflect what shipped
- [ ] Nothing pushed without explicit approval

## Release Checklist

See `docs/RELEASE_CHECKLIST.md` for the full checklist. Confirm before tagging a release:
- [ ] Code Quality gate passed
- [ ] Functional Testing complete
- [ ] Security checklist complete
- [ ] Git scope audit complete, working tree clean
- [ ] Release steps (tag, push, verify) complete
