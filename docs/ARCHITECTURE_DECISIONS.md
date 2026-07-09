# Architecture Decision Records (ADR)

This log records **why** each significant architectural decision was made — not just what was built. See `docs/ARCHITECTURE.md` for the current-state description and `docs/PROJECT_CHECKPOINT.md` for overall project status; this file explains the reasoning behind them, so it isn't duplicated here.

---

## ADR-001 — Repository → Service → API → UI architecture

**Status:** Accepted
**Date:** 2026-07-09

**Context:** The application needed a consistent way to separate data access, business logic, HTTP handling, and presentation as it grew past a handful of pages, so that logic could be reused (e.g. between an API route and a server-rendered page) and tested independently of Next.js request/response plumbing.

**Decision:** Enforce a strict one-directional layering: `repositories/` (Prisma only) → `services/` (business logic only) → `app/api/*` (thin HTTP layer) → UI (presentation only). Each layer may only call the layer directly beneath it (or, for services, another service).

**Alternatives Considered:**
- *Direct Prisma access from API routes/Server Components.* Faster to write for a single CRUD endpoint, but couples business logic to the HTTP/UI layer and makes it impossible to reuse the same logic from two call sites without duplicating it.
- *Full CQRS / event sourcing.* Considered and rejected as significant over-engineering for an application of this size.

**Consequences:** Every new feature requires more files up front (repository + service + route + validator + types) than a single all-in-one handler would.

**Trade-offs:** More boilerplate per feature, in exchange for a codebase where business logic is testable in isolation, Prisma is swappable behind one boundary, and the same service can be called from multiple UI surfaces without duplicating logic.

**Future implications:** New epics (Documents, Finance, Reports) must follow the same layering. Any deviation should produce its own ADR explaining why.

---

## ADR-002 — JWT authentication instead of database-backed sessions

**Status:** Accepted
**Date:** 2026-07-09

**Context:** Epic 2 needed "session-based authentication." Two viable mechanisms existed: a signed, stateless token, or a server-side session record.

**Decision:** Stateless JWT (`jose`), stored in an httpOnly cookie, 7-day expiry. No `Session` Prisma model.

**Alternatives Considered:**
- *Database-backed sessions* (a `Session` model with `userId`, `tokenHash`, `expiresAt`). Allows true server-side revocation and a future "view active sessions" feature, but requires a new model, a migration, and a cleanup strategy for expired rows.

**Consequences:** No schema change or migration was needed. `middleware.ts` can verify a session on Next.js's Edge Runtime, where there is no Prisma/database access at all — verification is a pure JWT-signature check against `AUTH_SECRET`.

**Trade-offs:** A session cannot be force-invalidated before it expires without adding a revocation store later (e.g., a blocklist). A role change for an already-logged-in user only takes effect on their next login or after the token expires — up to 7 days.

**Future implications:** If instant revocation becomes a hard requirement (e.g., "disable this account immediately"), a lightweight revocation blocklist (or a move to DB-backed sessions) will be needed. Tracked in `docs/PROJECT_CHECKPOINT.md` under Known Limitations.

---

## ADR-003 — Cookie-based Sidebar state

**Status:** Accepted
**Date:** 2026-07-09

**Context:** The collapsible desktop sidebar needed its collapsed/expanded state to persist across page loads without a visible flash on first paint.

**Decision:** Store `sidebar_collapsed` in a cookie, read it server-side in `app/layout.tsx` via `next/headers`' `cookies()`, and pass it into `Sidebar` as an `initialCollapsed` prop — so the correct state is present in the very first server-rendered HTML.

**Alternatives Considered:**
- *`localStorage` + `useEffect`.* Simple, but the initial render always assumes the default state, then corrects itself after mount — a visible flash if the stored value differs.
- *`useSyncExternalStore`.* More "React-correct" than `useEffect`, but still requires one corrective re-render after hydration to pick up the real client value — doesn't actually eliminate the flash, just changes which API produces it.

**Consequences:** Zero-flash sidebar state, at the direct cost described in ADR-007.

**Trade-offs:** Traded static page generation app-wide for a flash-free, SSR-correct sidebar. Accepted explicitly as worth it.

---

## ADR-004 — Recharts as the only chart library

**Status:** Accepted
**Date:** 2026-07-09

**Context:** Epic 1 required four distinct chart types (line, bar, donut, stacked bar) with consistent theming, accessible tooltips/legends, and light/dark-ready color tokens.

