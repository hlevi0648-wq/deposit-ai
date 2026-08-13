# DepositAI

AI-powered direct deposit forms — secure, compliant payroll setup with reduced errors.

## Quick Start

```bash
npm install
cp .env.example .env.local  # Fill in your keys
npm run dev
```

Open [localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   ├── builder/            # Form builder UI
│   ├── dashboard/          # Forms dashboard
│   └── api/
│       ├── forms/          # Form CRUD
│       └── ai/extract/     # AI extraction endpoint
├── lib/
│   ├── utils.ts            # Utilities
│   └── validation.ts       # Zod schemas + NACHA validation
└── components/             # Shared components (TBD)
```

## Features

- AI-powered form auto-fill
- Real-time ABA routing number validation
- NACHA compliance checks
- Zod schema validation
- Dark fintech UI

## Tech Stack

Next.js 14 · TypeScript · Tailwind CSS · Zod · OpenAI · Supabase · Clerk

## License

MIT
