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

- `User` stores login credentials, roles, and activity logs.
- `Employee` stores employee contact details and task assignments. `repositories/employee.repository.ts` provides standard CRUD data access ahead of the Employee feature/UI, which has not been built yet.
- `Role` and `Permission` support role-based access control.
- `ActivityLog` records user and employee actions.

## Environment variables

Use `.env.example` as a template.

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_NAME="AccOffice"
```

## Notes

SQLite is used for local development and lightweight prototypes. For production, the schema can be migrated to PostgreSQL or another supported database provider while keeping Prisma as the data layer.

The local `prisma/dev.db` file is no longer tracked in git (see `.gitignore`) — each environment keeps its own local database. There is still no `prisma/migrations` directory; the schema is applied with `prisma db push` rather than versioned migrations.