**Decision:** Add `recharts` as the project's single charting dependency, and wrap it entirely behind shared primitives (`ChartCard`, `ChartTooltip`, `ChartLegend`, `ChartContainer`, `chartPalette` in `components/dashboard/charts/`) so that nothing outside that folder imports from `recharts` directly.

**Alternatives Considered:**
- *Hand-built SVG charts, zero dependency.* Full control, but reimplementing crosshairs, hover/focus tooltips, and accessible legends correctly for four chart types is significant, risky effort for marginal benefit over a maintained library.
- *Other libraries* (Chart.js, visx, nivo). Recharts was chosen for its React-native declarative API, solid TypeScript types, and a footprint appropriate for this app's needs.

**Consequences:** One new runtime dependency; every chart in the app looks and behaves consistently because they all pass through the same shared Tooltip/Legend/Card/Container components.

**Trade-offs:** A library dependency instead of full bespoke control — mitigated by strictly confining `recharts` imports to one folder, so swapping libraries later touches one place, not every chart.

---

## ADR-005 — Shared Types and Shared Validators

**Status:** Accepted
**Date:** 2026-07-09

**Context:** Early in the project, read-model interfaces (e.g. a workflow task's shape) were independently hand-defined in more than one file (a service and a UI component) with slightly different field sets — discovered and fixed during an architecture refactor pass.

**Decision:** Exactly one canonical TypeScript interface per read model, living in `types/`, imported by every consumer. Exactly one Zod schema per domain, living in `validators/`.

**Alternatives Considered:**
- *Co-locating types next to each component that uses them.* Faster to write in the moment, but is exactly what produced the duplication bug this decision fixes — nothing enforces that two independently-defined shapes for the same data stay in sync.

**Consequences:** `types/customer.ts`, `types/workflow.ts`, `types/auth.ts` (and `validators/customer.ts`, `validators/auth.ts`, `validators/employee.ts`) are the single source of truth their domains import from.

**Trade-offs:** Slightly more indirection (an import instead of an inline type) for a meaningful reliability win — a field rename or type change happens in one place and the compiler catches every stale consumer.

---

## ADR-006 — Repository-only Prisma access

**Status:** Accepted (with two documented legacy exceptions)
**Date:** 2026-07-09

**Context:** Two server-component detail pages (`app/customers/[id]/page.tsx`, `app/workflow/[id]/page.tsx`) read Prisma directly, predating the strict repository-only rule.

**Decision:** All new code must access Prisma exclusively through `repositories/`. The two pre-existing pages remain as documented, narrow exceptions — not a precedent for adding more.

**Alternatives Considered:**
- *Retrofit the two existing pages now.* Out of scope for the epics that touched this area; would have expanded scope beyond what was asked.
- *Allow direct Prisma reads wherever convenient.* Rejected — this defeats the entire purpose of the layered architecture and would make the rule meaningless.

**Consequences:** Every new repository is a small, testable, swappable data-access boundary. The two legacy reads are explicitly called out in `docs/ARCHITECTURE.md` so they're a known, bounded exception rather than a silently spreading pattern.

**Trade-offs:** A minor, tracked inconsistency remains in the codebase rather than being fixed immediately — accepted because fixing it wasn't part of the work that surfaced it.

**Future implications:** If either of those two pages needs to change substantially for a future epic, migrating them to the Repository → Service → API pattern at that time is reasonable; don't add a third exception.

---

## ADR-007 — Dynamic rendering caused by RootLayout `cookies()`

**Status:** Accepted
**Date:** 2026-07-09

**Context:** A direct consequence of ADR-002 (session cookie) and ADR-003 (sidebar-state cookie): `app/layout.tsx` reads cookies on every request, and Next.js cannot statically prerender a layout that depends on per-request data — this applies to every page the layout wraps.

**Decision:** Accept full dynamic rendering across the entire application rather than avoid reading cookies in the root layout.

**Alternatives Considered:**
- *Move cookie reads into a Client Component further down the tree.* Reintroduces the hydration flash for the sidebar (ADR-003's whole point was to avoid this).
- *Read the cookie via a separate Server Action or route handler instead of the layout.* Adds a network round-trip and complexity for no real benefit here.

**Consequences:** No route in the app is statically prerendered; every request is server-rendered on demand (confirmed via `next build` output — every route shows `ƒ` (Dynamic), none show `○` (Static)).

**Trade-offs:** Loses CDN-cacheable static HTML for any page that doesn't actually need per-user state, in exchange for correct, zero-flash session and sidebar behavior on every page. Explicitly accepted as the right trade for an internal, authenticated office application (not a public marketing site).

**Future implications:** If a future public, static-friendly page is ever needed (e.g., a marketing/landing page), it would need to live in a route group with its own layout that doesn't read cookies, rather than under the current root layout.

---

## ADR-008 — Permission enforcement deferred from Epic 2

**Status:** Accepted (deferred, not resolved)
**Date:** 2026-07-09

**Context:** `lib/permissions.ts` defines a full resource:action permission matrix (e.g. `customers:read`, `customers:write` for `staff`; `customers:*` for `admin`), and `prisma/seed.ts` seeds real `Permission`/`Role` rows from it. Wiring per-action enforcement into every existing API route (e.g., blocking `staff` from `DELETE /api/customers/[id]`) was explicitly scoped out of Epic 2.

**Decision:** Ship role-level (page-level) gating in `middleware.ts` for Epic 2; defer action-level permission enforcement inside existing API routes to a later pass.

**Alternatives Considered:**
- *Enforce immediately across all existing routes.* Would have expanded Epic 2's scope into modifying already-shipped Epic 1/pre-epic code (customer and workflow routes), beyond what Epic 2 was chartered to do.

**Consequences:** Today, a `staff` user can technically call `DELETE /api/customers/[id]` even though their seeded permission set has no `customers:delete` — middleware only checks role (`admin` vs. `staff`), not the finer-grained permission string.

**Trade-offs:** Faster, cleanly-scoped Epic 2 delivery, at the cost of a real interim security gap.

**Future implications:** **Must be closed before any real `staff` account is used against production data.** Tracked as Technical Debt in `docs/PROJECT_CHECKPOINT.md`. The natural place to close it is when each domain's routes (customers, workflow, documents) are next revisited.

---

## ADR-009 — Workflow assignment belongs to the Workflow domain

**Status:** Accepted
**Date:** 2026-07-09

**Context:** Epic 3 (Employee Management) needs an "Assign Workflow" feature — assigning an employee to a `CustomerTask`. `CustomerTask` (including its `assignedEmployeeId` field) is a Workflow-domain entity, and prior to this decision it had no mutation path at all (no `workflowRepository.update()`, no `PATCH /api/workflow/[id]`).

**Decision:** Extend `repositories/workflow.repository.ts`, `services/workflow.service.ts`, and `app/api/workflow/[id]/route.ts` with an `assignEmployee()` capability, called from the Employee UI — rather than building a parallel mutation path under `employees/`.

**Alternatives Considered:**
- *A separate `app/api/employees/[id]/assign-task` route.* Keeps every employee-triggered action under one namespace, but splits `CustomerTask`'s write path across two domains — the Workflow module would no longer be the single owner of its own model's mutations.

**Consequences:** The Employee UI calls into the Workflow API for this one action; the Workflow module remains the sole owner of all `CustomerTask` writes.

**Trade-offs:** Slightly less "everything about employees lives under `employees/`" convenience, in exchange for correct domain ownership and no duplicated mutation logic for the same model.

**Future implications:** Any future feature that mutates a `CustomerTask` (status changes, progress updates, reassignment) belongs in the Workflow module too, regardless of which UI surface triggers it — this is the pattern to repeat, not a one-off.

---

## ADR-010 — Employee Management creates User accounts (Admin only)

**Status:** Accepted
**Date:** 2026-07-09

**Context:** Epic 2 explicitly decided against a public self-registration endpoint — the only way to create a `User` was `prisma/seed.ts`. Epic 3's "Role assignment" objective raised the question of how any user *besides* the seeded admin ever gets a login.

**Decision:** Employee Management gets an admin-only "create account for this employee" flow: given an `Employee` row with no linked `User` (`userId` is null), an admin can create one (email + initial password + role), reusing and extending the Epic 2 auth infrastructure (`authService`/`authRepository`, `bcryptjs`).

**Alternatives Considered:**
- *A public self-registration endpoint.* Explicitly rejected in Epic 2 and reaffirmed here — this project has no self-service signup by design.
- *Only ever create users via the seed script.* Would make onboarding any real staff member require direct database/CLI access, which doesn't scale past the single seeded admin.

**Consequences:** `services/auth.service.ts` gains a `createAccount()` method; `repositories/auth.repository.ts` gains a `create()` method. This is the first user-creation path beyond the seed script.

**Trade-offs:** Expands the auth surface (more code capable of minting real logins) in exchange for a workable onboarding path that stays strictly admin-gated rather than public.

**Future implications:** Any further user-management feature (password resets, account disable/enable) should route through this same admin-gated surface, not a new one. Permission enforcement (ADR-008) becomes more urgent once more than one non-admin account exists in practice.
