# Release Checklist

Run through this checklist before every tagged release. See `docs/GIT_WORKFLOW.md` for the full commit/push discipline this builds on.

## Code Quality

- [ ] `npm run lint` passes with no errors
- [ ] `npx tsc --noEmit` passes with no errors
- [ ] `npm run build` completes successfully

## Functional Testing

- [ ] All new features for this release verified against the running dev server
- [ ] Permissions verified (admin vs. staff access, where enforced)
- [ ] Activity logs verified (correct action names, correct details)
- [ ] APIs verified (status codes, response shapes, error paths)
- [ ] UI verified (empty states, loading states, error states)

## Security

- [ ] No password hashes serialized in any API response
- [ ] Prisma queries use explicit `select`/`include` — no accidental over-fetching of sensitive fields
- [ ] Authentication verified (session cookie, login/logout, expiry)
- [ ] Authorization verified (role-gated routes behave as expected for both `admin` and `staff`)

## Git

- [ ] Working tree clean (`git status`)
- [ ] Scope Audit completed — no unrelated files staged
- [ ] `CHANGELOG.md` updated
- [ ] `docs/PROJECT_CHECKPOINT.md` updated
- [ ] `docs/EPIC_PROGRESS.md` updated

## Release

- [ ] Push `main`
- [ ] Create tag
- [ ] Push tag
- [ ] Verify GitHub repository reflects the release
