# Documentation Index

Central entry point for all AccOffice project documentation.

## Getting Started

### README.md
Project overview, tech stack, and getting-started instructions.
Path: `README.md`

### CLAUDE.md
Core project instructions and coding rules for AI-assisted development.
Path: `CLAUDE.md`

### CONTRIBUTING.md
Contribution workflow: branch strategy, architecture, development workflow, commit convention, and PR checklist.
Path: `CONTRIBUTING.md`

## Product

### VISION.md
Product vision, mission, target users, principles, and long-term goals.
Path: `docs/VISION.md`

### ROADMAP.md
Product roadmap and planned releases, v0.6.0 through v2.0.0.
Path: `docs/ROADMAP.md`

### CHANGELOG.md
Chronological record of shipped changes, in Keep a Changelog format. The active changelog — see also the Archive section below.
Path: `CHANGELOG.md`

## Architecture

### ARCHITECTURE.md
Current-state description of the application's architecture and conventions.
Path: `docs/ARCHITECTURE.md`

### ARCHITECTURE_DECISIONS.md
Architecture Decision Records (ADRs) explaining the reasoning behind key technical decisions.
Path: `docs/ARCHITECTURE_DECISIONS.md`

### DATABASE.md
Prisma/SQLite database configuration and key data models.
Path: `docs/DATABASE.md`

### PROJECT_STRUCTURE.md
Folder-by-folder reference for what belongs where in the codebase.
Path: `docs/PROJECT_STRUCTURE.md`

### API.md
REST API reference for customer and workflow endpoints.
Path: `docs/API.md`

### DEPENDENCIES.md
Every project dependency, why it was chosen, and its alternatives.
Path: `docs/DEPENDENCIES.md`

## Development

### CODING_STANDARD.md
General coding conventions: TypeScript, UI/styling, components, data/forms.
Path: `docs/CODING_STANDARD.md`

### CODING_GUIDELINES.md
Detailed, codebase-derived coding rules: naming conventions, TypeScript/React/Next.js/Prisma rules.
Path: `docs/CODING_GUIDELINES.md`

### DEVELOPMENT_RULES.md
Mandatory architecture and verification rules for every change.
Path: `docs/DEVELOPMENT_RULES.md`

### GIT_WORKFLOW.md
Branch strategy, commit strategy, and the pre-commit checklist.
Path: `docs/GIT_WORKFLOW.md`

### PROMPTS.md
Reusable AI development prompts and a history of prompt-workflow changes.
Path: `PROMPTS.md`

### CONTRIBUTING_AI.md
Development guide specifically for AI assistants working on this codebase.
Path: `docs/CONTRIBUTING_AI.md`

### CLAUDE_RULES.md
Condensed, permanent AI development instructions, read at the start of a session.
Path: `.ai/CLAUDE_RULES.md`

### TEST_CHECKLIST.md
Manual/functional acceptance checklist per feature area.
Path: `docs/TEST_CHECKLIST.md`

## Security

### SECURITY.md
Project-level security policy: supported versions, responsible disclosure, and high-level controls.
Path: `SECURITY.md`

### SECURITY.md (detailed)
Full security architecture: authentication, authorization, API/document security, and the OWASP checklist.
Path: `docs/SECURITY.md`

## Progress

### PROJECT_CHECKPOINT.md
Single source of truth for overall project status — what's done, what's next.
Path: `docs/PROJECT_CHECKPOINT.md`

### EPIC_PROGRESS.md
Per-epic status and completed-feature detail.
Path: `docs/EPIC_PROGRESS.md`

## Releases

### RELEASE_CHECKLIST.md
Checklist to run through before every tagged release.
Path: `docs/RELEASE_CHECKLIST.md`

## Templates

No milestone template exists in the repository yet.

## Archive

Historical documentation, superseded by the current roadmap/epic system but kept for reference.

### CHANGELOG.md (legacy)
Older Sprint/Epic-numbered changelog, superseded by the root `CHANGELOG.md`.
Path: `docs/CHANGELOG.md`

### Sprint-01.md – Sprint-04.md
Sprint-based development notes predating the current epic-based tracking system.
Path: `docs/SPRINTS/Sprint-01.md` … `docs/SPRINTS/Sprint-04.md`

## Documentation Maintenance

- Documentation should be updated whenever a feature ships — not as an afterthought.
- `ROADMAP.md` should reflect future plans and stay current as priorities shift.
- `CHANGELOG.md` records what has actually shipped.
- `PROJECT_CHECKPOINT.md` records overall implementation progress.
- `EPIC_PROGRESS.md` tracks per-epic status.
- `ARCHITECTURE_DECISIONS.md` records accepted architectural decisions (ADRs).
- `INDEX.md` should always be kept up to date as documentation is added, merged, or archived.
