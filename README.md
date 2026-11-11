# Salary Desk

A focused salary workspace for an HR Manager at fictional **ACME**: find employees, safely correct current annual base salary, and understand a defined compensation population. This is an independent assessment concept, not an Incubyte internal system.

**Working scope is candidate-approved and pending Incubyte clarification.** Only synthetic data is permitted. The core product, hosted database behavior and production browser workflow are implemented and verified. Deployment ownership/publication and the candidate's final video are tracked in [Delivery](docs/DELIVERY.md).

## Try the workflow

1. Enter the privately shared evaluator code. Browse 10,000 employees using search, country/department/role/currency filters, stable sorting and bounded pages.
2. Open an employee. Enter a positive annual base amount; review the exact amount and percentage change before saving. A stale version requires review rather than overwriting another edit. Failed saves retain input.
3. Open Salary overview, select one currency and define a population. Inspect totals, extremes and median across **all** matching employees. Explain a number or drill into a group without changing filter semantics.

No FX, payroll, employee creation/deletion, salary history, future scheduling or product chatbot. See the concise [requirements](REQUIREMENTS.md).

## Stack and boundaries

Node 24 LTS; Next.js App Router/TypeScript; PostgreSQL 17; Drizzle; Zod; Vitest; Playwright; Tailwind; reviewed Base UI/Animate UI primitives. Modular monolith with pure money/use-case rules, server queries and access checks, thin HTTP routes and interactive React screens. [Architecture, decisions and four code walkthroughs](docs/ENGINEERING.md). [Design tokens and reuse](DESIGN.md). [Actual AI collaboration](docs/AI_COLLABORATION.md).

## Local setup — hosted PostgreSQL, no Docker prerequisite

Use Node 24 and npm. On a fresh checkout:

```sh
npm ci
```

Create ignored .env.local from [.env.example](.env.example). Configure a **pooled development URL**, **direct migration URL**, DATABASE_PURPOSE=development, APP_ORIGIN=http://localhost:3000, a random 32+ character SESSION_SECRET and a distinct 16+ character EVALUATOR_PASSWORD. Never commit credentials or paste them into chat. Neon URLs should verify TLS (sslmode=verify-full).

```sh
npm run db:migrate
npm run db:seed
npm run dev
```

Open http://localhost:3000. Development uses the supported Webpack mode because a Windows/Turbopack connected-view reload loop was reproduced; production builds use the default compiler and are independently tested. Production rehearsal: npm run build then npm start.

Migration marks a database's purpose; subsequent migration/runtime operations reject a mismatch. Configure **separate databases** for test, demo and preview. Normal seeds are explicit, deterministic, exactly 10,000 rows, insert-only on conflicts, and preserve existing salary edits. They never run on build/request. The seed has six countries/currencies, 0/2/3-decimal cases, tied values, varied names, a three-person group, and same-currency populations across countries. All ranges are illustrative, not market data.

## Verification

```sh
npm test                    # fast deterministic rules; no database required
npm run lint
npm run typecheck
npm run design:check
npm run test:prepare         # only the explicitly isolated test DB
npm run test:integration     # real PostgreSQL; seeds test DB, never demo
npm run test:e2e:live        # production build, real HR workflow, isolated test DB
npm run test:e2e             # access and controlled UI-failure tests; live case skips unless enabled
npm run perf:measure         # actual development query timings and plans
```

TEST_DATABASE_URL and TEST_DATABASE_PURPOSE=test are mandatory for database tests. The harness rejects development/demo/preview connection identities and checks the server's database-purpose header before browser writes. Fixture-based UI checks are labelled separately from live persistence evidence. Browser tests build and start a production server on port 3100, with no server reuse. CI uses disposable PostgreSQL 17; it introduces no local Docker prerequisite. [Verification status and limitations](docs/DELIVERY.md).

## Deployment operations and safe reset

Configure DEMO_DATABASE_URL / DEMO_DATABASE_DIRECT_URL and separate PREVIEW_DATABASE_URL / PREVIEW_DATABASE_DIRECT_URL in the ignored operator environment. Then:

```sh
npm run db:environment -- demo migrate
npm run db:environment -- demo seed
npm run db:environment -- preview migrate
npm run db:environment -- preview seed
```

For reset, deliberately enable ALLOW_DEMO_RESET=true and pass the exact purpose confirmation, for example npm run db:environment -- test reset --confirm=RESET-SYNTHETIC-test. **Reset discards all salary edits in that synthetic environment.** The flag and purpose marker are checked before truncation. Normal reseeding never performs a reset.

Vercel runtime needs only its environment's pooled DATABASE_URL, DATABASE_PURPOSE (demo for production, preview for previews), SESSION_SECRET and EVALUATOR_PASSWORD. Secrets stay server-side. Vercel-issued deployment origins are allowlisted from platform variables; APP_ORIGIN is required locally and for a custom canonical domain. Preview writes are rejected unless the database is marked preview. Migrate and seed explicitly before deploy; do not configure build hooks to run them. Node 24 and the iad1 function region are configured for the Neon US East project. No paid resources or upgrades.

The current temporary Neon project **expires 14 November 2026 at 08:00 UTC unless claimed**. That is a development/review facility, not a permanent submission database. Claim it into a free account or transfer the synthetic setup to a persistent free project before submission. See [Delivery](docs/DELIVERY.md) for the actual deployment and publication state.

## Evidence and limitations

Exact monetary minor units and rational medians are string-serialized; no floating-point money or mixed-currency total. A shared filter predicate drives lists and SQL analysis. [Measured observations and EXPLAIN plans](docs/performance.json) distinguish server execution from local WAN timings; no cold-start or SLA claim.

One shared evaluator identity, eight-hour encrypted cookie sessions and origin-checked writes suit this synthetic assessment. Full IAM, individual HR accounts and an audit history are deliberately excluded. Small groups are labelled; descriptive statistics establish neither pay fairness nor its causes. Salary updates are current-value corrections only.

[Third-party notices](THIRD_PARTY_NOTICES.md) preserve the selectively reused UI foundation and component/font licenses. Private assessment correspondence, resume, tailoring notes, credentials, logs and browser traces are excluded from source publication.
