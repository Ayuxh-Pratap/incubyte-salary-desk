# Local setup and operating guide

## Fresh setup

Use Node **24.x** (verified with 24.19.0) and npm (11.17.0 used for the lockfile). `npm ci` reproduces package-lock.json. PostgreSQL 17 is used in CI; hosted development needs no Docker.

```powershell
git clone https://github.com/Ayuxh-Pratap/incubyte-salary-desk.git
cd incubyte-salary-desk
npm ci
Copy-Item .env.example .env.local
```

Copy the example only on a **fresh** setup; preserve an existing `.env.local`. All environment files except the non-secret example are ignored.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Your development runtime PostgreSQL URL; provider pooling is supported |
| `DATABASE_DIRECT_URL` | Direct URL to that same development database for migrations |
| `DATABASE_PURPOSE` | `development`; checked against the persisted purpose marker |
| `APP_ORIGIN` | Exact local origin, normally `http://localhost:3000`; mutation/session allowlist |
| `SESSION_SECRET` | Distinct random 32+ character value sealing the encrypted session cookie |
| `EVALUATOR_PASSWORD` | Your own random local 16+ character access code; never publish the production code |
| `TEST_DATABASE_URL` | Separate isolated test DB, never development/demo/preview |
| `TEST_DATABASE_PURPOSE` | `test`; mandatory for integration/live-browser tests |
| `ALLOW_DEMO_RESET` | Keep `false`; deliberate guarded reset only |
| `DEMO_*` / `PREVIEW_*` | Optional private deployment connections; unnecessary for normal development |

Create a development database/branch with your PostgreSQL provider. Obtain its pooled/runtime and direct URLs from the secure connection panel. Use supported TLS verification (`sslmode=verify-full` in the documented Neon setup). Do not paste URLs into chat or commit them.

Generate independent secrets by running this twice, entering each output into the corresponding private variable:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Initialize the **new development database**:

```powershell
npm run db:migrate
npm run db:seed
npm run dev
```

Migration creates schema/purpose marker and refuses an existing different-purpose database. Seed creates deterministic lookup rows and exactly 10,000 fictional employees; conflicts preserve salary edits. A normal start performs neither operation.

Open `http://localhost:3000`. Sign in with your configured `EVALUATOR_PASSWORD`. Development uses supported Webpack mode to avoid the recorded Windows/Turbopack development reload issue. Production is built independently with the default compiler.

## Daily development

For the owner's existing checkout:

```powershell
Set-Location C:\dev\incubyte-salary-desk
npm run dev
```

Use `npm ci` on fresh install or after lockfile changes; migrate only for actual new migrations. Do not reset/reseed daily.

## Verification

```powershell
npm test
npm run lint
npm run typecheck
npm run design:check
npm run build:verify
```

Unit cases need no database/network. Create a **separate test database**, set its private URL/purpose, then:

```powershell
npm run test:prepare
npm run test:integration
npx playwright install chromium
$env:E2E_LIVE_DATABASE='true'
try { npm run test:e2e } finally { Remove-Item Env:E2E_LIVE_DATABASE -ErrorAction SilentlyContinue }
```

`test:prepare` migrates/marks only the isolated test DB. Integration checks verify that marker, seed synthetic data and roll back/restore fixtures. Browser writes assert the server's test-purpose header. The full browser suite builds/starts its production server on **3100**; keep that port free and do not run two Playwright processes into the same output directory.

`test:e2e:live` runs only the single live HR workflow. `test:e2e` without the live flag skips isolated-live cases and uses fixtures for several failures. `ui:capture` is the optional Workspace matrix. CI uses disposable PostgreSQL 17; Docker is not a local prerequisite.

## Production version locally

```powershell
npm run build:verify
node --env-file=.env.local node_modules/next/dist/bin/next start --port 3000
```

Explicit Node 24 env-file loading puts **your development settings before Next starts**. The owner's checkout also has an ignored production environment file: plain `npm start` may otherwise use demo settings. Keep `.env.local` set to development and never export production credentials into the shell. This command uses development persistence and your local code; it does not deploy.

`build:verify` compiles with database/session credential variables explicitly blank in its child process; operator environment files remain untouched. Build/start never seeds/resets data.

## Deployment/operator boundaries

Existing Vercel Node 24/iad1 and Neon US East project. Runtime: environment-specific pooled DATABASE_URL, matching DATABASE_PURPOSE, SESSION_SECRET and EVALUATOR_PASSWORD. APP_ORIGIN is explicit locally; Vercel-issued deployment origins are supported. Production requires `demo`; previews require `preview`. Secrets remain server-side. No replacement infrastructure or paid upgrade.

Only actual schema changes need migration through the corresponding direct URL. This release needs no demo migration, reseed or reset.

**Reset is destructive and not a setup step.** It requires ALLOW_DEMO_RESET=true, matching purpose and exact `--confirm=RESET-SYNTHETIC-<purpose>`. It discards salary edits. Keep it disabled and never use it for release verification.

Troubleshooting: incorrect login → your local private code; origin rejection → align APP_ORIGIN/port; purpose mismatch → fix connection/purpose, never bypass; test isolation rejection → create a separate DB. Unreachable storage must show error/retry, not fabricated data.
