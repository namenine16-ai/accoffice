# Claude Rules — AccOffice

Permanent development instructions. Read this before starting any work on this project.

## Architecture

```
repositories/   →   services/   →   app/api/   →   UI
   (Prisma)        (business logic)   (thin HTTP)   (presentation)
```

## Coding Rules

- Never use Prisma outside `repositories/`.
- Never duplicate interfaces — one canonical type per read model, in `types/`.
- Never duplicate validators — Zod schemas live once, in `validators/`.
- Never duplicate components — check `components/ui/*` and existing feature components before writing a new one.
- Prefer shared utilities in `utils/` over inline reimplementation.
- Keep services pure business logic — no Prisma imports, no JSX.
- Keep repositories data-only — `findAll`/`findById`/`create`/`update`/`delete` plus filters actually in use, nothing else.
- Keep APIs thin — parse, validate (Zod), call one service, return via `lib/api-error.ts`.
- Keep UI presentation-only — no direct Prisma access (two narrow, documented exceptions exist; don't add a third without discussion).
- No mock data, ever, in any environment — including an empty database.
- TypeScript strict, no loosening `tsconfig.json` to silence an error.

## Development Rules

- Work in small milestones. Verify after each one — don't wait until an entire epic is "done" to check.
- Never implement an entire epic in one pass.
- Run the Verification Gate after every milestone.
- Never continue past a failed verification — stop, fix the root cause, re-run all three.
- Never silently change architecture (a new dependency, a new pattern, a schema field) without saying so first.
- Always explain architecture impact before editing — what layer this touches, what it changes about how the app runs or renders.
- Stop and ask when a Prisma schema decision, a migration, or a genuinely ambiguous business rule comes up. Don't guess.

## Verification Gate

```bash
npm run lint
npx tsc --noEmit
npm run build
```

All three must pass. For features with real runtime behavior (auth, mutations, middleware), also do a live check against the dev server — a clean build proves compilation, not correctness.

## Git Rules

Before every commit, review and show:
- Files created
- Files modified
- Architecture impact
- Known limitations

Never commit unrelated files — stage explicitly by path, not `-A`. Never force-push. Never amend unless explicitly asked.

## Project Context

| Epic | Status |
|---|---|
| 1 — Dashboard | ✅ Completed |
| 2 — Authentication | ✅ Completed |
| 3 — Employee Management | 🟡 Next (planned, awaiting approval to start) |
| 4 — Document Management | ⬜ Future (needs a schema decision) |
| 5 — Workflow Automation | ⬜ Future |
| 6 — Finance | ⬜ Future (needs a schema decision) |
| 7 — Reports | ⬜ Future (may need a schema decision) |
| 8 — Notifications | ⬜ Future (needs a schema decision, not yet scoped) |
| 9 — AI Assistant | ⬜ Future (not yet scoped) |
| 10 — Production Deployment | ⬜ Future (not yet scoped) |

See `docs/PROJECT_CHECKPOINT.md` for full detail, `docs/EPIC_PROGRESS.md` for per-epic status, `docs/DEVELOPMENT_RULES.md` and `docs/GIT_WORKFLOW.md` for the rules this file summarizes.
