# Database

AccOffice uses Prisma with a SQLite database configured through `DATABASE_URL`.

## Prisma configuration

- `prisma/schema.prisma` defines the data models.
- `lib/prisma.ts` exports the generated Prisma client for use in services and repositories.

## Key models

### Customer

The `Customer` model stores client profiles for accounting work.

- `code` — unique client code.
- `companyName` — the company or customer name.
- `taxId` — unique tax identifier.
- `serviceFee` — numeric fee for service agreements.
- `status` — active/inactive marker.
- `tasks` — related monthly workflow tasks.

### CustomerTask

The workflow model tracks monthly accounting tasks and assignments.

- `customerId` — links to the `Customer`.
- `assignedEmployeeId` — optional employee assignment.
- `month`, `year` — period for the task.
- `status` — workflow status such as `pending`, `in-progress`, or `completed`.
- `progress` — integer progress value.
- `deadline`, `completedAt` — tracking dates.
- booleans for document/tax status: `receiveDoc`, `vat`, `pnd1`, `pnd3`, `pnd53`, `sso`, `closing`.

### User and Employee domain

- `User` stores login credentials (bcrypt-hashed `password`), roles, and activity logs. Now used by the authentication system (`repositories/auth.repository.ts`, `services/auth.service.ts`).
- `Employee` stores employee contact details and task assignments. `repositories/employee.repository.ts` provides standard CRUD data access ahead of the Employee feature/UI, which has not been built yet.
- `Role` and `Permission` support role-based access control. Two roles are seeded: `admin` (full access to every resource) and `staff` (read/write on customers, workflow, tax, documents only — no delete/wildcard, and no access to finance, reports, employees, settings). The exact matrix lives in `lib/permissions.ts` and is applied to real `Permission`/`Role` rows by `prisma/seed.ts`.
- `ActivityLog` records user and employee actions.

## Authentication

- Sessions are **stateless JWT** (via `jose`) in an httpOnly cookie — no `Session` table, no migration. The JWT payload carries only `sub`, `email`, and `roles` (no profile data), because `middleware.ts` runs on the Edge Runtime and cannot query Prisma — all route-protection decisions come from the token's own claims.
- The first admin user is created by `prisma/seed.ts` (`npx prisma db seed`), reading `AUTH_ADMIN_EMAIL`/`AUTH_ADMIN_PASSWORD` from the environment. Re-running the seed is idempotent — it exits successfully if that email already exists. There is no self-registration endpoint by design.

## Environment variables

Use `.env.example` as a template.

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_NAME="AccOffice"
AUTH_SECRET=""               # JWT signing key, e.g. `openssl rand -base64 32`
AUTH_ADMIN_EMAIL=""          # seed-only: first admin user's email
AUTH_ADMIN_PASSWORD=""       # seed-only: first admin user's password (bcrypt-hashed at seed time)
```

## Notes

SQLite is used for local development and lightweight prototypes. For production, the schema can be migrated to PostgreSQL or another supported database provider while keeping Prisma as the data layer.

The local `prisma/dev.db` file is no longer tracked in git (see `.gitignore`) — each environment keeps its own local database. There is still no `prisma/migrations` directory; the schema is applied with `prisma db push` rather than versioned migrations.
