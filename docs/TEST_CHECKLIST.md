# Acceptance Test Checklist

Manual/functional acceptance checklists per feature area. Status reflects the last time each item was actually verified — update it when you re-verify, don't assume it still holds after a related change.

Legend: ✅ Verified · 🟡 Partially verified · ⬜ Not yet verified · ➖ Not applicable (feature not built)

---

## Dashboard

| Feature | Expected result | Status |
|---|---|---|
| `/` root | Permanently redirects (308) to `/dashboard` | ✅ |
| KPI cards | Shows real counts (customers, today's tasks, overdue, completed this month, pending documents) from `/api/workflow` | ✅ |
| Today's Tasks | Lists tasks whose deadline is today | ✅ |
| Overdue Tasks | Lists tasks with a past deadline and status ≠ completed | ✅ |
| Missing Documents | Lists tasks missing any of the 7 document/tax flags | ✅ |
| Tax Deadline Dashboard | Breaks down tasks due within 7 days by VAT/PND1/PND3/PND53/SSO | ✅ |
| Interactive Calendar | Marks days with a task deadline; clicking a date filters a new task list section | ✅ |
| Monthly Charts | All 4 charts (line/bar/donut/stacked bar) render from real `/api/workflow` data, including on an empty database | ✅ |
| Recent Activity | Shows real `ActivityLog` rows; updates after a customer create/update/delete | ✅ |
| Responsive Sidebar | Collapsible on desktop (persisted via cookie); off-canvas `Sheet` + hamburger on mobile | ✅ |

**Command example** — confirm the dashboard's data endpoint returns real, non-mock data:
```bash
curl -s http://localhost:3000/api/workflow | jq '.summary'
```

---

## Authentication

| Feature | Expected result | Status |
|---|---|---|
| Unauthenticated page request | Redirects (307) to `/login` | ✅ |
| Unauthenticated API request | Returns 401 JSON, not a redirect | ✅ |
| Login — wrong password | 401, Thai error message, no cookie set | ✅ |
| Login — correct credentials | 200, `Set-Cookie: session=...` (httpOnly, `sameSite=lax`, `path=/`, `Max-Age=604800`) | ✅ |
| `GET /api/auth/me` with valid cookie | 200, returns `{id, email, roles}` | ✅ |
| `POST /api/auth/logout` | 200, cookie cleared (`Max-Age=0`) | ✅ |
| Protected page with valid cookie | Loads normally (no redirect) | ✅ |
| Admin-only page (`/settings`) as admin | Loads normally | ✅ |
| Admin-only page as `staff` | Redirects to `/dashboard` | ⬜ (no staff user seeded yet to test against) |
| `/login` page itself | Renders without the app sidebar | ✅ |
| Seed script re-run | Idempotent — exits 0, does not create a duplicate user | ✅ |
| Permission enforcement inside existing APIs (e.g. `staff` blocked from `DELETE /api/customers/[id]`) | — | ➖ (explicitly deferred, not yet implemented) |

**Command examples:**
```bash
# Login and save the session cookie
curl -s -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@accoffice.local","password":"<password>"}' \
  -c cookies.txt

# Use the cookie against a protected route
curl -s -b cookies.txt http://localhost:3000/api/auth/me
```

---

## Customer

| Feature | Expected result | Status |
|---|---|---|
| List customers | Table with search + pagination, real data | ✅ |
| Create customer | Zod-validated form, POST `/api/customers`, activity logged | ✅ |
| Edit customer | Same form pre-filled, PUT `/api/customers/[id]`, activity logged | ✅ |
| Delete customer | Confirm dialog, DELETE `/api/customers/[id]`, activity logged, 404 if already gone | ✅ |
| Customer detail page | Shows full profile, service info | ✅ |
| Duplicate-name/tax-ID validation | Zod schema rejects empty required fields | ✅ |

---

## Workflow

| Feature | Expected result | Status |
|---|---|---|
| List/filter tasks | Filter by month, year, status, customer, employee, search | ✅ |
| Task detail page | Read-only view of a single `CustomerTask` | ✅ |
| Task mutation (status/progress/assignment) | — | ➖ (no `PATCH /api/workflow/[id]` yet — planned in Epic 3/5) |
| Assign employee to task | — | ➖ (planned in Epic 3) |

---

## Employee

| Feature | Expected result | Status |
|---|---|---|
| Employee CRUD | — | ➖ (Epic 3, not started) |
| Employee list — search/filter/status | — | ➖ |
| Employee profile page | — | ➖ |
| Assign workflow to employee | — | ➖ |
| Employee dashboard (workload summary) | — | ➖ |
| Role assignment / account creation | — | ➖ |
| Attendance placeholder | — | ➖ |
| Leave placeholder | — | ➖ |

---

## Documents

| Feature | Expected result | Status |
|---|---|---|
| Document upload | — | ➖ (Epic 4, no `Document` model yet — schema decision pending) |
| Document listing per customer | — | ➖ |
| Document-upload activity logging | — | ➖ |

---

## Finance

| Feature | Expected result | Status |
|---|---|---|
| Revenue tracking | — | ➖ (Epic 6, no invoice/payment model yet) |
| Finance page | Currently a placeholder stub | 🟡 |

---

## Reports

| Feature | Expected result | Status |
|---|---|---|
| Real aggregated reports | — | ➖ (Epic 7, not started) |
| Reports page | Currently a placeholder stub | 🟡 |
