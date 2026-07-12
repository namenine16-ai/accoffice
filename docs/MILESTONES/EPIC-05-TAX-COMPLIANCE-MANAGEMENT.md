# Epic 5 — Tax Compliance Management

## Epic Overview

Build a complete monthly tax compliance management system for accounting firms — real tax master data, due-date rules, a tax calendar/dashboard, and per-type monthly filing workflows (VAT, PND1, PND3, PND53, Social Security), replacing the current `/tax` stub and extending the boolean tax flags already present on `CustomerTask`.

## Objective

Build a complete monthly tax compliance management system for accounting firms.

## Business Value

Help accounting firms manage all monthly tax obligations in one place, reduce overdue filings, and improve operational visibility.

## Success Metrics

- Support at least 100 client companies.
- Manage all monthly tax workflows.
- Reduce overdue tax tasks.
- Display tax status for every customer.
- Generate tax reports and dashboards.

## Scope

### Included

- Tax Master data and Tax Types (VAT, PND1, PND3, PND53, Social Security)
- Due Date Rules per tax type
- Tax repository, service, and API layer (Repository → Service → API → UI)
- Tax Calendar
- Tax Dashboard: Upcoming, Overdue, Completed
- Monthly filing workflow per tax type: VAT, PND1, PND3, PND53, Social Security
- Tax Reports, Statistics, and Dashboard
- Performance improvements for tax queries
- Documentation updates (`CHANGELOG.md`, `docs/PROJECT_CHECKPOINT.md`, `docs/EPIC_PROGRESS.md`, `docs/ROADMAP.md`)

### Not Included

- Payroll
- Office Finance
- AI
- OCR
- Client Portal
- Document Dashboard / Document Analytics (deprioritized separately — see `docs/ROADMAP.md`)

## Architecture Impact

- New `repositories/tax.repository.ts`, `services/tax.service.ts`, `app/api/tax/*` — follows the same Repository → Service → API → UI layering as every other domain (ADR-001).
- New `components/tax/` folder for tax-specific feature components, mirroring `components/workflow/` and `components/document/`.
- Tax Dashboard charts (Milestone 2) must reuse the existing shared chart primitives (`ChartCard`, `ChartContainer`, `ChartTooltip`, `ChartLegend`, `chartPalette` in `components/dashboard/charts/`) rather than opening a new `recharts`-import zone — this is a documented invariant (ADR-004) and must be respected or explicitly re-decided, not silently bypassed.
- The existing `TaxDeadlineDashboard` component (currently on `/dashboard`) already derives a "due within 7 days" view per tax type from `CustomerTask`'s boolean flags — this epic's Tax Dashboard should extend or reuse that logic rather than duplicating it under a second implementation.

## Database Impact

**Requires a schema decision — not yet made.** Milestone 1 (Tax Master, Tax Types, Due Date Rules) needs new Prisma model(s) — most likely a `TaxType` master table (VAT, PND1, PND3, PND53, SSO) carrying its own due-date rule, and a decision on how a per-customer, per-period filing record relates to the existing `CustomerTask` boolean flags (`vat`, `pnd1`, `pnd3`, `pnd53`, `sso`, `closing`). Whether the new model **replaces**, **extends**, or **sits alongside** those existing flags is an open question that must be presented and approved before `schema.prisma` is touched, per `docs/DEVELOPMENT_RULES.md`.

## API Impact

| Endpoint (proposed, not final) | Purpose |
|---|---|
| `GET/POST /api/tax/types` | Tax Master / Tax Types |
| `GET /api/tax/calendar` | Monthly tax calendar |
| `GET /api/tax/dashboard` | Upcoming / Overdue / Completed summary |
| `GET/PATCH /api/tax/filings` | Per-customer, per-tax-type filing status (VAT, PND1, PND3, PND53, SSO) |
| `GET /api/tax/reports` | Tax reports and statistics |

Exact routes and payload shapes depend on the Milestone 1 schema decision above.

## UI Impact

- Replace the `/tax` stub page (`app/tax/page.tsx`) with the real Tax Dashboard.
- New `components/tax/` components: tax type list, calendar, dashboard summary cards, per-type filing workflow views.
- Likely a per-customer "Tax" panel on the customer detail page, mirroring how `CustomerRecentDocuments` was added for Document Management.

## Milestones

### Milestone 1 — Tax Master & Foundation
- Tax Master
- Tax Types
- Due Date Rules
- Repository
- Service
- APIs

### Milestone 2 — Tax Calendar & Dashboard
- Tax Calendar
- Tax Dashboard
- Upcoming
- Overdue
- Completed

### Milestone 3 — Monthly Filing Workflows
- VAT Workflow
- PND1 Workflow
- PND3 Workflow
- PND53 Workflow
- Social Security Workflow

### Milestone 4 — Reports & Performance
- Reports
- Statistics
- Dashboard
- Performance Improvements
- Documentation Updates

## Verification Plan

- `npm run lint`, `npx tsc --noEmit`, `npm run build` after every milestone
- Live functional checks against the running dev server for anything with real runtime behavior
- Due-date rule correctness verified against real tax type configurations
- Tax Dashboard counts (Upcoming/Overdue/Completed) cross-checked against a manual count for known seeded data
- Status transitions verified independently for each of the five tax-type workflows
- Report/statistics output cross-checked against a manual calculation

## Commit Plan

### Backend
1. `feat(tax): implement tax domain foundation` (Milestone 1 — repository, service, API, schema)
2. `feat(tax): add monthly filing workflow APIs` (Milestone 3)
3. `perf(tax): optimize tax queries` (Milestone 4, if needed)

### UI
1. `feat(tax): add tax calendar and dashboard` (Milestone 2)
2. `feat(tax): add monthly filing workflow UI` (Milestone 3)
3. `feat(tax): add tax reports and statistics dashboard` (Milestone 4)

### Documentation
1. `docs: update project docs after Epic 5 — Tax Compliance Management`

## Risks

- **Schema decision required before Milestone 1 backend work begins** — will stop and present the proposed `TaxType`/filing model(s) for approval before touching `schema.prisma`.
- The relationship between any new Tax Master model and the existing `CustomerTask` boolean tax flags is unresolved — a wrong call here could require a follow-up migration or leave two parallel sources of truth for tax status.
- Milestone 2's dashboard must not introduce a second, undocumented `recharts`-import zone — must reuse `components/dashboard/charts/` primitives or explicitly get approval to extend that invariant.
- `/tax` already exists as a stub and a live nav link — Milestone 2 must replace it cleanly, not create a duplicate route.
- Milestone 4 "Performance Improvements" may call for new database indexes — a schema change requiring the same approval gate as Milestone 1.

## Future Work

- Payroll (v0.7.0), Office Finance (v0.9.0), Client Portal (v1.0.0), AI Assistant (v1.1.0), OCR / AI Accounting Platform (v2.0.0) — tracked separately in `docs/ROADMAP.md`, explicitly out of scope here.
- Automated e-filing integration with Thai government tax portals — not scoped in this epic.

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
