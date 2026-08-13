# DepositAI

> Create secure, compliant direct deposit forms instantly with AI — streamline payroll setup and reduce errors effortlessly.

## Why

Payroll setup is slow, error-prone, and compliance-heavy. DepositAI uses AI to auto-fill, validate, and generate bank-ready direct deposit forms in seconds.

## Features

- **AI-powered form generation** — auto-fill from employer/employee data
- **Compliance validation** — NACHA rules, bank requirements, state regulations
- **Error reduction** — real-time validation of routing numbers, account types, names
- **Bank-grade security** — encrypted at rest, SOC 2 ready
- **Multi-format export** — PDF, CSV, bank API payload
- **Audit trail** — every form tracked for compliance

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind |
| Backend | Node.js, Fastify |
| AI | OpenAI GPT-4o, function calling |
| Validation | Zod, NACHA rules engine |
| Database | PostgreSQL (Supabase) |
| Auth | Clerk |
| Hosting | Vercel + Supabase |

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full breakdown.

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md).

## License

MIT