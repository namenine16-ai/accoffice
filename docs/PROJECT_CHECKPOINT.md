# AccOffice — Project Checkpoint

Single source of truth for the entire project: what it is, how it's built, what's done, and what's next. Read this before starting any new epic or milestone.

## Project Overview

AccOffice is a production-ready accounting office management system: customer records, monthly accounting/tax workflow tracking, an operational dashboard, and (in progress) authentication, employee management, document handling, and finance/reporting.

## Technology Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Database ORM | Prisma 6 |
| Database | SQLite (local dev; provider-swappable later) |
| Styling | Tailwind CSS 4 |
| UI components | shadcn/ui (on `@base-ui/react` primitives) |
| Forms | React Hook Form + Zod |
| Charts | Recharts (the only charting library) |
| Auth | `jose` (JWT), `bcryptjs` (password hashing) |
| Icons | `@phosphor-icons/react` |

## Folder Architecture

```
app/                      Page routes + API routes (App Router)
  api/                    API route handlers — call services only, never Prisma directly
  <feature>/page.tsx       Server/client pages
components/
  ui/                     shadcn/ui primitives (Button, Card, Table, Sheet, ...)
  layout/                 App shell — Sidebar, Providers (mounted once in app/layout.tsx)
  dashboard/              Dashboard widgets
    charts/               Shared chart primitives + the 4 Office Hub charts (Recharts-only zone)
  customer/               Customer-specific components
  workflow/               Workflow-specific components
  employee/               Employee-specific components (Epic 3)
types/                    Shared domain types (one interface per read model, no duplicates)
validators/               Zod schemas, one per domain
utils/                    Framework-agnostic helpers (e.g. cn.ts)
services/                 Business logic — no Prisma access, no UI logic
repositories/             Prisma data access only — no business logic, no validation, no HTTP
lib/                      Low-level infra: prisma.ts, api-error.ts, auth.ts, permissions.ts
middleware.ts             Route protection (session + role gating), Edge Runtime
prisma/                   schema.prisma, seed.ts, dev.db (gitignored, never committed)
docs/                     Project documentation (this folder)
.ai/                      Permanent AI development context
```

## Architecture Rules

**Repository → Service → API → UI.** Data flows one direction; each layer only talks to the layer directly below it.

- No Prisma access outside `repositories/`.
- No business logic inside API routes — routes parse/validate the request, call a service, return a standardized response.
- Shared types live in `types/`; shared validators in `validators/`; shared helpers in `utils/`.
- Reuse `components/ui/*` — never duplicate a component that already exists.
- No duplicated interfaces — one canonical type per read model, imported wherever needed.
- No mock data, anywhere, ever — every UI reads from a real API backed by real Prisma queries.
- A repository is only created once its Prisma model exists (or is about to). No speculative repositories for models that don't exist yet.

## Repository → Service → API → UI Flow

