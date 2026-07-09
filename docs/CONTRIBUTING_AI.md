# Contributing — AI Development Guide

Development guide for **every** AI assistant working on this codebase — Claude, ChatGPT, Gemini, Copilot, Cursor, Windsurf, or any future assistant. The rules here apply regardless of which tool is doing the work. `.ai/CLAUDE_RULES.md` is a condensed version of this same guidance for quick reference at the start of a session.

## General Rules

- **Always understand the architecture first.** Read `docs/PROJECT_CHECKPOINT.md`, `docs/ARCHITECTURE.md`, and this file before writing code — not after something breaks.
- **Never modify unrelated files.** A change's diff should match its stated purpose exactly.
- **Never expand scope.** If a task reveals adjacent work (a bug, a missing feature, a related file), name it explicitly and ask — don't fold it in silently.
- **Never invent missing functionality.** If a feature, endpoint, or model doesn't exist, say so — don't assume it exists or build a workaround that pretends it does.
- **Never assume implementation.** Check the actual current file before describing or building on top of it.
- **Always verify current code.** Read the file, run a search, check `git status` — don't rely on a prior summary (yours or someone else's) that may be stale.

## Architecture Rules

```
repositories/   →   services/   →   app/api/   →   UI
   Prisma            business          thin
   only               logic             HTTP
```

- No Prisma outside `repositories/`.
- No business logic inside API routes.
- Shared types only — `types/`, one canonical interface per read model.
- Shared validators only — `validators/`, one Zod schema per domain.
- Reusable components only — check `components/ui/*` and existing feature components before writing a new one.

See `docs/DEVELOPMENT_RULES.md` for the full rule set with rationale.

## Development Workflow

- Small milestones only. A milestone is a coherent, independently verifiable unit of work — not "the whole epic."
- Never implement an entire epic in one pass, even if the full scope is already known and approved.
- Run the Verification Gate after **every** milestone, not just at the end.

## Verification Gate

```bash
npm run lint
npx tsc --noEmit
npm run build
```

**If any command fails:**
1. STOP.
2. Fix the root cause.
3. Run the Verification Gate again.
4. Continue only when all three pass.

For features with real runtime behavior (auth, mutations, middleware), a live functional check against the running dev server is part of verification — passing static checks proves the code compiles, not that the feature works.

## Commit Rules

Before every commit, show:
- Files Created
- Files Modified
- Architecture Impact
- Verification (results of the gate above)
- Known Limitations

Never commit unrelated files — stage explicitly by path. See `docs/GIT_WORKFLOW.md` for the full checklist and commit message format.

## Stopping Rules

Stop and ask before proceeding when:
- A **schema decision** is required (new model, new field, migration strategy).
- An **architecture decision** is required (new pattern, new dependency, new cross-domain interaction).
- A **business rule is ambiguous** (e.g., which role can access a given page — this has happened before in this project and was resolved by asking, not guessing).
- The **permission model is unclear** for a new feature.
- **Authentication scope changes** (anything that touches who can log in, how sessions work, or what a role/permission means).

In every case: present the decision point clearly, with the real alternatives, and wait for approval before writing code.

## Documentation Rules

Keep these current as work progresses — they are the project's actual memory across sessions and across different AI assistants:
- `docs/PROJECT_CHECKPOINT.md`
- `docs/EPIC_PROGRESS.md`
- `docs/CHANGELOG.md`
- `docs/ARCHITECTURE.md`

Update them as part of finishing an epic or milestone, not as an afterthought. If a new architectural decision is made, add an ADR to `docs/ARCHITECTURE_DECISIONS.md` rather than only mentioning it in a commit message.

## Epic Workflow

This is the authoritative epic list, consistent across `docs/PROJECT_CHECKPOINT.md`, `docs/EPIC_PROGRESS.md`, and `.ai/CLAUDE_RULES.md`.

**Completed Epics:**
- Epic 1 — Dashboard
- Epic 2 — Authentication

**Current Epic:**
- Epic 3 — Employee Management

**Future Epics:**
- Epic 4 — Document Management
- Epic 5 — Workflow Automation
- Epic 6 — Finance
- Epic 7 — Reports
- Epic 8 — Notifications
- Epic 9 — AI Assistant
- Epic 10 — Production Deployment
