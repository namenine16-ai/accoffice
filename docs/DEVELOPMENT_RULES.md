# Development Rules

These rules govern every change to AccOffice, regardless of which epic or milestone is in progress.

## General Architecture Rules

**Repository → Service → API → UI.** Data and control flow in one direction only.

```
repositories/   Prisma access only
      ↓
services/       Business logic only
      ↓
app/api/        Thin HTTP layer only
      ↓
UI              Presentation only
```

| Layer | May do | May NOT do |
|---|---|---|
| `repositories/` | Call Prisma, shape queries/filters | Business logic, validation, HTTP concerns |
| `services/` | Business logic, call its own repository, call other services | Import Prisma directly, contain UI/JSX logic |
| `app/api/*` | Parse request, validate with Zod, call one service, format the response | Contain business logic, query Prisma directly |
| UI (pages/components) | Render, call `fetch()` against `app/api/*` | Import Prisma, duplicate a shared component |

### Rules

- **No Prisma outside repositories.** If a file needs `import { prisma }`, it belongs in `repositories/`. (Narrow, documented exception: two server-component detail pages read Prisma directly for simple single-record views — see `docs/ARCHITECTURE.md`. No new exceptions without discussion.)
- **No business logic inside API routes.** A route handler parses input, calls exactly one service method, and returns a response via `lib/api-error.ts` on failure.
- **No duplicated interfaces.** One canonical type per read model, in `types/`, imported everywhere it's used. If two files independently define a shape for the same data, that's a bug to fix, not a pattern to follow.
- **Shared types only** — `types/`.
- **Shared validators only** — `validators/`, Zod schemas.
- **Shared UI components only** — reuse `components/ui/*` and existing feature components before creating a new one. Check for an existing match before writing a new component.
- **No mock data.** Every UI reads from a real API backed by a real Prisma query, in every environment, including an empty database.
- **TypeScript strict** — no loosening `tsconfig.json`'s strictness to make an error go away.
- **A repository is only created once its Prisma model exists** (or is being added in the same change). No speculative repositories for models that don't exist.
- **Stop when a schema decision is required.** Don't guess at new Prisma fields/models, migration strategy, or a business rule that isn't already specified. Present the decision and wait.
- **Never expand scope without approval.** If a task reveals adjacent work (a bug, a missing feature, a related file), name it explicitly and ask — don't fold it in silently.

## Verification Rules

Run after **every milestone** — not just at the end of an epic:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

**If any command fails:**
1. STOP.
2. Fix the root cause (not a workaround that hides the symptom).
3. Run all three again.
4. Continue only when all three pass.

For changes with real runtime behavior (authentication, mutations, middleware), a live functional check against the running dev server is part of verification — a clean `tsc`/`build` proves the code compiles, not that the feature works.
