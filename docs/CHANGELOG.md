# Changelog

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
