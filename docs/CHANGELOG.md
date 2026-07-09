# Changelog

## Epic 2 — Authentication

- Added stateless JWT authentication (`jose`, httpOnly cookie, 7-day expiry, `sameSite=lax`, `secure` in production only). No `Session` model, no migration.
- New: `lib/auth.ts` (sign/verify/cookie config, edge-safe), `lib/permissions.ts` (role → permission matrix, single source of truth), `types/auth.ts`, `validators/auth.ts`, `repositories/auth.repository.ts`, `services/auth.service.ts` (`login`, `logout`, `getCurrentUser`, `hasRole`), `app/api/auth/{login,logout,me}/route.ts`, `middleware.ts`, `prisma/seed.ts`.
- Two roles seeded: `admin` (full access to every resource) and `staff` (read/write on customers, workflow, tax, documents; no delete/wildcard; no finance, reports, employees, or settings). No self-registration endpoint — the only way to create a user is `prisma/seed.ts` (idempotent, reads `AUTH_ADMIN_EMAIL`/`AUTH_ADMIN_PASSWORD`).
- `middleware.ts` protects every route except `/login` and `/api/auth/*`; unauthenticated page requests redirect to `/login`, unauthenticated API requests get 401 JSON. Admin-only pages redirect non-admins to `/dashboard` (403 JSON for API).
- Replaced the `/login` stub with a real form (React Hook Form + Zod, same pattern as `CustomerForm`); the app shell now hides the `Sidebar` on `/login` via an `x-pathname` header middleware injects.
- Verified the full flow live against the dev server, not just lint/build/tsc: unauthenticated redirect/401, wrong-password rejection, successful login + cookie issuance, authenticated access to a protected page and an admin-only page, logout clearing the cookie, and the seed script's idempotent re-run.
- Fixed a bug found during that verification: the `x-pathname` header was only injected on the final middleware return path, so `/login` (an early-return public path) never got it, and the sidebar kept rendering there.
- Moved the Prisma seed command from the deprecated `package.json#prisma` field to `prisma.config.ts`'s `migrations.seed`, avoiding a new deprecation warning.
- Known gap: `Sidebar.tsx` doesn't hide admin-only links from `staff` users yet — the route is blocked server-side, but the link is still visible.

## Epic 1.1 — Complete Office Hub Dashboard

- **Responsive application shell**: `components/layout/Sidebar.tsx` now renders a collapsible desktop sidebar (icon-only/full-width toggle) and a mobile off-canvas drawer (shared `Sheet` primitive) behind a hamburger trigger, sharing one `SidebarNav` menu definition. Collapse state persists via a `sidebar_collapsed` cookie read server-side in `app/layout.tsx`, avoiding a hydration flash (at the cost of the whole app losing static prerendering, since the root layout now reads per-request cookies).
- **Monthly charts**: added `recharts` as the single charting library. Built a shared chart-primitives set (`ChartCard`, `ChartTooltip`, `ChartLegend`, `ChartContainer`, `chartPalette`) under `components/dashboard/charts/`, plus four chart components — Tasks by Month (line), Completed vs Overdue (bar, status colors), Task Status Distribution (donut), Tax Filing Status (stacked bar) — composed in `OfficeHubCharts.tsx`. All data is derived client-side from the real `WorkflowTask[]` array already fetched from `/api/workflow`; no new API calls, no mock data. Palette validated against the dataviz skill's CVD/contrast checks for both light and dark tokens (dark tokens defined but currently unused — no theme toggle exists in the app yet).
- **Interactive calendar**: `OfficeHubCalendar` now marks days with a task deadline, shows a dot indicator, and is clickable — selecting a date filters a new "งานตามวันที่เลือก" section on the dashboard; removed a pre-existing redundant nested `Card` wrapper in the process.
- **Tax deadline dashboard**: new `TaxDeadlineDashboard` component breaks down tasks due within 7 days by tax type (VAT, PND1, PND3, PND53, SSO), resolving the earlier audit finding that "upcoming tax deadlines" wasn't actually tax-type-aware.
- **Activity logging**: added `activityRepository.create()` and `activityService.logActivity()` (best-effort, swallows its own errors so a logging failure never masks a successful mutation). Wired into `customer.service.ts` for create/update/delete. Workflow-update and document-upload logging are **not** wired — there is no task-mutation endpoint yet (Epic 3 scope) and no `Document` model or upload endpoint yet (Epic 4 scope, needs a schema decision).
- Cleaned up 3 orphaned dashboard components (`DeadlineCard`, `TaskCard`, `OfficeHubSection`) with zero importers anywhere in the codebase.
- Verified `npm run lint`, `npm run build`, and `npx tsc --noEmit` all pass clean after each step.

