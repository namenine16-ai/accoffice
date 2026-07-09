# Epic Progress

## Progress Table

| Epic | Name | Status | Verification |
|---|---|---|---|
| 1 | Dashboard | ✅ Completed | lint/tsc/build pass |
| 2 | Authentication | ✅ Completed | lint/tsc/build pass + live functional test |
| 3 | Employee Management | 🟡 Planned, not started | — |
| 4 | Document Management | ⬜ Not started | — |
| 5 | Workflow Automation | ⬜ Not started | — |
| 6 | Finance | ⬜ Not started | — |
| 7 | Reports | ⬜ Not started | — |
| 8 | Notifications | ⬜ Not started | — |
| 9 | AI Assistant | ⬜ Not started | — |
| 10 | Production Deployment | ⬜ Not started | — |

---

## Epic 1 — Dashboard

**Status:** Completed

**Summary:** Built the real, live Office Hub operational dashboard at `/dashboard` (replacing a static mock-data page that used to sit at `/`), covering every item on the original Epic 1 checklist plus a full responsive app shell.

**Completed features:**
- [x] KPI cards (total customers, today's tasks, overdue, completed this month, pending documents) — real data from `/api/workflow`
- [x] Today's Tasks table
- [x] Overdue Tasks table
- [x] Missing Documents tracker (derived from the 7 document/tax boolean flags on `CustomerTask`)
- [x] Tax Deadline Dashboard (VAT / PND1 / PND3 / PND53 / SSO, due within 7 days)
- [x] Interactive Calendar (task-deadline markers, click-to-filter)
- [x] Monthly Charts — Recharts: Tasks by Month (line), Completed vs Overdue (bar, status colors), Task Status Distribution (donut), Tax Filing Status (stacked bar)
- [x] Recent Activity feed (from `ActivityLog`, now with a real write path for customer CRUD)
- [x] Responsive Sidebar — collapsible on desktop, off-canvas `Sheet` on mobile, collapse state persisted via `sidebar_collapsed` cookie (no hydration flash)

**Verification status:** `npm run lint`, `npx tsc --noEmit`, `npm run build` all pass. Known accepted consequence: the whole app lost static prerendering because `app/layout.tsx` now reads cookies on every request.

---

## Epic 2 — Authentication

**Status:** Completed

**Summary:** Stateless JWT authentication with role-based route protection. No database migration — session state lives entirely in a signed, httpOnly cookie.

**Completed features:**
- [x] JWT sign/verify (`jose`), edge-safe (no Prisma import in the verification path)
- [x] Password hashing (`bcryptjs`)
- [x] httpOnly session cookie — `path=/`, `sameSite=lax`, `secure` in production only, 7-day expiry
- [x] Login (`POST /api/auth/login`)
- [x] Logout (`POST /api/auth/logout`)
- [x] Current user (`GET /api/auth/me`)
- [x] `middleware.ts` — protects every route except `/login`, `/api/auth/*`, `/_next/*`, `/favicon.ico`
- [x] Seed script (`prisma/seed.ts`) — idempotent, creates `admin`/`staff` roles + permission rows + the first admin user from `AUTH_ADMIN_EMAIL`/`AUTH_ADMIN_PASSWORD`
- [x] Role model: `admin` (full access), `staff` (dashboard, customers, workflow, documents, tax only)
- [x] Permission model defined in `lib/permissions.ts` and seeded into real `Permission`/`Role` rows — **not yet enforced inside existing API routes** (deferred)

**Verification status:** lint/tsc/build all pass. Additionally verified live against the running dev server:
- [x] Unauthenticated page request redirects to `/login`
- [x] Unauthenticated API request returns 401 JSON
- [x] Login success sets the cookie correctly (inspected `Set-Cookie` header directly)
- [x] Login failure (wrong password) returns 401 with the correct message
- [x] `/api/auth/me` returns the current user with a valid cookie
- [x] Logout clears the cookie (`Max-Age=0`)
- [x] Protected `/dashboard` loads with a valid cookie
- [x] Protected `/settings` (admin-only) loads for the admin user
- [x] `/login` page renders without the sidebar (bug found and fixed during this exact check — see `docs/CHANGELOG.md`)

---

## Epic 3 — Employee Management

**Status:** Not Started (plan approved in principle, implementation not yet begun)

**Objectives:**
- Employee CRUD (mirrors the Customer module's Repository → Service → API → UI pattern)
- Assign Workflow — extends the *existing* workflow module (`workflow.repository.ts` / `workflow.service.ts`) with a real `CustomerTask` mutation endpoint, since none exists today
- Employee Dashboard (workload/task-count summary, reusing existing `/api/workflow` data)
- Employee Profile (detail page, mirrors the Customer detail page)
- Search / Filter / Status on the employee list
- Role assignment — including creating a login (`User` account) for an employee who doesn't have one yet, then assigning `admin`/`staff`
- Attendance placeholder / Leave placeholder — UI stubs only, no schema, no real data
- Activity logging wired into employee CRUD and the new account-creation flow

**No database changes required** for this epic — `Employee`, `CustomerTask.assignedEmployeeId`, `User`, and `Role` all already exist.

---

## Epic 4 — Document Management

**Status:** Not Started

**Objectives:**
- Real document upload/storage (currently `/documents` is a stub with no `Document` model)
- **Requires a schema decision**: fields for a `Document` model, and a storage-strategy decision (local disk vs. cloud vs. reusing the existing `Customer.googleDriveFolder` link) — implementation will stop for approval before touching `schema.prisma`
- Document-upload activity logging (deferred from Epic 1 for exactly this reason)

---

## Epic 5 — Workflow Automation

**Status:** Not Started

**Objectives:**
- Task mutation UI (status/progress updates, reassignment) building on the `PATCH /api/workflow/[id]` endpoint introduced in Epic 3
- Automation rules for recurring monthly task generation
- Richer workflow editing beyond the current read-only detail view

---

## Epic 6 — Finance

**Status:** Not Started

**Objectives:**
- Real financial tracking (currently no invoice/payment data exists anywhere in the schema; `/finance` is a placeholder stub)
- **Likely requires new Prisma models** (e.g. `Invoice`, `Payment`) — will stop for a schema decision before implementation

---

## Epic 7 — Reports

**Status:** Not Started

**Objectives:**
- Reports built on real aggregated data, not the placeholder text currently on `/reports`
- Likely depends on Epic 6's financial data model for anything beyond operational (workflow/customer) reporting
- **May require new Prisma models or aggregation strategy** — will stop for a decision before implementation if so

---

## Epic 8 — Notifications

**Status:** Not Started

**Objectives:**
- Not yet planned in detail — placeholder entry on the roadmap
- Likely candidates once scoped: in-app notification center, deadline/overdue-task alerts building on existing dashboard data, possibly email notifications
- **Will require a schema decision** (a `Notification` model doesn't exist yet) and scope clarification before implementation begins

---

## Epic 9 — AI Assistant

**Status:** Not Started

**Objectives:**
- Not yet planned in detail — placeholder entry on the roadmap
- Was present in the original project brief but has not been scoped since
- Will require its own architecture/decision pass (model/provider choice, data access boundaries) before implementation begins

---

## Epic 10 — Production Deployment

**Status:** Not Started

**Objectives:**
- Not yet planned in detail — placeholder entry on the roadmap
- Likely candidates once scoped: production database provider (currently SQLite, dev-only — see `docs/DATABASE.md`), secrets management (see `docs/SECURITY.md`), CI/CD beyond the current lint+build workflow, versioned Prisma migrations (currently schema is applied via `db push`, not migrations)
