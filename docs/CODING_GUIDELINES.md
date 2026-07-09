# Coding Guidelines

Long-term coding standards, derived from what this codebase actually does today — not aspirational conventions invented for this document. Where something isn't yet used in practice (Server Actions, automated tests, lazy loading), that's stated explicitly rather than presented as if it exists.

## Folder Conventions

See `docs/PROJECT_STRUCTURE.md` for the full folder-by-folder reference. Summary: `repositories/` → `services/` → `app/api/` → UI, with `types/`, `validators/`, `utils/`, and `lib/` as shared cross-cutting folders.

## Naming Conventions

| Kind | Convention | Real examples |
|---|---|---|
| **Repository file** | `<domain>.repository.ts`, lowercase | `customer.repository.ts`, `workflow.repository.ts`, `auth.repository.ts`, `employee.repository.ts` |
| **Repository export** | `<domain>Repository` (camelCase object) | `customerRepository`, `workflowRepository` |
| **Service file** | `<domain>.service.ts`, lowercase | `customer.service.ts`, `auth.service.ts`, `activity.service.ts` |
| **Service export** | `<domain>Service` (camelCase object) | `customerService`, `authService` |
| **Type file** | `<domain>.ts` inside `types/` | `types/customer.ts`, `types/workflow.ts`, `types/auth.ts` |
| **Type export** | PascalCase interface/type, descriptive of the read model | `CustomerRow`, `CustomerDetail`, `WorkflowTask`, `AuthUser`, `SessionPayload` |
| **Validator file** | `<domain>.ts` inside `validators/` | `validators/customer.ts`, `validators/auth.ts` |
| **Validator export** | `<domain><Action>Schema` + its inferred type | `customerCreateSchema`, `loginSchema`, `type LoginInput = z.infer<typeof loginSchema>` |
| **API route file** | `route.ts`, inside a folder named for the URL path segment (Next.js convention) | `app/api/customers/route.ts`, `app/api/customers/[id]/route.ts`, `app/api/auth/login/route.ts` |
| **Feature component** | PascalCase file matching the exported component name | `CustomerForm.tsx`, `WorkflowTaskTable.tsx`, `ChartCard.tsx` |
| **shadcn/ui primitive** | lowercase-kebab file, PascalCase export (shadcn's own convention, distinct from feature components) | `button.tsx` → `Button`, `alert-dialog.tsx` → `AlertDialog` |
| **Hook** | `use<Name>`, camelCase, typically co-located with what it supports | `useToast` (in `components/ui/use-toast.tsx`) |
| **Utility** | camelCase function, in `utils/` or `lib/` depending on whether it's domain-agnostic (`utils/`) or infra (`lib/`) | `cn()` in `utils/cn.ts`; `signSessionToken()` in `lib/auth.ts` |

## TypeScript Rules

- **Strict mode** is on (`tsconfig.json`) and stays on — never loosen it to silence an error.
- **No `any`.** If a type is genuinely unknown, use `unknown` and narrow it.
- **Prefer `interface` for object shapes**, `type` for unions/aliases (e.g. `RoleName = "admin" | "staff"` must be a `type`; `SessionPayload`/`AuthUser` are `interface`s). This matches current usage — it isn't a rule to retrofit, but the default going forward.
- **Shared types live in `types/`** — no type describing a domain read model may be defined inline in a component or service file once it has (or should have) a canonical home.
- **No duplicated interfaces.** This was a real bug (ADR-005), not a hypothetical — check `types/` before defining a new shape that looks like it might already exist.

## React Rules

- **Small components.** Extract a sub-component rather than growing one file indefinitely — e.g. `Sidebar.tsx`'s `SidebarNav` exists specifically so desktop and mobile don't duplicate the menu-rendering logic.
- **Composition over configuration** where it fits — `ChartCard` takes `children` rather than a dozen props trying to describe every possible chart body.
- **Server Components by default.** Only add `"use client"` when the component genuinely needs interactivity, browser APIs, or React hooks.
- **Client Components only when needed** — and only as deep in the tree as necessary; don't mark a whole page `"use client"` just because one small piece of it needs interactivity, if that piece can be extracted instead.

## Next.js Rules

- **Server Actions are not currently used anywhere in this codebase.** All mutations go through `app/api/*` routes called via `fetch()`. If Server Actions are introduced later, they must follow the same rule as API routes: call a service, never Prisma directly.
- **API Routes** are the thin HTTP layer — parse, validate (Zod), call one service method, respond via `lib/api-error.ts`.
- **Middleware** (`middleware.ts`) runs on the Edge Runtime — no Prisma, no Node-only APIs. See `docs/SECURITY.md` and ADR-002.
- **Layouts** — `app/layout.tsx` is the single root layout and currently reads cookies on every request (session + sidebar state), which makes the whole app dynamically rendered. This is a deliberate, accepted trade-off (ADR-007), not something to "fix" without revisiting that decision.
- **Loading states** — this project does **not** use Next.js's `loading.tsx` file convention. Instead, pages render an inline `Skeleton` component while `useEffect`-driven client-side fetches are in flight. Follow the existing pattern rather than introducing `loading.tsx` inconsistently.
- **Error pages** — similarly, no custom `error.tsx` boundary is used. Errors are surfaced via an inline `ErrorState` component and/or a toast notification. Follow this existing pattern.

## Prisma Rules

- **Repositories only** — see `docs/DEVELOPMENT_RULES.md` and ADR-006.
- **Transactions** — `prisma.$transaction()` is not currently used anywhere in this codebase (no multi-step mutation has needed atomicity yet). When one does, wrap it inside the relevant repository method, not split across multiple separate calls from a service.
- **Pagination** — there is **no server-side pagination** yet. `employeeRepository.findAll()` / `customerRepository.findAll()` fetch the entire table, and `CustomerTable.tsx` paginates client-side over the full result set. This is a known scalability limitation, not a pattern to be proud of — flag it if a table's data volume becomes large enough to matter.
- **Filtering** — `workflowRepository.findTasks(filters)` is the model to follow: build a `Prisma.<Model>WhereInput` conditionally from an optional filters object, server-side.
- **Searching** — currently **inconsistent**: `workflowRepository` does server-side `contains` search via Prisma; `CustomerTable.tsx` does client-side substring search over the already-fetched full list. New search features should default to the server-side (`workflowRepository`) pattern, especially once server-side pagination is added — client-side search only works because the full customer list is small enough to fetch entirely today.

## Performance Rules

- **Memoization** — `useMemo` is used for values that shouldn't be recomputed every render (e.g. today's date, derived month buckets in `OfficeHubCharts.tsx`). Use it for genuinely expensive or reference-stability-sensitive computations, not reflexively on every value.
- **Lazy loading / dynamic imports** — **not currently used anywhere** in this codebase (no `next/dynamic` calls). Worth considering if a future heavy, rarely-used component (e.g. a rich document viewer in Epic 4) would otherwise bloat the initial bundle.
- **Bundle size** — `recharts` is the heaviest dependency added so far. There is no bundle-analysis tooling configured yet; if bundle size becomes a concern, that's a gap to close before adding another large dependency.

## Testing Rules

- **Verification Gate** is the mandatory baseline for every change: `npm run lint`, `npx tsc --noEmit`, `npm run build`, all passing.
- **Acceptance tests** are currently manual, tracked in `docs/TEST_CHECKLIST.md` — feature/expected-result/status tables per area, with `curl` command examples for API-level checks.
- **Regression tests** — **no automated test suite exists** (`tests/` is empty, no test framework installed). This is tracked as technical debt in `docs/PROJECT_CHECKPOINT.md`, not a style choice — introducing a test framework is a decision that should be raised explicitly (per the Stopping Rules in `docs/CONTRIBUTING_AI.md`) rather than assumed.
