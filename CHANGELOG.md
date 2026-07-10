# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- PDF preview and image preview for documents, rendered inline via a dedicated preview endpoint
- Rename document, with the file extension preserved automatically
- Document search extended to match customer name and uploader name/email, not just filename/note
- File-type icons in the document table and the customer document panel
- Uploader and customer metadata surfaced directly on each document row

### Fixed
- Document rename validation (rejects empty or overly long filenames)
- Preview endpoint content-disposition/content-type handling for inline rendering
- Customer/uploader lookup no longer relies on a separate client-side map — resolved directly from the API response

### Security
- Removed the password hash from `uploadedBy` in document API responses
- Replaced a broad Prisma relation include with an explicit field-level select (`id`, `name`, `email` only)
- Verified no `password` field is serialized in any document API response

## [0.5.0] - 2026-07-10

### Added
- Document Management module (`/documents`)
- Local document storage
- Document upload
- Document download
- Soft delete for documents
- Customer document panel (Recent Documents on the customer detail page)
- Document categories
- Activity logging for documents

### Improved
- Employee Management and Workflow Management integration points
- Customer detail page integration
- Repository → Service → API architecture consistency

## [0.4.0] - 2026-07-09

### Added
- Employee Management module: employee CRUD (list, create, edit, profile/detail page)
- Search, department filter, status filter, and pagination on the employee list
- Employee account and role management (create login, assign admin/staff role, activate/deactivate, reset password)
- Workflow task mutation endpoint and an assign-employee/status panel on the workflow detail page
- Per-employee workload summary
- Attendance and leave placeholder sections on the employee profile

### Improved
- Activity logging extended to employee CRUD, account management, and workflow assignment/status changes

## [0.3.0] - 2026-07-09

### Added
- Initial project scaffold (Next.js App Router, Tailwind CSS, shadcn/ui, Prisma + SQLite)
- Customer CRM: full CRUD (list, create, edit, detail)
- Office Hub dashboard: KPI cards, today's/overdue task tables, missing-documents tracker, tax deadline breakdown, interactive calendar, four charts, recent activity feed
- Responsive app shell: collapsible sidebar (desktop), off-canvas drawer (mobile)
- Authentication: JWT session cookie, login/logout, route-protection middleware, role-based access (admin/staff), seed script for the first admin user
- Employee module backend foundation (API/service scaffolding; UI shipped in 0.4.0)
