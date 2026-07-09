# Dependencies

Every dependency in `package.json`, why it's there, and what should never accidentally replace it. See `docs/ARCHITECTURE_DECISIONS.md` for the fuller reasoning behind the choices marked with an ADR reference.

## Core Dependencies

| Package | Purpose | Where Used | Why Chosen | Possible Alternatives |
|---|---|---|---|---|
| **Next.js** (`next` 16.2.10) | App framework — routing, rendering, API routes, middleware | Entire `app/` directory, `middleware.ts` | React-native full-stack framework already in place; App Router gives one convention for both pages and APIs | Remix, plain Vite + Express — would mean rewriting the entire app |
| **React** (`react`/`react-dom` 19.2.4) | UI rendering | Every component | Required by Next.js; version pinned to match Next 16's supported React version | None realistic while on Next.js |
| **TypeScript** (`typescript` ^5) | Static typing, strict mode | Entire codebase | Enforces the "no `any`, no duplicated interfaces" rules; catches the exact class of bug ADR-005 fixed | None — this is a hard project requirement, not a swappable choice |
| **Tailwind CSS** (`tailwindcss` ^4, `@tailwindcss/postcss` ^4) | Utility-first styling | All component `className`s, `app/globals.css` (includes the chart-palette CSS custom properties) | Already the project's styling system; v4's CSS-based config also holds the design tokens `components/dashboard/charts/` reads via `var(--chart-*)` | CSS Modules, styled-components — would require restyling everything |
| **Prisma** (`prisma`, `@prisma/client` ^6.19.3) | ORM, schema, migrations, seeding | `prisma/schema.prisma`, `prisma/seed.ts`, every file in `repositories/` | Type-safe query builder generated from one schema file; the entire Repository layer is built around its client | Drizzle, raw SQL — would mean rewriting every repository |
| **SQLite** (via `DATABASE_URL="file:./dev.db"`) | Database engine (local dev) | `prisma/schema.prisma`'s `datasource` block | Zero-setup local development; Prisma keeps the provider swappable for production (see `docs/DATABASE.md`) | PostgreSQL, MySQL — a real candidate for production, not accidental |
| **Zod** (`zod` ^4.4.3) | Runtime schema validation | Every file in `validators/`, used both client-side (`zodResolver`) and server-side (`.safeParse()` in API routes) | Pairs natively with React Hook Form via `@hookform/resolvers`; one schema defines both the TypeScript type and the runtime check | Yup, Joi — would mean rewriting every validator and losing the `z.infer` type-generation convenience |
| **React Hook Form** (`react-hook-form` ^7.81.0, `@hookform/resolvers` ^5.4.0) | Form state + validation wiring | `CustomerForm.tsx`, `EmployeeForm.tsx` (Epic 3), `app/login/page.tsx` | Uncontrolled-by-default forms (fewer re-renders), `zodResolver` bridges directly to the `validators/` schemas | Formik — would mean rewriting every form |
| **jose** (`jose` ^6.2.3) | JWT sign/verify | `lib/auth.ts` | **Must be edge-runtime-compatible** — `middleware.ts` runs on Next.js's Edge Runtime, which has no Node `crypto` module. `jose` is pure-JS/Web Crypto and works there; `jsonwebtoken` does not (see ADR-002) | `jsonwebtoken` — would silently break authentication in middleware; do not substitute |
| **bcryptjs** (`bcryptjs` ^3.0.3) | Password hashing | `services/auth.service.ts` (`login`, and Epic 3's `createAccount`), `prisma/seed.ts` | Pure-JS — no native build step, unlike `bcrypt`, avoiding the native-binding install complexity already present from `sharp`/`@prisma/client` | `bcrypt` (native bindings, faster but heavier to install/deploy), `argon2` |
| **Recharts** (`recharts` ^3.9.2) | Charting | `components/dashboard/charts/` exclusively (see ADR-004 — nothing else may import it) | React-native declarative chart API with solid TypeScript types | Chart.js, visx, nivo, hand-built SVG — see ADR-004 for the full comparison |
| **Phosphor Icons** (`@phosphor-icons/react` ^2.1.10) | Icon set | `Sidebar.tsx` (`ListIcon`, `SidebarSimpleIcon`), various UI components | Consistent icon family already in use across the app; always import the current (non-`@deprecated`) named export — check the package's own `.d.ts` before using an icon name | `lucide-react` (also installed — see Supplementary Dependencies below; don't mix icon families within one component) |
| **shadcn/ui** (`shadcn` ^4.13.0, on `@base-ui/react` ^1.6.0) | UI component source/primitives | `components/ui/*` | Not a runtime component library in the traditional sense — it generates owned, editable component source into `components/ui/`, built on Base UI primitives (not Radix) | Radix UI directly, Headless UI — would require regenerating every primitive in `components/ui/` |
| **tsx** (`tsx` ^4.23.0, devDependency) | TypeScript execution for scripts | Runs `prisma/seed.ts` (configured in `prisma.config.ts`'s `migrations.seed`) | Zero-config TS runner; no separate `ts-node` + config needed | `ts-node` — would need extra tsconfig wiring |

## Supplementary Dependencies (present, lower-profile)

| Package | Purpose | Where Used |
|---|---|---|
| `@base-ui/react` | Headless UI primitives underlying `components/ui/*` (Dialog, Menu, Button, ...) — **not** Radix; `asChild` doesn't exist here, use the `render` prop instead |
| `class-variance-authority` | Variant-based className composition (`buttonVariants`, `badgeVariants`, etc.) |
| `clsx` + `tailwind-merge` (composed as `cn()`) | Conditional className merging | `utils/cn.ts`, used everywhere |
| `date-fns` | Date formatting/arithmetic | Available for date logic beyond the native `Date` methods currently used in dashboard/calendar code |
| `react-day-picker` | Calendar primitive backing `components/ui/calendar.tsx` |
| `tw-animate-css` | Tailwind-compatible animation utility classes |
| `lucide-react` | A second icon set, also present — new code should default to `@phosphor-icons/react` for consistency unless a specific icon only exists in `lucide-react` |

## A Note on "Never Replace Accidentally"

- **`jose` must never be swapped for `jsonwebtoken`** in anything reachable from `middleware.ts` — it would compile but fail at runtime on the Edge Runtime (no Node `crypto`).
- **`bcryptjs` should not be swapped for `bcrypt`** without a deliberate decision — native bindings add install/deploy complexity this project has otherwise avoided.
- **`recharts` should never be imported outside `components/dashboard/charts/`** — that boundary is what keeps chart theming/behavior consistent (ADR-004).
- **Don't add a second form library, a second validation library, or a second charting library** "just for one page" — that's exactly the kind of drift `docs/DEVELOPMENT_RULES.md` exists to prevent.
