# Contributing to DepositAI

## Development Setup

1. Fork the repo
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/deposit-ai.git
   cd deposit-ai
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy env vars:
   ```bash
   cp .env.example .env.local
   # Fill in your keys
   ```
5. Run dev server:
   ```bash
   npm run dev
   ```

## Workflow

1. Create a branch:
   ```bash
   git checkout -b feat/your-feature
   ```
2. Make changes
3. Run checks:
   ```bash
   npm run lint
   npm run type-check
   npm run test:unit
   ```
4. Commit with conventional commits:
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve bug in X"
   git commit -m "docs: update README"
   ```
5. Push and open a PR

## Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation
- `refactor:` — Code refactoring
- `test:` — Tests
- `chore:` — Tooling, deps

## Testing

- All new features must include unit tests
- All bug fixes should include a regression test
- E2E tests run on push to `main`

## Code Style

- TypeScript strict mode
- ESLint + Prettier (via `eslint-config-next`)
- No `any` types — use `unknown` if needed
- Validate all API inputs with Zod

## Database Changes

If you modify the schema:

1. Update `supabase/schema.sql`
2. Document the migration in your PR
3. Test against a fresh Supabase project

## Review Process

- All PRs require review
- CI must pass (lint, type-check, unit tests, build)
- No breaking changes without discussion

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
