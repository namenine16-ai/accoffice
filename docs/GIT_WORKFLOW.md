# Git Workflow

## Branch Strategy

Single-branch: `main`. All work lands directly on `main` via precisely scoped commits — no feature branches are currently in use. Tags mark shipped milestones (e.g. `v1.1.0` for the completed Office Hub dashboard).

## Commit Strategy

- One commit per coherent unit of work (a cleanup pass, an architecture refactor, a completed epic/milestone) — not one commit per file, not one giant commit per epic.
- **Never commit unrelated files.** A commit's staged files must match its message exactly. Pre-existing baseline changes, files from a different epic, or unrelated cleanup do not ride along.
- Stage files explicitly by path (`git add <specific files>`), not `git add -A` or `git add .` — this project has a lot of untracked pre-existing scaffolding that should not be swept into an unrelated commit.

## Verification Gate

No commit happens until all three pass:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Pre-Commit Checklist

Before every commit, show:

1. **Files created**
2. **Files modified**
3. **Architecture impact** — anything that changes how layers interact, adds a dependency, or affects rendering/runtime behavior (e.g. "this makes every route dynamic" or "this is the only file allowed to import Recharts")
4. **Known limitations** — what this commit deliberately does not do, and why

## Commit Message Format

```
<short imperative summary, present tense>

- <bullet: what changed>
- <bullet: what changed>
- <bullet: notable decision or tradeoff>

Verified:
- npm run lint
- npx tsc --noEmit
- npm run build

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```

Examples already used in this project: `Clean up dashboard components and relocate shared utilities`, `Architecture refactor and shared type consolidation`, `feat(dashboard): complete Office Hub dashboard`.

## Architecture Review

Before staging, re-check the diff against `docs/DEVELOPMENT_RULES.md`:
- Does anything touch Prisma outside `repositories/`?
- Does any API route contain logic beyond parse → call service → respond?
- Did a type or validator get duplicated instead of shared?
- Did scope quietly expand beyond what was asked?

If any answer is yes, fix it before committing — don't note it as debt and move on unless that deferral was an explicit, agreed decision.

## Git Workflow — Before Commit

1. **`git status`** — see the true current state, don't assume.
2. **Verification** — `npm run lint`, `npx tsc --noEmit`, `npm run build`, all passing.
3. **Review** — files created, files modified, architecture impact, known limitations (see checklist above).
4. **Commit** — scoped `git add`, descriptive message per the format above.
5. **Push** — only when explicitly requested; confirm the target remote/branch first (`git remote -v`, `git branch --show-current`).

Never commit unrelated files. Never force-push. Never amend a commit unless explicitly asked to.
