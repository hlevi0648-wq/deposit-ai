# DepositAI

AI-powered direct deposit form builder for modern payroll teams. Create, validate, and manage NACHA-compliant direct deposit forms with AI extraction, bank verification, and automated notifications.

## Features

- **AI Form Extraction** — Upload a void check, W-4, or offer letter; GPT-4o extracts fields automatically
- **ABA Routing Validation** — Real-time checksum validation on routing numbers
- **NACHA Compliance** — Built-in field length and format checks
- **Plaid Bank Verification** — Connect bank accounts via Plaid Link for verified ACH data
- **Bulk CSV Import** — Upload hundreds of forms at once with per-row validation
- **PDF Export** — Branded, downloadable direct deposit authorization forms
- **Email Notifications** — Resend-powered templates for submissions, approvals, and admin alerts
- **SMS Notifications** — Twilio-powered confirmation and approval messages
- **Approval Workflow** — Pending → Approved/Rejected with audit trail
- **Audit Log** — Immutable record of every action (created, updated, approved, exported)
- **Webhook Receiver** — External system integration for payroll/HRIS/NACHA processors
- **Auth** — Clerk-powered sign-in/sign-up with protected routes

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | Clerk |
| Database | Supabase (PostgreSQL) |
| AI | OpenAI GPT-4o |
| Email | Resend |
| SMS | Twilio |
| Bank Verification | Plaid |
| PDF | pdf-lib |
| Hosting | Vercel |
| Testing | Jest + Playwright |

## Quick Start

### Prerequisites

- Node.js 20+
- npm

### Install

```bash
git clone https://github.com/hlevi0648-wq/deposit-ai.git
cd deposit-ai
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

| Variable | Description | Where to Get |
|---|---|---|
| `OPENAI_API_KEY` | GPT-4o API key | [platform.openai.com](https://platform.openai.com/api-keys) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | [dashboard.clerk.com](https://dashboard.clerk.com) |
| `CLERK_SECRET_KEY` | Clerk secret key | Same |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | [supabase.com/dashboard](https://supabase.com/dashboard) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Same |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Same |
| `RESEND_API_KEY` | Resend API key | [resend.com](https://resend.com/api-keys) |
| `FROM_EMAIL` | Sender email | Must be verified in Resend |
| `ADMIN_EMAIL` | Admin notification email | Your HR/admin inbox |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | [twilio.com/console](https://www.twilio.com/console) |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | Same |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | Your Twilio number |
| `PLAID_CLIENT_ID` | Plaid client ID | [dashboard.plaid.com](https://dashboard.plaid.com) |
| `PLAID_SECRET` | Plaid secret | Same |
| `PLAID_ENV` | Plaid environment | `sandbox`, `development`, or `production` |
| `WEBHOOK_SECRET` | Webhook bearer token | Generate a secure string |

### Database Setup

1. Create a new Supabase project
2. Go to **SQL Editor**
3. Paste the contents of [`supabase/schema.sql`](./supabase/schema.sql)
4. Click **Run**

### Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/forms` | POST | Submit a new direct deposit form |
| `/api/forms` | GET | List all forms (50 most recent) |
| `/api/forms/approve` | POST | Approve or reject a form |
| `/api/forms/export` | GET | Download a form as PDF |
| `/api/forms/import` | POST | Bulk import forms via CSV |
| `/api/ai/extract` | POST | AI-extract form fields from document text |
| `/api/plaid/verify` | GET | Get a Plaid Link token |
| `/api/plaid/verify` | POST | Exchange Plaid public token + verify bank |
| `/api/audit` | GET | Fetch audit log entries |
| `/api/webhook` | POST | Receive webhooks from external systems |

### Webhook Events

```json
POST /api/webhook
Authorization: Bearer <WEBHOOK_SECRET>

// Status update
{ "event": "form.status_update", "formId": "uuid", "status": "approved" }

// Export request
{ "event": "form.export_requested", "formId": "uuid" }

// Audit append
{ "event": "form.audit_append", "formId": "uuid", "data": {} }
```

## Testing

### Unit Tests

```bash
npm run test:unit
```

### E2E Tests

```bash
npm run test:e2e
```

### All Tests

```bash
npm run test
```

## CI/CD

GitHub Actions workflow runs on every push/PR to `main`:

1. **Lint** — ESLint
2. **Type Check** — TypeScript compiler
3. **Unit Tests** — Jest
4. **Build** — Next.js production build
5. **E2E Tests** — Playwright (only on push)

Vercel auto-deploys on every push to `main` after CI passes.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (ClerkProvider)
│   ├── page.tsx                # Landing page
│   ├── builder/page.tsx        # Form builder with AI auto-fill
│   ├── dashboard/page.tsx      # Forms dashboard + approve/reject
│   ├── import/page.tsx         # Bulk CSV import
│   ├── audit/page.tsx          # Audit log viewer
│   ├── sign-in/                # Clerk sign-in
│   ├── sign-up/                # Clerk sign-up
│   └── api/
│       ├── forms/route.ts      # POST/GET forms
│       ├── forms/approve/route.ts
│       ├── forms/export/route.ts
│       ├── forms/import/route.ts
│       ├── ai/extract/route.ts
│       ├── plaid/verify/route.ts
│       ├── audit/route.ts
│       └── webhook/route.ts
├── lib/
│   ├── openai.ts               # GPT-4o extraction
│   ├── supabase.ts             # Supabase clients
│   ├── email.ts                # Resend templates
│   ├── twilio.ts               # SMS templates
│   ├── pdf.ts                  # PDF generation
│   ├── validation.ts           # Zod + ABA + NACHA
│   └── utils.ts                # cn() helper
├── middleware.ts               # Clerk route protection
supabase/
└── schema.sql                  # Database schema
tests/
├── unit/                       # Jest unit tests
└── e2e/                        # Playwright e2e tests
.github/workflows/ci.yml        # CI/CD pipeline
```

## CSV Import Format

Required columns:

```
employeeName,employeeEmail,routingNumber,accountNumber,accountType,employerName,payFrequency,depositType
```

Optional columns:

```
employeePhone,bankName,employerId,depositAmount
```

Example:

```csv
employeeName,employeeEmail,employeePhone,bankName,routingNumber,accountNumber,accountType,employerName,employerId,payFrequency,depositAmount,depositType
John Doe,john@test.com,5551234567,Bank of America,026009593,1234567890,checking,Acme Corp,12-3456789,biweekly,,full
Jane Smith,jane@test.com,,Wells Fargo,121000358,9876543210,savings,Acme Corp,12-3456789,biweekly,50,percent
```

## License

MIT
