# Contributing to AccOffice

Thank you for contributing to AccOffice. This document explains how to make improvements, submit changes, and help maintain the project.

## Branch Strategy

| Branch/Tag | Purpose |
|---|---|
| `main` | Single integration branch — all work lands here via precisely scoped commits |
| feature branches | Optional, for larger or riskier changes; not currently required by convention |
| release tags | Mark shipped versions (e.g. `v0.5.0`) |

## Architecture

```
Repository
    ↓
Service
    ↓
API
    ↓
UI
```

**Never bypass the service layer.** Repositories are Prisma-only (no business logic); services hold business logic and call repositories; API routes parse/validate and call exactly one service method; UI never imports Prisma or duplicates a service's logic. See `docs/DEVELOPMENT_RULES.md` for the full rule set.

## Development Workflow

- Scope Audit before every commit — confirm staged files match the commit's stated purpose, no unrelated files ride along
- Backend, UI, and docs changes are staged as separate commits, not bundled into one
- Run `npm run lint`, `npx tsc --noEmit`, and `npm run build` before every commit — all three must pass
- Functional verification required for anything with runtime behavior (auth, mutations) — a passing build does not prove a feature works
- Security verification required for anything touching auth, permissions, or file handling
- No Prisma schema changes without explicit approval
- No `git push` without explicit approval

## Coding Guidelines

- Use TypeScript everywhere; avoid `any` unless absolutely necessary
- Use `shadcn/ui` components for UI consistency — reuse existing components before creating new ones
- Prefer server components unless client-side interactivity is required
- Keep components and services small and focused
- Write clean, readable code and remove unused imports

## Commit Convention

| Prefix | Use |
|---|---|
| `feat:` | A new feature |
| `fix:` | A bug fix |
| `docs:` | Documentation only |
| `refactor:` | Code change with no behavior change |
| `test:` | Adding or correcting tests |
| `chore:` | Tooling, dependencies, maintenance |

## Pull Request Checklist

- [ ] Build passed (`npm run lint`, `npx tsc --noEmit`, `npm run build`)
- [ ] Tests passed (where a test suite exists for the touched area)
- [ ] Scope reviewed — change is limited to a single feature or fix
- [ ] Documentation updated where appropriate

## Documentation

This repository includes documentation in the `docs/` folder. New features or architectural changes should be reflected in the appropriate docs files.
