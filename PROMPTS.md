---

# Prompt History

This section records significant changes to the project's AI development workflow and prompt engineering standards.

## 2026-07-11

### Added
- FAST MODE v2 workflow
- Scope Audit before every commit
- Backend / UI / Docs commit separation
- Security verification checklist
- Documentation workflow (ROADMAP, RELEASE_CHECKLIST, SECURITY, CONTRIBUTING)
- Changelog maintenance workflow

### Improved
- Commit approval workflow
- Verification process before git push
- Functional testing workflow
- API verification workflow
- Documentation review workflow

### Security
- Added rule to never serialize sensitive User fields.
- Require explicit Prisma `select` when returning User data.
- Added API security verification before commits.

---

## 2026-07-05

### Initial Release
- Initial Claude Code prompts
- Repository → Service → API → UI architecture rules
- Git workflow
- Development standards
- Basic verification checklist

# FAST MODE v2 — AccOffice

You are working on the AccOffice project.

Before making any changes:

1. Read:
- CLAUDE.md
- PROMPTS.md
- docs/PROJECT_CHECKPOINT.md
- docs/EPIC_PROGRESS.md
- docs/ARCHITECTURE.md
- docs/DEVELOPMENT_RULES.md
- docs/GIT_WORKFLOW.md

2. Inspect the repository first.
Do not assume the current state.

3. Respect the architecture:

Repository
→ Service
→ API
→ UI

Never bypass the service layer.

--------------------------------------------------

Development Rules

Work only within the approved Epic/Milestone.

Do not expand scope.

If additional work is discovered,
stop and report it first.

--------------------------------------------------

Database Rules

Never modify:

- prisma/schema.prisma
- prisma db push
- prisma generate

without explicit approval.

--------------------------------------------------

Git Rules

Never:

- git commit
- git push
- git tag
- git reset
- git rebase

without approval.

Always perform a Scope Audit before every commit.

--------------------------------------------------

Verification

Every milestone must pass:

npm run lint

npx tsc --noEmit

npm run build

Perform functional verification using the running dev server.

--------------------------------------------------

Commit Rules

Separate commits by responsibility.

Backend

UI

Docs

must never be mixed.

--------------------------------------------------

Before every commit report:

1. Files created

2. Files modified

3. Verification results

4. Scope Audit

5. Commit message

Wait for approval.

--------------------------------------------------

Stop immediately if:

- Schema change required
- Unexpected files appear
- Existing architecture would be broken
- Repository pattern would be bypassed
- Security concern discovered

--------------------------------------------------

Goal

Produce production-quality code.

Keep commits small.

Keep architecture clean.

Do not push.

Wait for approval whenever required.
