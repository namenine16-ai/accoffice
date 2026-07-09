# Project Structure

Complete folder-by-folder reference. See `docs/ARCHITECTURE.md` for the current-state architecture summary and `docs/DEVELOPMENT_RULES.md` for the rules this structure enforces — this document focuses on *what belongs where*.

## Architecture Flow

```
repositories/   →   services/   →   app/api/   →   UI (pages / components)
   Prisma            business          thin              presentation
   only               logic             HTTP
```

Data flows in one direction only. A UI component calls an API route (via `fetch`, or a server component reading a service directly); the API route calls exactly one service method; the service calls its own repository (or another domain's *service*, never another domain's repository); the repository is the only place that imports Prisma.

## Folder Reference

### `app/`
**Purpose:** Page routes and API routes (Next.js App Router).
**Allowed:** Rendering UI, calling `fetch()` against `app/api/*`, reading a service directly in a server component (two narrow legacy exceptions — see `docs/ARCHITECTURE.md`), parsing/validating a request and calling one service (inside `app/api/*`).
**Forbidden:** Business logic beyond parse → call service → respond; direct Prisma access (outside the two documented legacy exceptions); duplicating a component or type that already exists elsewhere.
**Typical examples:** `app/dashboard/page.tsx`, `app/api/customers/route.ts`, `app/api/auth/login/route.ts`.

### `components/`
**Purpose:** Shared and feature-specific UI components.
**Allowed:** Presentation, client-side state/interaction, calling API routes.
**Forbidden:** Prisma access, business logic that belongs in a service.
**Typical examples:**
- `components/ui/` — shadcn/ui primitives (Button, Card, Table, Sheet, Dialog, ...). Always check here before writing a new low-level component.
- `components/layout/` — app shell (`Sidebar`, `Providers`), mounted once in `app/layout.tsx`.
- `components/dashboard/` — dashboard widgets; `components/dashboard/charts/` is the only folder that imports `recharts` directly (see ADR-004).
- `components/customer/`, `components/workflow/`, `components/employee/` — one folder per domain's feature components (forms, tables).

### `repositories/`
**Purpose:** The only layer allowed to import Prisma.
**Allowed:** `findAll`, `findById`, `create`, `update`, `delete`, and query-filter methods actually in use by a service.
**Forbidden:** Business logic, validation, HTTP concerns, calling another repository's domain directly.
**Typical examples:** `repositories/customer.repository.ts`, `repositories/workflow.repository.ts`, `repositories/auth.repository.ts`, `repositories/employee.repository.ts`.
**Rule:** A repository is only created once its Prisma model exists (or is being added alongside it) — no speculative repositories for models that don't exist yet (e.g. no `tax.repository.ts` or `document.repository.ts` until those models are added).

### `services/`
**Purpose:** Business logic.
**Allowed:** Calling its own domain's repository, calling other services (composition — e.g. `customer.service.ts` calls `activityService.logActivity()`), throwing typed errors for the API layer to translate into responses.
**Forbidden:** Importing Prisma directly, JSX/UI logic.
**Typical examples:** `services/customer.service.ts`, `services/workflow.service.ts`, `services/auth.service.ts`, `services/activity.service.ts`, `services/employee.service.ts`.

### `validators/`
**Purpose:** Zod schemas — the single source of truth for input shape/validation per domain.
**Allowed:** Schema definitions and their inferred types.
**Forbidden:** Duplicating a schema that already exists for the same domain; business logic.
**Typical examples:** `validators/customer.ts`, `validators/auth.ts`, `validators/employee.ts`.

### `types/`
**Purpose:** Shared domain types — one canonical interface per read model.
**Allowed:** Type/interface definitions consumed by services and UI alike.
**Forbidden:** Redefining a shape that already has a canonical type elsewhere (see ADR-005 — this was a real bug, not a hypothetical).
**Typical examples:** `types/customer.ts` (`CustomerRow`, `CustomerDetail`), `types/workflow.ts` (`WorkflowTask`), `types/auth.ts` (`AuthUser`, `SessionPayload`, `RoleName`).

