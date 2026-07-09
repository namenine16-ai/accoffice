# Architecture

AccOffice is built as a full-stack Next.js App Router application with a service/repository architecture and Prisma-powered SQLite persistence.

## Application structure

- `app/` contains page routes and server-rendered views. `app/page.tsx` permanently redirects `/` to `/dashboard`, which is the single, official dashboard implementation.
- `components/layout/` contains app-shell components (`Sidebar`, `Providers`) mounted once in `app/layout.tsx`.
- `components/` contains shared UI components, customer forms, tables, dashboard widgets, and workflow components.
- `types/` contains shared domain types (e.g. `types/customer.ts`, `types/workflow.ts`) used by both services and UI components, so a single interface backs each read model instead of parallel hand-maintained copies.
- `validators/` contains Zod schemas (e.g. `validators/customer.ts`).
- `utils/` contains framework-agnostic helpers (e.g. `utils/cn.ts`).
- `services/` contains business logic for customer, workflow, and activity use cases. No Prisma access, no UI logic.
- `repositories/` contains data access wrappers for Prisma and query filtering only — no business logic, no validation, no HTTP. A repository is only added once a Prisma model exists for it (e.g. `employee.repository.ts` exists ahead of the Employee feature/UI because the `Employee` model already exists; there are intentionally no `tax`/`document` repositories yet, since those models don't exist).
- `lib/prisma.ts` exposes the Prisma client; `lib/api-error.ts` provides a centralized API error-response helper with structured server-side logging.
- `components/dashboard/charts/` contains the shared chart primitives (`ChartCard`, `ChartTooltip`, `ChartLegend`, `ChartContainer`, `chartPalette`) and the four Office Hub chart components. `recharts` is the only charting library; nothing outside this folder imports from `recharts` directly — pages and `OfficeHubCharts.tsx` only ever import the named chart components.

## Data flow

1. User actions in UI components trigger forms or filter changes.
2. Client-side pages call API routes in `app/api/`.
3. API routes delegate work to service modules and return standardized JSON responses (via `lib/api-error.ts` on failure).
4. Services use repositories to query or mutate the database.
5. Repositories call Prisma to load or persist entities.

## Technologies

- Next.js 16 App Router
- TypeScript
- Tailwind CSS 4
- shadcn/ui for accessible components
- Prisma ORM with SQLite
- React Hook Form and Zod for forms and validation

## UI conventions

- Use server components as the default page model.
- Use client components only where interactivity or browser APIs are required.
- Reuse `components/ui/*` primitives for buttons, cards, dialogs, tables, and form controls.
- Keep feature views small and delegate form handling to reusable form components.
- Dynamic route pages (`app/**/[id]/page.tsx`) and API routes both receive `params` as a `Promise` and must `await` it before use.
- Pages never access Prisma directly except for the two existing server-component detail pages (`app/customers/[id]/page.tsx`, `app/workflow/[id]/page.tsx`), which read directly for simple, single-record server-rendered views; all mutating flows go through `app/api/*`.
- `app/layout.tsx` reads the `sidebar_collapsed` cookie server-side (via `next/headers`) and passes it into `Sidebar` as `initialCollapsed`, so the collapsed/expanded state renders correctly on the first paint with no client-side flash. This makes every route dynamically rendered (no static prerendering), since the root layout now depends on per-request cookie data.
- Cross-cutting activity logging goes through `activityService.logActivity()`, called by other services after a successful mutation (e.g. `customer.service.ts`). It never throws — a logging failure is caught and logged to the console rather than failing the primary operation.
