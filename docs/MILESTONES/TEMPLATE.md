# Epic [NUMBER] — [NAME]

## Epic Overview

One-paragraph summary of what this epic delivers and why it's being done now.

## Objective

What this epic achieves, stated as a concrete outcome.

## Business Value

Why this matters to the accounting office using AccOffice — the operational or business problem this solves.

## Success Metrics

Define measurable outcomes that determine whether this Epic is successful.

Success Metrics should be:

- Specific
- Measurable
- Achievable
- Relevant
- Verifiable

These metrics should measure the business outcome of the Epic rather than simply confirming that features were implemented.

Example template:

- Support up to ______ client companies.
- Reduce manual work by ______%.
- Reduce overdue tasks by ______%.
- Complete the workflow within ______ minutes.
- Dashboard response time below ______ seconds.
- Generate required reports automatically.
- Reduce data-entry errors.
- Improve overall user productivity.

Replace these placeholders with real, measurable targets when planning an actual Epic.

Notes:

- Roadmap Success Metrics measure the success of an entire product release.
- Epic Success Metrics measure the success of one Epic only.
- Do not duplicate Roadmap metrics.
- Epic metrics should always support the corresponding Roadmap goals.

## Scope

### Included

- 
- 

### Not Included

- 
- 

## Architecture Impact

New services, repositories, folders, or patterns introduced. Note any existing documented invariant this touches (e.g. "the only place that imports X").

## Database Impact

New models/fields, or explicitly "no schema change." Any schema change stops for approval before `schema.prisma` is touched, per `docs/DEVELOPMENT_RULES.md`.

## API Impact

| Endpoint | Change |
|---|---|
| | |

## UI Impact

New pages/components, and which existing components are reused vs. newly created.

## Milestones

### Milestone 1 — [Name]
- 

### Milestone 2 — [Name]
- 

## Verification Plan

- `npm run lint`, `npx tsc --noEmit`, `npm run build` per milestone
- Live functional checks against the running dev server for anything with real runtime behavior
- Specific checks unique to this epic

## Commit Plan

### Backend
1. 

### UI
1. 

### Documentation
1. 

## Risks

What could go wrong, what needs approval before it can proceed (new dependency, schema change, breaking API change), and any known accuracy/assumption gaps.

## Future Work

What's explicitly deferred, not part of this epic's Definition of Done.

## Definition of Done

- [ ] All milestones implemented via separate, correctly-scoped Backend/UI/Docs commits
- [ ] `npm run lint`, `npx tsc --noEmit`, `npm run build` pass after every milestone
- [ ] Live functional verification performed against the running dev server with real records
- [ ] No schema change or new dependency added without prior explicit approval
- [ ] `CHANGELOG.md`, `docs/PROJECT_CHECKPOINT.md`, `docs/EPIC_PROGRESS.md`, `docs/ROADMAP.md` updated to reflect what shipped
- [ ] Nothing pushed without explicit approval

## Release Checklist

See `docs/RELEASE_CHECKLIST.md` for the full checklist. Confirm before tagging a release:
- [ ] Code Quality gate passed
- [ ] Functional Testing complete
- [ ] Security checklist complete
- [ ] Git scope audit complete, working tree clean
- [ ] Release steps (tag, push, verify) complete