## Technical Debt & Architecture Cleanup (pre-Sprint 5)

- Removed the obsolete static `app/page.tsx` dashboard (hardcoded mock data); `/` now permanently redirects to the real, live `/dashboard` (Office Hub). Updated the Sidebar's Dashboard link to `/dashboard` to match.
- Deleted dead/duplicate files: empty `components/DashboardCard.tsx` and `components/Header.tsx` stubs, empty `app/LICENSE`, and the divergent draft `app/CONTRIBUTING.md`.
- Reorganized shared layout components into `components/layout/` (`Sidebar`, `Providers`).
- Fixed a bug where `Providers` (which mounts `ToastProvider`) was never rendered in `app/layout.tsx` — every `toast()` call across the app was silently a no-op. Wiring it in surfaced a second latent bug: `ToastProvider` called `createPortal(..., document.body)` unconditionally, which crashed static prerendering; fixed by gating the portal behind a client-mount check.
- Replaced inline `style` props in `app/layout.tsx` with Tailwind utility classes, matching the rest of the codebase.
- Moved `lib/utils.ts` → `utils/cn.ts` and `lib/validators/customer.ts` → `validators/customer.ts`; `lib/` now holds only server infra (`prisma.ts`, `api-error.ts`).
- Added `types/customer.ts` and `types/workflow.ts`, consolidating interfaces that were previously hand-duplicated across services and components (`CustomerRow`, `CustomerWithDetails` → `CustomerDetail`, `WorkflowTaskPayload`/`WorkflowTaskRow` → `WorkflowTask`).
- Added `repositories/employee.repository.ts` (standard CRUD only) ahead of the Employee feature, since the `Employee` Prisma model already exists. No service or UI yet — intentionally deferred until the feature is built.
- Added `lib/api-error.ts`, a centralized API error-response helper with structured server-side logging (Thai user-facing messages preserved). Applied it to all four API routes and added proper 404 handling for not-found customers.
- Fixed inconsistent Next.js params handling: `app/customers/[id]/page.tsx` and `app/workflow/[id]/page.tsx` now treat `params` as a `Promise` and `await` it, matching the API routes' existing convention.
- Fixed a `tsc` typing error in `components/dashboard/DashboardCard.tsx` (`Record` keyed by an optional union type).
- Untracked `prisma/dev.db` from git and added it to `.gitignore`; the local database file remains on disk untouched.
- Verified `npm run lint`, `npm run build`, and `npx tsc --noEmit` all pass clean.

## Sprint 4 - Quality Sprint

- Added loading skeletons, empty states, and error states for customer and workflow pages.
- Standardized spacing, typography, and responsive layout across the app.
- Added global toast notifications for user-facing success and error feedback.
- Improved code quality by removing unused variables and narrowing type usage.
- Refactored the customer edit flow to use `CustomerForm` and proper client-side data loading.

## Sprint 3 - Monthly Workflow

- Added monthly workflow dashboard page with shadcn/ui cards, filters, and workflow table.
- Implemented workflow filters for month, year, status, customer, employee, and search.
- Added progress bar and status badges to workflow tasks.
- Extended `CustomerTask` with `status`, `progress`, `deadline`, `completedAt`, `assignedEmployeeId`, `remarks`, and `priority`.
- Built reusable workflow components: `WorkflowStatusBadge`, `WorkflowProgressBar`, `WorkflowSummary`, and `WorkflowFilters`.
- Updated workflow repository and service to support strict filters and normalized task payloads.
- Verified full build passes.

## Sprint 2 - Dashboard and Authentication

- Added login page and dashboard entry point.
- Created shared `Header`, `Sidebar`, and layout components.
- Added summary navigation for core modules: customers, workflow, documents, finance, reports, employees, settings.
- Established next app router structure and app-wide global styles.

## Sprint 1 - Customer Module

- Built customer CRUD with list, detail, create, edit, and delete.
- Added customer validation with Zod and React Hook Form.
- Implemented a customer table with search and pagination support.
- Added Prisma persistence for customer records and a SQLite database.
- Verified application build and linting configuration.

## Sprint 5 - Office Hub

- Added a new Office Hub dashboard under `app/dashboard/page.tsx`.
- Implemented KPI cards, today's tasks, overdue tasks, upcoming deadlines, document waiting tasks, notifications, a calendar widget, and recent activities.
- Reused workflow and customer data from existing APIs.
- Added dashboard UI components and updated Office Hub styling using shadcn/ui.
- Verified lint passes and resolved type errors.
