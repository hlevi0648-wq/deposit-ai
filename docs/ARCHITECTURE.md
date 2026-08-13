# Architecture

## System Overview

```
[User] → [Next.js Frontend] → [Fastify API] → [AI Service (GPT-4o)]
                                      ↓
                                [Validation Engine]
                                      ↓
                                [PostgreSQL] ← [Audit Log]
                                      ↓
                                [Export Service] → PDF / CSV / Bank API
```

## Components

### 1. Frontend (Next.js 14)
- Form builder UI with live AI suggestions
- Preview pane showing final form
- Auth via Clerk
- Deployed on Vercel

### 2. API (Fastify)
- REST + tRPC endpoints
- Rate limiting, request validation
- JWT auth middleware

### 3. AI Service
- GPT-4o with function calling
- Extracts employer/employee data from uploaded docs (W-4, offer letter, void check)
- Suggests field mappings
- Flags missing info

### 4. Validation Engine
- **Routing number validation** — ABA checksum algorithm
- **Account type validation** — checking vs savings
- **NACHA format compliance** — field lengths, character sets
- **State-specific rules** — pay frequency, minimum wage checks
- **Duplicate detection** — same employee, different forms

### 5. Database (PostgreSQL / Supabase)
- `forms` — generated forms + metadata
- `employees` — employee directory (encrypted PII)
- `employers` — employer profiles
- `audit_log` — immutable trail

### 6. Export Service
- PDF generation (react-pdf)
- CSV export (NACHA format)
- Direct bank API integration (Plaid)

## Security

- **Encryption at rest** — Supabase + field-level encryption for PII
- **Encryption in transit** — TLS 1.3
- **Auth** — Clerk (SOC 2 Type II)
- **Audit** — every form generation, edit, export logged
- **PII handling** — account numbers tokenized, never stored in plaintext
- **Access control** — RBAC (admin, HR, employee)

## Compliance

- NACHA Operating Rules
- State payroll regulations
- GDPR / CCPA data subject rights
- SOC 2 Type II (target)