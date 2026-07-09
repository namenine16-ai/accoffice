# Security

Documents the security architecture as it actually exists today, and what's explicitly deferred. Where something isn't implemented, it's marked **Not Implemented** rather than glossed over — this file is only useful if it's accurate. See `docs/ARCHITECTURE_DECISIONS.md` (ADR-002, ADR-008) for the reasoning behind the authentication/authorization choices.

## Authentication

### JWT
- Library: `jose` (chosen specifically because it's edge-runtime-compatible — `jsonwebtoken` is not; see `docs/DEPENDENCIES.md`).
- Algorithm: HS256, signed with `AUTH_SECRET` (environment variable, never committed — `.env` is gitignored).
- Payload: `sub` (user id), `email`, `roles` (array of role names) — **deliberately no profile data**, keeping the token minimal and edge-safe.
- Verified in `lib/auth.ts` (`verifySessionToken`), used by both `middleware.ts` and `services/auth.service.ts`.

### Cookie Policy
| Attribute | Value |
|---|---|
| Name | `session` |
| `httpOnly` | `true` — not readable from client-side JavaScript |
| `sameSite` | `lax` |
| `path` | `/` |
| `secure` | `true` in production only (allows local HTTP dev) |
| `maxAge` | 604800 seconds (7 days) |

### Session Lifetime
Stateless — there is no server-side session record to expire. The token itself expires after 7 days (`exp` claim). There is **no revocation mechanism**: a token remains valid for its full lifetime even if the user's role changes or their account is disabled, until it naturally expires or the user logs out. See ADR-002 for the accepted trade-off and future implications.

### Logout Strategy
`POST /api/auth/logout` sets the `session` cookie to an empty value with `maxAge: 0`, which browsers treat as an immediate deletion instruction. This clears the client's ability to present a valid session but — being stateless JWT — does **not** invalidate the token server-side. A copied/exfiltrated token would remain valid until expiry even after the legitimate user logs out. This is a known limitation of the stateless design, not an oversight.

### Password Hashing
- Library: `bcryptjs` (pure JS, no native build step — see `docs/DEPENDENCIES.md`).
- Cost factor: 10 (used in `prisma/seed.ts`; any future account-creation code should match).
- Passwords are never logged, never returned in any API response, and never stored anywhere except as a bcrypt hash in `User.password`.

## Authorization

### RBAC
Two roles, defined in `lib/permissions.ts`:

| Role | Access |
|---|---|
| `admin` | Full access — wildcard (`*`) permission on every resource |
| `staff` | Read/write on `customers`, `workflow`, `tax`, `documents` — no delete, no `finance`/`reports`/`employees`/`settings` |

### Permissions — Permission Matrix
```
admin
  customers:*   workflow:*   tax:*   documents:*
  finance:*     reports:*    employees:*   settings:*

staff
  customers:read, customers:write
  workflow:read,  workflow:write
  tax:read,       tax:write
  documents:read, documents:write
```
These are seeded as real `Permission`/`Role` rows in the database by `prisma/seed.ts`, sourced from the single `lib/permissions.ts` definition.

### Current Implementation
**Role-level (page-level) enforcement only**, via `middleware.ts`:
- Unauthenticated → redirect to `/login` (pages) or 401 JSON (API routes).
- `/settings`, `/employees`, `/reports`, `/finance` require the `admin` role → redirect to `/dashboard` (pages) or 403 JSON (API routes) otherwise.
- Middleware cannot query the database (Edge Runtime) — every decision is made from the JWT's own `roles` claim.

### Future Implementation
**Action-level permission enforcement inside existing API routes is NOT yet implemented** (ADR-008). Concretely: a `staff` user can currently call `DELETE /api/customers/[id]` even though their permission set has no `customers:delete` — nothing in that route checks the finer-grained permission today. This must be closed before real non-admin accounts are used against production data. Planned approach: a `hasPermission()` check (already available as a pure function in `lib/permissions.ts`) called at the top of each mutating route handler, following the same pattern already established for role checks in `middleware.ts`.

## API Security

### Protected Routes
Public (no auth required): `/login`, `/api/auth/*`, `/_next/*`, `/favicon.ico`. Every other route — page or API — requires a valid session.

### Middleware
`middleware.ts` is the single enforcement point for authentication and role-level authorization. It runs before any route handler or page render, on the Edge Runtime.

### Unauthorized Responses
| Context | Response |
|---|---|
| Unauthenticated page request | 307 redirect to `/login` |
| Unauthenticated API request | 401 JSON `{ "message": "กรุณาเข้าสู่ระบบ" }` |
| Authenticated but wrong role, page request | 307 redirect to `/dashboard` |
| Authenticated but wrong role, API request | 403 JSON `{ "message": "ไม่มีสิทธิ์เข้าถึง" }` |

### Validation
Every mutating API route parses its body with a Zod schema (`validators/*`) before calling a service. Invalid input returns 400 before any business logic or database call runs.

### Error Handling
All API routes funnel failures through `lib/api-error.ts`'s `apiErrorResponse()`, which logs a structured JSON error server-side (scope, message, stack, timestamp) and returns a generic, Thai-language message to the client — internal error details (stack traces, Prisma internals) are never returned in the HTTP response body.

## Input Validation

### Zod
Single source of truth for both client and server validation, one schema per domain in `validators/`.

### Server Validation
API routes call `.safeParse()` on the request body before doing anything else. This exists for every new route built since the customer module (auth, employee); the original customer routes predate this convention and validate client-side only — a known inconsistency, not a deliberate gap in new code.

### Client Validation
Forms use `react-hook-form` + `@hookform/resolvers`' `zodResolver`, pointed at the same schema the server uses — one definition, two enforcement points.

## File Upload Security

### Current Status
**Not implemented.** There is no `Document` Prisma model and no upload endpoint anywhere in the codebase (Epic 4, not started — see `docs/EPIC_PROGRESS.md`).

### Future Design (planned, not built)
- **Allowed file types:** to be decided alongside the Epic 4 schema decision — likely a documented allowlist (e.g. PDF, common image formats, common office document formats), enforced by both MIME-type and file-extension checks, not extension alone.
- **Maximum size:** to be decided; must be enforced both client-side (fast feedback) and server-side (the only check that actually matters for security).
- **Virus scanning:** placeholder only — no scanning integration exists or is currently planned in detail. Any real deployment handling user-uploaded files should not skip this before going to production.

## Database Security

### Prisma
All database access goes through Prisma's generated client, exclusively from `repositories/` (see ADR-006 and `docs/DEVELOPMENT_RULES.md`).

### Parameterized Queries
Prisma parameterizes every query it generates — there is no raw, string-concatenated SQL anywhere in this codebase (`prisma.$queryRawUnsafe` or equivalent is not used).

### SQL Injection Prevention
A direct consequence of the above: since no repository builds raw SQL from user input, and every query goes through Prisma's query builder, standard SQL injection is not a live risk in the current codebase. This holds only as long as the "Prisma-only, repository-only" rule holds — any future raw query would need its own explicit security review.

## OWASP Checklist

| Risk | Status | Notes |
|---|---|---|
| **CSRF** | 🟡 Partially mitigated | `sameSite=lax` on the session cookie blocks the cookie from being sent on cross-site `POST` requests, which covers the common case. There is no dedicated CSRF token mechanism. |
| **XSS** | 🟡 Partially mitigated | React escapes all rendered content by default; no `dangerouslySetInnerHTML` is used anywhere in the codebase. No additional output-encoding layer or Content-Security-Policy header exists yet. |
| **Clickjacking** | ⬜ Not implemented | No `X-Frame-Options` or `frame-ancestors` CSP header is currently configured. |
| **Open Redirect** | ✅ Not currently exploitable | No route accepts a user-controlled redirect target — `middleware.ts` and the login flow only ever redirect to fixed, hardcoded paths (`/login`, `/dashboard`). |
| **Rate Limiting** | ⬜ Not implemented | No rate limiting exists on `/api/auth/login` or any other endpoint. |
| **Brute Force Protection** | ⬜ Not implemented | No account lockout, no exponential backoff, no CAPTCHA on repeated failed logins. |
| **Sensitive Data** | 🟡 Partially addressed | Passwords are bcrypt-hashed and never returned in responses; the JWT excludes profile data; `.env` is gitignored. No secrets manager is in use — `AUTH_SECRET` and seed credentials live in a local `.env` file. |

## Future Security Roadmap

1. **Close ADR-008** — enforce `hasPermission()` inside existing mutating API routes, not just role-level page gating.
2. **Rate limiting + brute-force protection** on `/api/auth/login` before any real non-admin account is exposed beyond local development.
3. **Clickjacking header** (`X-Frame-Options: DENY` or an equivalent CSP `frame-ancestors`) — trivial to add, not yet prioritized.
4. **File upload security** — allowlist, size limits, and at least a placeholder virus-scan integration point, designed alongside Epic 4's `Document` model decision.
5. **Session revocation** — if instant account disable/revoke becomes a real requirement, revisit ADR-002 (stateless JWT) in favor of a blocklist or DB-backed sessions.
6. **Secrets management** — move `AUTH_SECRET` and any future third-party API keys out of a local `.env` file and into a proper secrets manager before a real production deployment.
