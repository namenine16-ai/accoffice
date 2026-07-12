# AccOffice Vision

## Product Vision

AccOffice is a professional accounting office management platform for small and medium-sized accounting firms in Thailand — one system to run customer management, monthly tax/accounting workflow, payroll, internal office finance, and (planned) a client-facing portal and AI-assisted accounting, replacing a patchwork of spreadsheets, LINE messages, and manual tracking.

## Mission

Provide a single system that helps accounting teams manage customers, monthly workflows, tax deadlines, documents, payroll, billing, reporting, and team collaboration — without duplicating effort across disconnected tools.

## Target Users

- **Accounting office staff** — the primary daily users: preparing monthly filings, tracking customer documents, managing workflow tasks.
- **Accounting office admins/owners** — full visibility and control: employee management, financial oversight, settings, reporting.
- **Clients of the accounting office** (planned, v1.0.0) — self-service document submission and task-status visibility, not full system access.

## Product Principles

- **Real data only.** No mock data, ever — every UI reads from a real API backed by a real Prisma query, in every environment, including an empty database.
- **One direction of data flow.** Repository → Service → API → UI, strictly layered (see `docs/ARCHITECTURE_DECISIONS.md`, ADR-001).
- **Reuse before creation.** Check for an existing component, type, or validator before writing a new one.
- **Stop at real decisions.** Schema changes, new dependencies, and business-rule ambiguity get surfaced and approved, not guessed.
- **Documentation is memory.** `docs/` is the source of truth carried across sessions and across whichever AI assistant or developer picks up the work next.
- **Thai-first UI.** User-facing text is in Thai; the audience is Thai accounting offices.

## Long-term Goals

See `docs/ROADMAP.md` for the full version-by-version plan. In summary, AccOffice aims to grow from operational workflow tracking (current) into:
- Full monthly tax compliance management
- Payroll processing
- Deeper client relationship management
- Internal office financial visibility
- A client-facing self-service portal
- AI-assisted and eventually AI-automated accounting operations

## Non-goals

- **Not a single-company bookkeeping tool.** AccOffice manages *an accounting office's* multiple client companies — it is not general-purpose accounting software for one business's internal books.
- **Not a client invoicing/billing platform.** Office Finance (v0.9.0) is internal-only; invoicing clients is explicitly out of scope for that release.
- **Not open self-registration.** There is no public sign-up (see ADR-010) — accounts are created by an admin, and (later) clients are provisioned by the office, not self-served from the open internet.
- **Not a replacement for licensed tax/audit judgment.** AccOffice tracks and supports the compliance workflow; it does not make tax or audit decisions on a firm's behalf.

## Success Definition

AccOffice succeeds when an accounting office can run its entire monthly compliance and client-management workflow inside the system — tasks, documents, tax deadlines, and (eventually) payroll and client communication — with materially less reliance on spreadsheets and ad hoc LINE messages. Concrete, per-release success metrics are tracked in `docs/ROADMAP.md` rather than duplicated here, so they stay current as the roadmap evolves.
