# Development Prompt Library

Reusable prompts for driving AI-assisted development on AccOffice. Each one assumes the assistant has read `CLAUDE.md`, `docs/PROJECT_CHECKPOINT.md`, `docs/DEVELOPMENT_RULES.md`, and `docs/GIT_WORKFLOW.md` first — none of these prompts repeat rules that are already written down there.

## FAST MODE — autonomous epic/milestone execution

Use for a full inspect-through-commit pass with minimal check-ins.

```
FAST MODE

Inspect → Plan → Implement → Verify → Fix → Continue

Do not stop for approval except:
- Prisma schema change
- Migration
- New dependency
- Security decision
- Architecture decision
- Business rule ambiguity

Always:
- Reuse existing architecture
- Repository → Service → API → UI
- Reuse components
- No duplicate logic
- No mock data
- Run:
  npm run lint
  npx tsc --noEmit
  npm run build

Before every commit:
- git status
- Scope audit
- Stage only milestone files
- Show staged files
- Commit
- Report SHA

Never stage unrelated files.
```

## Start the next epic

```
Read docs/PROJECT_CHECKPOINT.md's "Current Epic" section and
docs/EPIC_PROGRESS.md's entry for that epic. Before writing any code,
inspect git status and the working tree for anything already staged
or partially implemented toward this epic — do not assume a clean
slate. Then implement the remaining objectives following FAST MODE.
```

## Resume / continue in-progress work

Use when the working tree has uncommitted or staged changes and it's unclear what's finished.

```
Run git status --short and compare it against docs/EPIC_PROGRESS.md's
current epic objectives. Identify what's already implemented, what's
partially done, and what's missing. Report the gap before writing any
code, then close it following FAST MODE.
```

## Verification only — no new work

```
Do not change any product code. Run:
  npm run lint
  npx tsc --noEmit
  npm run build
If anything fails, stop and report the root cause without fixing it
unless explicitly told to. For any feature with real runtime
behavior touched since the last verified commit, also do a live
functional check against the dev server using real records created
and removed through the actual APIs — no mock data, no fixtures left
behind.
```

## Schema-change epic (stop-for-approval flow)

Use for epics documented as requiring a schema decision (Document Management, Finance, Reports, Notifications).

```
This epic needs a Prisma schema decision before implementation.
Do not touch schema.prisma yet. First present: the proposed model(s)
and fields, how they relate to existing models, the migration
approach (see docs/DATABASE.md), and any storage/strategy tradeoff
specific to this epic. Wait for approval, then implement following
FAST MODE.
```

## Commit-only — scope audit and commit already-completed work

```
Do not write new code. Run git status --short and read every changed
file's diff. Group changes into coherent units of work per
docs/GIT_WORKFLOW.md. For each unit: stage only the files that belong
to it, show the staged file list and diffstat, write a commit message
in the project's format, commit, and report the SHA. Flag (but do not
stage) any file that doesn't clearly belong to a unit of work.
```
