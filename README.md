# AccOffice

AccOffice is a modern accounting office management system built with Next.js 16, TypeScript, Prisma, Tailwind CSS, and shadcn/ui.

## What this repository contains

- `app/` — Next.js App Router pages for dashboard, customers, workflow, documents, finance, reports, employees, settings, login, and tax.
- `components/` — Reusable UI and feature components built with shadcn/ui.
- `services/` — Business logic and orchestration for application features.
- `repositories/` — Prisma-backed persistence layer for customers and workflow.
- `lib/` — Shared utilities and Prisma client configuration.
- `prisma/` — Prisma schema and database configuration.
- `docs/` — Project documentation, architecture, roadmap, API design, and sprint notes.

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create the local database file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```
5. Run lint checks:
   ```bash
   npm run lint
   ```

## Documentation

Project documentation is available in the `docs/` folder:

- `docs/VISION.md`
- `docs/ROADMAP.md`
- `docs/ARCHITECTURE.md`
- `docs/DATABASE.md`
- `docs/API.md`
- `docs/CODING_STANDARD.md`
- `docs/CHANGELOG.md`
- `docs/SPRINTS/Sprint-01.md`
- `docs/SPRINTS/Sprint-02.md`
- `docs/SPRINTS/Sprint-03.md`
- `docs/SPRINTS/Sprint-04.md`

## Project status

This repository contains core accounting office functionality, including customer management, monthly workflow tracking, and quality-improvement work to standardize UI states and error handling.
