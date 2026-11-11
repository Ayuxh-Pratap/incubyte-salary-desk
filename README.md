# Salary Desk

A salary-management assessment concept for fictional ACME, inspired by Incubyte's public website accents. This is not an Incubyte internal product.

An HR Manager can find employees, safely update current annual base salary, and inspect comparable compensation populations. Only fictional data is permitted.

## Status
Documentation approved and recorded before application implementation. Core implementation is next. External clarification has been requested by the candidate; the business rules below are user-approved working decisions, not Incubyte confirmations. No public repository or deployment exists yet.

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
Node.js 24 LTS is selected. After the foundation slice, install with npm ci, configure ignored .env.local from .env.example, migrate, explicitly seed, and start the application. Test and demo database connections must be distinct. Never commit credentials. Exact commands will be added when implemented and checked.

## Scope boundary
Current annual base salary, positive amounts, explicit currency and period, single-currency analysis. No FX, payroll, employee creation/deletion, salary history or future-effective changes. See the requirements for the complete agreed boundary.