### `utils/`
**Purpose:** Framework-agnostic helper functions with no domain knowledge.
**Allowed:** Pure functions like `cn()` (class name merging).
**Forbidden:** Anything that needs Prisma, a service, or domain-specific logic — that belongs in `services/` or `lib/`, not here.
**Typical examples:** `utils/cn.ts`.

### `lib/`
**Purpose:** Low-level, cross-cutting infrastructure that isn't domain business logic but also isn't a generic utility.
**Allowed:** The Prisma client singleton, the centralized API error helper, JWT/session primitives, the permission matrix.
**Forbidden:** Domain-specific business logic (that's a service's job).
**Typical examples:** `lib/prisma.ts` (Prisma client singleton), `lib/api-error.ts` (centralized error responses), `lib/auth.ts` (JWT sign/verify + cookie config — edge-safe, no Prisma import, which is what makes it usable inside `middleware.ts`), `lib/permissions.ts` (role → permission matrix, single source of truth).

### `middleware.ts` (project root, not a folder)
**Purpose:** Route protection, running on Next.js's Edge Runtime.
**Allowed:** Reading/verifying the session cookie via `lib/auth.ts`, redirecting or returning 401/403.
**Forbidden:** Any Prisma or database access — the Edge Runtime cannot reach it; all authorization decisions must come from the JWT's own claims.

### `prisma/`
**Purpose:** Database schema, seed data.
**Contents:** `schema.prisma` (models), `seed.ts` (idempotent seed script, run via `npx prisma db seed`), `dev.db` (local SQLite file — gitignored, never committed).
**Note:** There is currently no `prisma/migrations` directory; schema changes are applied via `prisma db push`, not versioned migrations (tracked as technical debt).

### `docs/`
**Purpose:** Project documentation — the primary reference for both humans and AI assistants working on this codebase.
**Contents:** Architecture, database, changelog, checkpoint/progress tracking, development/git rules, security, coding guidelines, ADRs (this folder — see the index implied by file names, or `docs/PROJECT_CHECKPOINT.md` for a full map).

### `.ai/`
**Purpose:** Permanent, condensed AI development context — the first thing an AI assistant should read at the start of a session.
**Contents:** `CLAUDE_RULES.md` (and, per `docs/CONTRIBUTING_AI.md`, guidance intended to apply to any AI assistant working on this repo, not only Claude).

### `scripts/`
**Purpose:** Reserved for standalone automation scripts (database setup helpers, code generation, deployment automation).
**Current status:** Empty — nothing has been added here yet.

### `tests/`
**Purpose:** Reserved for automated test suites.
**Current status:** Empty — no test framework is installed yet (tracked as technical debt in `docs/PROJECT_CHECKPOINT.md`). Manual/functional acceptance checklists currently live in `docs/TEST_CHECKLIST.md` instead.

## How Data Flows — Worked Example

A customer creation request, end to end:

1. **UI** — `CustomerForm` (client component) submits, `fetch("/api/customers", { method: "POST", body })`.
2. **API** — `app/api/customers/route.ts`'s `POST` handler parses the JSON body and calls `customerService.createCustomer(data)`. It does not touch Prisma and does not contain business rules.
3. **Service** — `customer.service.ts`'s `createCustomer()` calls `customerRepository.create(data)`, then calls `activityService.logActivity(...)` to record the action. This is where "what should happen when a customer is created" logic lives.
4. **Repository** — `customer.repository.ts`'s `create()` calls `prisma.customer.create({ data })` and returns the result. It contains no logic beyond shaping the Prisma call.
5. The API route wraps the service call in a `try/catch`, translating any error into a standardized JSON response via `lib/api-error.ts`, and returns the created customer with a `201` status on success.
