# Security Policy

This is the project-level security policy. For full implementation detail (JWT payload shape, cookie flags, OWASP checklist, ADR references), see `docs/SECURITY.md`.

## Supported Versions

| Version | Supported |
|---------|-----------|
| v0.5.x | ✅ |
| Older | ❌ |

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:

- Do not open a public GitHub issue for the vulnerability
- Report it privately to the project maintainer with enough detail to reproduce
- Allow reasonable time for a fix before any public disclosure
- Include affected version, reproduction steps, and potential impact where possible

## Authentication

- Session authentication via a stateless, signed JWT (`jose`, HS256) in an `httpOnly` cookie
- `middleware.ts` protection on every route except `/login`, `/api/auth/*`, `/_next/*`, `/favicon.ico`

## Authorization

| Role | Access |
|---|---|
| Admin | Full access to every module |
| Staff | Read/write on customers, workflow, tax, documents — no delete, no finance/reports/employees/settings |

Role checks are enforced at the route level in `middleware.ts`. Finer-grained, per-action permission enforcement inside individual API routes is planned but not yet implemented — see `docs/SECURITY.md` for the current gap.

## API Security

- Never expose password hashes in any API response
- Never serialize sensitive `User` fields beyond what a response needs
- Always use an explicit Prisma `select` (or `include` scoped to named fields) rather than returning a full relation — e.g. `Document` API responses select only `{ id, name, email }` on `uploadedBy`, never the full `User` row
- Validate all inputs server-side with Zod before any business logic runs
- Server-side validation is authoritative; client-side validation (`react-hook-form` + the same Zod schema) is a UX convenience only

## Document Security

- Upload, preview, and download endpoints all require an authenticated session (same middleware as every other route)
- Files are stored on local disk (`storage/documents/`), outside `public/`, never served as static assets
- Each stored file has a SHA-256 checksum recorded at upload time
- Deleting a document is a soft delete (`deletedAt`) — the record is excluded from listings and downloads immediately, without destroying the underlying file
- Document upload, rename, and delete actions are all written to the activity log

## Development Security Rules

- Repository → Service → API → UI — no layer skips the one below it
- No Prisma schema changes without explicit approval
- Scope Audit required before every commit
- Backend, UI, and docs changes committed separately

## Future Improvements

The following are **planned only** — not yet implemented:

- Two-factor Authentication
- Encryption at Rest
- S3 Storage Provider
- Google Drive Provider
- Malware Scanning
- Virus Scanning
- Rate Limiting
- Security Dashboard
