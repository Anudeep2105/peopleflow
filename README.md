# PeopleFlow HRMS

PeopleFlow is a full-stack HRMS starter built with Next.js App Router, React, TypeScript, Tailwind CSS, NextAuth credentials sessions, Prisma and PostgreSQL. The UI includes role-aware workspace dashboards and page layouts; API routes cover the main HR data workflows.

## Start locally with Docker

1. Copy `.env.example` to `.env`.
2. Set unique values for `POSTGRES_PASSWORD`, `NEXTAUTH_SECRET`, `HARDWARE_SYNC_TOKEN`, `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Use a password of at least 16 characters for the initial administrator. Keep `.env` private.
3. Start the database, web app and attendance reconciliation worker:

   ```powershell
   docker compose up --build -d
   docker compose exec app npm run db:seed
   ```

4. Open `http://localhost:3001` and sign in using the administrator email and password from `.env`.

PostgreSQL data and uploaded employee files are stored in Docker volumes. The app binds to localhost by default. Add SMTP settings before inviting staff or using password reset email. In development, reset links are printed to the server console; production requires SMTP configuration.

## Local development without Docker

Use Node.js 20+, PostgreSQL 16+, and the `.env` settings with a database URL reachable from the host.

```powershell
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

## Workspace roles

- **Super Admin:** workspace configuration, users, personnel, payroll, reports, recruiting and security controls.
- **HR Manager:** organization-wide people operations, recruiting, payroll, policy configuration, documents and reports.
- **Manager:** direct-report attendance, leave approvals, schedules, performance and team reporting.
- **Employee:** self-service attendance, leave requests, payslips, documents and personal performance.

The UI hides sections by role and protected pages and API handlers verify the session and role again on the server. Employee records are scoped to the signed-in employee; managers are scoped to direct reports.

## Included modules

- Credentials sign-in, sign-out, bcrypt password hashes, eight-hour JWT sessions checked against active account/password version, one-use expiring email reset links, signed-in password changes with current-password verification, and SMTP staff invitations.
- Employee and department records, encrypted bank details, reporting-line relationships, role-linked user access and private PDF/JPEG document storage.
- Web attendance punches, event sequencing checks, attendance exports, shifts, leave balances and manager approval decisions.
- Payroll policy, five salary structure samples, five payslip layouts and an India starting policy preset: 12% employee/employer EPF with a ₹25,000 wage ceiling (effective 17 September 2026), 0.75% employee and 3.25% employer ESI with a ₹21,000 eligibility threshold, and an allowance-based statutory wage floor. ESI continuation can be marked for employees already covered in the contribution period.
- Professional tax remains a state schedule input: set the payroll jurisdiction and monthly employee amount after checking the applicable state slab and exemptions. The preset starts at ₹0 because there is no single all-India professional tax rate.
- AI screening settings can be saved in Settings, including encrypted provider API keys, and checked with a connection test before screening candidates.
- Payroll sample PDFs can be downloaded for every payslip layout. Draft and approved runs can be voided with an audited reason; a corrected revision can then be created. Runs marked paid are locked because bank payments take place outside HRMS.
- Organization branding includes a protected PNG/JPEG logo upload used in generated payslips. Workspace dashboards start without sample statistics or fictional employee records.
- HR-managed organization compliance profile for legal entity and trade names, PAN/TAN/GSTIN, EPF/ESI/PT/LWF registration IDs, payroll jurisdiction/contact and registered address; saved details appear on generated payslips.
- Job postings, candidate intake and PDF resume parsing using configurable Ollama, Hugging Face, vLLM, OpenRouter or compatible OpenAI-style endpoints. Parsing and keyword match scores are audited and are not hiring decisions.
- Token-authenticated biometric event intake at `POST /api/v1/attendance/hardware-sync` and a separate reconciliation worker that flags duplicate or out-of-order punches.
- Cascading objectives and weighted key-result progress, feedback-cycle records and 360 feedback submissions.
- CSV headcount, attendance and leave reports, announcements, organization tree views and responsive role-based dashboards.

## API outline

All application APIs are under `/api/v1` except NextAuth and account recovery routes.

| Area | Routes |
| --- | --- |
| People | `GET/POST /employees`, `GET/PATCH/DELETE /employees/:id`, `/departments`, `/users` |
| Attendance | `GET /attendance`, `POST /attendance/punch`, `POST /attendance/hardware-sync` |
| Leave | `GET/POST /leave`, `PATCH /leave/:id/decision` |
| Shifts | `GET/POST /shifts` |
| Payroll | `/payroll/policies`, `/payroll/profiles`, `/payroll/self`, `/payroll/preview`, `/payroll/runs`, `/payroll/runs/:id/approve`, `/payroll/payslip` |
| Organization compliance | `GET/PUT /compliance/organization` (Super Admin and HR Manager) |
| Recruiting | `/ats/jobs`, `/ats/candidates`, `POST /ats/candidates/:id/screen` |
| AI configuration | `GET/PUT /ai/config` |
| AI connection test | `POST /ai/config/test` |
| Documents | `GET/POST /documents`, `GET /documents/:id` |
| Performance | `/okrs`, `PATCH /okrs/:id/key-results/:keyResultId`, `/feedback` |
| Reports | `GET /reports?type=headcount|attendance|leave` |

Hardware example:

```json
{
  "device_id": "GATE_01_HYD",
  "employee_card_id": "EMP-402",
  "timestamp": "2026-11-03T07:50:00Z",
  "event_type": "CHECK_IN"
}
```

Send the configured `HARDWARE_SYNC_TOKEN` as `Authorization: Bearer <token>` (or `x-device-token`). Register active devices and employee card IDs in PostgreSQL before sending events.

## Security and deployment notes

- Bank details are encrypted with AES-256-GCM using a key derived from `NEXTAUTH_SECRET`; changing that secret makes stored bank details unreadable. Keep it stable and back it up securely.
- Employee documents are stored outside the public web root. The starter uses a local Docker volume; use encrypted object storage and malware scanning for a shared deployment.
- Payroll seed policy is named **DEMO ONLY** and is disabled. Statutory deductions vary by effective law, location and employee eligibility; configure and validate policy values with qualified payroll staff before processing.
- The dashboard uses illustrative preview data. Operational tables load database records after setup; summary aggregates and some convenience UI actions are starter layouts.
- MFA controls are an explicitly labeled mock preview. MFA enforcement, rate limiting, a durable queue, production observability, formal Prisma migration history, backup/restore drills, retention workflows and an independent security review must be completed before production use.
- AI providers receive resume text for inference. Set organizational consent, retention and provider data-handling policies before enabling screening. Keep cloud API keys in server environment secrets. Review all extracted fields and scores with a human.

The included Docker startup uses `prisma db push` for first-run schema bootstrap. Before production, generate and review committed Prisma migrations and deploy them with `prisma migrate deploy` through a controlled release pipeline.
