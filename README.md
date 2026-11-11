# Salary Desk

A salary-management assessment concept for fictional ACME, inspired by Incubyte's public website accents. This is not an Incubyte internal product.

An HR Manager can find employees, safely update current annual base salary, and inspect comparable compensation populations. Only fictional data is permitted.

## Status

Documentation was committed before implementation. The protected responsive foundation, exact-money rules, schema and migration are implemented; hosted connection, employee workflows and deployment are still pending. External clarification has been requested by the candidate; the business rules below are user-approved working decisions, not Incubyte confirmations. No public repository or deployment exists yet.

## Working stack

Next.js App Router and TypeScript, PostgreSQL, Drizzle migrations, Zod, Vitest, Playwright, Tailwind and a selectively adapted shadcn/Base UI foundation. Development uses hosted PostgreSQL. Intended deployment: Vercel Hobby and Neon Free, subject to account availability. No paid resources.

## Start here

- [Requirements](REQUIREMENTS.md): one-page product scope and acceptance criteria.
- [Engineering](docs/ENGINEERING.md): architecture, decisions, reuse map and financial rules.
- [Delivery](docs/DELIVERY.md): implementation sequence, checks and handoff status.
- [AI collaboration](docs/AI_COLLABORATION.md): actual decisions and verification.
- [Design](DESIGN.md): presentation tokens and component behavior.
- [Third-party notices](THIRD_PARTY_NOTICES.md).

## Initial setup

Node.js 24 LTS is selected. Install with `npm ci`. Copy `.env.example` to ignored `.env.local`; set a random session secret (32+ characters), evaluator passphrase (16+), exact application origin, and hosted PostgreSQL URLs. Run `npm run dev` for the protected foundation; `npm run db:migrate` applies the migration to the explicitly marked environment. Employee seed is the next slice. Run `npm test`, `npm run lint`, `npm run typecheck`, `npm run design:check`, `npm run build`, and `npm run test:e2e` for the implemented checks. Test and demo database connections must be distinct. Never commit credentials. Exact commands will be added when implemented and checked.

## Scope boundary

Current annual base salary, positive amounts, explicit currency and period, single-currency analysis. No FX, payroll, employee creation/deletion, salary history or future-effective changes. See the requirements for the complete agreed boundary.

## Synthetic seed

After configuring and migrating a dedicated database, run `npm run db:seed` explicitly. It inserts deterministic IDs with conflict-do-nothing and verifies exactly 10,000 rows; existing salary edits survive normal repeats. Reset is separate: explicitly set `ALLOW_DEMO_RESET=true` and run `npm run db:reset -- --confirm=RESET-SYNTHETIC-development` against the marked development database (substitute the exact purpose only for an intended synthetic environment). Reset discards salary edits. Never seed on build or request. Hosted execution is pending configuration.