1. UI component (page or client component) calls `fetch()` against an `app/api/*` route, or a server component reads a service directly.
2. The API route parses/validates the request body (Zod), calls exactly one service method, and returns a response via `lib/api-error.ts` on failure.
3. The service method contains the business logic and calls one or more repositories (its own domain's repository, or another domain's *service* — never another domain's repository directly).
4. The repository is a thin Prisma wrapper: `findAll`, `findById`, `create`, `update`, `delete`, plus query-filter methods actually in use. No logic beyond shaping the Prisma call.

## Completed Epics

### Epic 1 — Dashboard ✅
Real-data KPI cards, today's/overdue tasks, missing-documents tracker, tax-deadline breakdown (VAT/PND1/PND3/PND53/SSO due within 7 days), an interactive calendar (task markers, click-to-filter), 4 Recharts charts (Tasks by Month, Completed vs Overdue, Task Status Distribution, Tax Filing Status), recent activity feed, and a fully responsive app shell (collapsible desktop sidebar, mobile off-canvas drawer, cookie-persisted collapse state).

### Epic 2 — Authentication ✅
Stateless JWT sessions (`jose`) in an httpOnly cookie, `bcryptjs` password hashing, `middleware.ts` route protection (public/staff/admin tiers), a seed script creating the first admin user + `admin`/`staff` roles with a defined permission matrix. Permission *enforcement* inside existing APIs and hiding admin-only sidebar links from staff are explicitly deferred (see Technical Debt).

## Current Epic

### Epic 3 — Employee Management (planned, not started)
Employee CRUD, workflow assignment, employee dashboard/profile, search/filter/status, role assignment (including creating a login for an employee who doesn't have one), attendance/leave placeholders, activity logging. Plan presented and two scope questions answered (role assignment includes account creation; workflow-assignment mutation extends the existing workflow module). Awaiting final approval to begin coding.

## Remaining Epics

| Epic | Scope |
|---|---|
| 4 — Document Management | Real document upload/storage — requires a `Document` Prisma model and a storage-strategy decision (schema decision, will stop for approval) |
| 5 — Workflow Automation | Task mutation UI, automation rules, richer workflow editing beyond current read-only views |
| 6 — Finance | Real financial tracking — likely needs new models (invoices/payments) since no such data exists today |
| 7 — Reports | Reports built on real aggregated data, replacing the current `/reports` placeholder; likely depends on Epic 6's data model |
| 8 — Notifications | Not yet scoped in detail — likely an in-app notification center building on existing dashboard data; will need a schema decision (`Notification` model) |
| 9 — AI Assistant | Not yet scoped in detail — present in the original project brief, not planned since |
| 10 — Production Deployment | Not yet scoped in detail — likely production database provider, secrets management, CI/CD, versioned migrations |

This is the authoritative epic list — see `docs/EPIC_PROGRESS.md` for full per-epic detail and `docs/CONTRIBUTING_AI.md`/`.ai/CLAUDE_RULES.md` for the same numbering restated for AI assistants. Further Tax Center depth beyond the dashboard's tax-deadline widget is not currently a separate scheduled epic. Customer CRM already exists from before the epic system started (full CRUD, list/detail/edit).

## Technical Debt

- Permission matrix (`lib/permissions.ts`) is defined and seeded into `Permission`/`Role` rows, but **not enforced inside existing API routes** — e.g., a `staff` user can currently call `DELETE /api/customers/[id]` even though their permission set has no `customers:delete`. Deferred by explicit decision.
- `Sidebar.tsx` shows all 9 links to every authenticated user regardless of role. Middleware blocks the route server-side, but a `staff` user can still click an admin-only link and get bounced back.
- No `CustomerTask` mutation endpoint exists yet (no `PATCH /api/workflow/[id]`) — planned as part of Epic 3's "Assign Workflow."
- No `Document` model — document upload is unimplemented.
- No `prisma/migrations` — schema changes are applied via `prisma db push`, not versioned migrations.
- No automated test suite (`tests/` is empty, no test framework installed). CI (`.github/workflows/ci.yml`) runs lint + build only.
- Finance and Reports pages are still stubs.

## Known Limitations

- A role change for a logged-in user doesn't take effect until they log out/in again or their token expires (7 days) — middleware can't query the database (Edge Runtime), so it relies entirely on the JWT's embedded `roles` claim.
- There is no self-registration endpoint by design — the only way to create the first user is `prisma/seed.ts`; further users are created by an admin (Epic 3's account-creation flow, once built).
- The whole app is dynamically rendered (no static prerendering) because `app/layout.tsx` reads a cookie on every request (`sidebar_collapsed`, and indirectly the session). This is an accepted tradeoff, not a bug.

## Authentication Architecture

- **Session model**: stateless JWT, signed with `jose` (HS256), stored in an httpOnly cookie (`session`) — `path=/`, `sameSite=lax`, `secure` in production only, 7-day expiry. No `Session` table.
- **JWT payload**: `sub` (user id), `email`, `roles` (array of role names). Deliberately no profile data — the token is edge-safe and small.
- **`lib/auth.ts`**: sign/verify + cookie config. No Prisma import — this is what makes it safe to use inside `middleware.ts` (Edge Runtime, no DB access).
- **`lib/permissions.ts`**: single source of truth for the role → permission matrix (`admin`: full wildcard access to every resource; `staff`: read/write on customers, workflow, tax, documents — no delete, no finance/reports/employees/settings). Consumed by `prisma/seed.ts` to populate real `Permission`/`Role` rows.
- **`middleware.ts`**: public paths (`/login`, `/api/auth/*`, `/_next/*`, `/favicon.ico`) pass through; everything else requires a valid session (redirect to `/login` for pages, 401 JSON for API routes); `/settings`, `/employees`, `/reports`, `/finance` additionally require the `admin` role (redirect to `/dashboard`, or 403 JSON for API routes). Injects an `x-pathname` request header on every pass-through so `app/layout.tsx` can suppress the sidebar on `/login`.
- **First user**: `prisma/seed.ts`, reads `AUTH_ADMIN_EMAIL`/`AUTH_ADMIN_PASSWORD` from the environment, idempotent (exits successfully if that email already exists).

## Dashboard Architecture

- `app/dashboard/page.tsx` is the single, official dashboard (`app/page.tsx` permanently redirects `/` → `/dashboard`).
- Data comes from `/api/workflow` (all `CustomerTask` rows, unfiltered) and `/api/activity` — no separate aggregation endpoints; all KPI/chart/calendar derivation happens client-side from these two real responses.
- `components/dashboard/charts/` is the only place that imports from `recharts` — `ChartCard` (shared card + table-view toggle), `ChartTooltip`, `ChartLegend`, `ChartContainer` (wraps `ResponsiveContainer`), `chartPalette` (CSS-var tokens, validated for CVD-safety and contrast), and the 4 named chart components. Nothing else imports Recharts directly.
- The interactive calendar (`OfficeHubCalendar`) marks task-deadline days and supports click-to-filter, lifting `selectedDate` state up into `app/dashboard/page.tsx`.

## Verification Workflow

After every milestone (not just every epic):

```bash
npm run lint
npx tsc --noEmit
npm run build
```

All three must pass before continuing. If any fails: stop, fix the root cause, re-run all three — do not proceed on a partial pass. For features with real runtime behavior (auth, mutations), also do a live functional check against the dev server — static checks alone don't prove a login flow or a redirect actually works.

## Commit Workflow

Before every commit, show: files created, files modified, architecture impact, verification results, and known limitations. Never stage unrelated files (pre-existing baseline changes, files from a different epic). Never expand scope inside a commit beyond what was actually asked for. See `docs/GIT_WORKFLOW.md` for the full checklist.

## Future Roadmap

1. Epic 3 — Employee Management (next)
2. Epic 4 — Document Management (schema decision required)
3. Epic 5 — Workflow Automation
4. Epic 6 — Finance (schema decision required)
5. Epic 7 — Reports (may require a schema decision)
6. Epic 8 — Notifications (schema decision required, not yet scoped in detail)
7. Epic 9 — AI Assistant (not yet scoped in detail)
8. Epic 10 — Production Deployment (not yet scoped in detail)
9. Permission enforcement retrofit across existing APIs (currently deferred technical debt)
10. Sidebar role-aware link visibility (currently deferred technical debt)
