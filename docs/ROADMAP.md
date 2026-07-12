# Roadmap

## Vision

AccOffice is a professional accounting office management platform for small and medium-sized firms in Thailand — one system for customer management, monthly accounting/tax workflow, payroll, internal office finance, and (planned) a client-facing portal and AI-assisted accounting.

## Current Release

**v0.5.0**

### Completed Features

- Authentication
- Authorization
- Dashboard
- Customer Management
- Employee Management
- Workflow Management
- Activity Log
- Document Management
- Document Preview
- Image Preview
- Rename Document
- Document Search
- Local Storage
- Soft Delete

## Roadmap

### v0.6.0 — Tax Compliance Management
- Tax Master & Tax Types
- Due Date Rules Engine
- Monthly Tax Calendar
- Tax Dashboard (Upcoming / Overdue / Completed)
- Monthly Filing Workflow: VAT, PND1, PND3, PND53, Social Security
- Tax Reports & Statistics

**Success Metrics**
- Support 100 client companies.
- Manage all monthly tax workflows.
- Reduce overdue tax tasks.
- Provide tax dashboard for all customers.

### v0.7.0 — Payroll Management
- Salary calculation per employee
- Payroll run / payslip generation
- 50 ทวิ (withholding tax certificate) auto-generation
- Social Security integration
- Employee payroll reports

**Success Metrics**
- Support payroll for at least 500 employees.
- Generate Social Security, PND1, PND1KorYearEndSummary, and 50 Tawi.
- Reduce payroll preparation time.

### v0.8.0 — Client CRM
- Customer Contact Management
- Service Agreement Tracking
- Monthly Service Fee Management
- Billing Cycle Tracking
- Outstanding Payment Tracking
- Customer Timeline
- Internal Notes
- Customer Notifications

**Success Metrics**
- Track monthly service fees for all clients.
- Reduce outstanding customer payments.
- Improve customer follow-up tracking.

### v0.9.0 — Office Finance

Internal office finance only — not client-facing invoicing.

- Revenue Dashboard
- Expense Dashboard
- Cash Flow Dashboard
- Profitability Dashboard

**Success Metrics**
- Provide monthly revenue and expense visibility.
- Monitor office cash flow.
- Generate management financial dashboards.
- Support profitability analysis by customer and service.

### v1.0.0 — Client Portal
- Client login
- Client self-service document submission
- Reduce reliance on LINE for document collection
- Client task-status visibility

**Success Metrics**
- Customers can securely log in.
- Customers upload documents themselves.
- Reduce document exchange through LINE.
- Customers can monitor task status online.

### v1.1.0 — AI Assistant
- Conversational assistant for accounting/tax queries
- Task and deadline reminders via assistant
- Assisted data-entry suggestions

**Example Capabilities**
- Today's Tasks
- Missing Customer Documents
- Upcoming Tax Due
- Payroll Reminder
- Outstanding Customers
- Revenue Summary
- Employee Workload Summary

**Success Metrics**
- Reduce repetitive accounting tasks.
- Provide AI recommendations for daily work.
- Summarize overdue tasks automatically.
- Improve staff productivity.

### v2.0.0 — AI Accounting Platform
- OCR
- AI Classification
- AI Workflow Automation
- AI Task Assignment
- AI Analytics
- AI Reporting
- AI Chat

**Success Metrics**
- Automate document processing with AI.
- Reduce manual data entry.
- Increase workflow automation.
- Provide AI-powered business insights.

## Deprioritized / Backlog

- Document Dashboard, Document Statistics, Bulk Actions, Performance Improvements — Document Management is feature-complete for now; revisit if this becomes a priority again.

## Platform & Operations

Cross-cutting capabilities that support every release rather than belonging to a single version:

- Notification Center
- Backup & Restore
- Monitoring & Logging
- Production Deployment
- Performance Optimization
- Security Hardening
- Disaster Recovery
- Audit & Compliance

## Delivery History

Phases completed prior to the current version-based roadmap:

- **Phase 1 — Foundation:** Next.js App Router shell, customer CRUD, shared UI/design system.
- **Phase 2 — Operational insights:** Authentication, Office Hub dashboard, workflow overview.
- **Phase 3 — Monthly workflow:** Workflow filters, progress/status tracking, task assignment and deadlines.
- **Phase 4 — Quality and polish:** Loading/empty/error states, responsive layout, stricter TypeScript, documentation and CI.

## Release Strategy

Every release follows the same milestone-based process, regardless of size:

1. **Epic Planning** — define objective, scope (included/not included), architecture/database/API/UI impact, risks, and Definition of Done; documented in the project's milestone planning documents.
2. **Milestone Planning** — break the epic into sequential milestones, each independently verifiable and shippable.
3. **Backend** — repository → service → API implementation for the milestone, committed separately from UI and docs.
4. **UI** — pages/components consuming the backend, committed separately from backend and docs.
5. **Documentation** — `CHANGELOG.md`, `docs/PROJECT_CHECKPOINT.md`, `docs/EPIC_PROGRESS.md`, and this roadmap updated to reflect what shipped.
6. **Verification** — `npm run lint`, `npx tsc --noEmit`, `npm run build`, plus live functional checks against the running dev server for anything with real runtime behavior.
7. **Scope Audit** — confirm staged files match the commit's stated purpose before every commit; no unrelated files ride along.
8. **Release** — tag the version, push `main` and the tag, verify the GitHub repository reflects the release. See `docs/RELEASE_CHECKLIST.md` for the full checklist.
