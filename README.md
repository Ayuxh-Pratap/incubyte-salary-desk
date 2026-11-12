# Salary Desk

Employee salary management for an HR Manager at fictional **ACME**. Find a person, safely correct current annual base pay, and answer compensation questions for a defined population of **10,000 synthetic employees**.

[Live application](https://incubyte-salary-desk.vercel.app/) · [Assessment report](https://incubyte-salary-desk.vercel.app/presentation) · [Public source](https://github.com/Ayuxh-Pratap/incubyte-salary-desk) · [CI](https://github.com/Ayuxh-Pratap/incubyte-salary-desk/actions/workflows/ci.yml)

**▶ [Watch the completed video demonstration · 6:07](https://incubyte-salary-desk.vercel.app/presentation#video-demo)**

[Download the MP4](https://github.com/Ayuxh-Pratap/incubyte-salary-desk/releases/download/assessment-demo/video_submission.mp4) · [Google Drive copy](https://drive.google.com/file/d/1FGpzW7rgdZh1LGN2pIOwVDh4gqT9HyEY/view?usp=sharing) · [Recording script](docs/DEMO_SCRIPT.md) · [Submission checklist](docs/DELIVERY.md). The video includes audio and is hosted separately; the large recording is not committed to source or bundled into Vercel.

## Evaluator entry point

1. Open the live application and enter the evaluator code supplied privately in the submission email. **No Vercel account is needed.** The code is deliberately absent from this repository. If it was omitted, request it from the candidate.
2. Dashboard separates global headcount from annual-base statistics in one currency. Open Employees, search/filter/page through bounded results, and inspect a person's compensation.
3. Preview a salary correction. Only a confirmed, version-checked save shows success; stale edits require review and failed saves retain the draft.
4. Salary Overview summarizes **every matching employee**, across all pages. Explain a number and follow its matching population.
5. Presentation is the assessment report: scope, connected architecture/data/update/cache diagrams, actual code, decisions, AI collaboration and versioned evidence. Its appendix/source views link to canonical files on GitHub.

## Documentation map

| Read | What it answers |
| --- | --- |
| [One-page requirements](REQUIREMENTS.md) | Goal, scope, acceptance criteria, exclusions; committed before implementation |
| [Assessment report source](docs/PRESENTATION.md) | Reviewer-oriented scope, implementation, decisions and evidence |
| [Architecture and decisions](docs/ENGINEERING.md) | Modules, data model, exact money, query/cache/update rules and tradeoffs |
| [Local setup](docs/LOCAL_SETUP.md) | Fresh setup versus daily work, variables, migrations/seed and tests |
| [Engineering/interview guide](docs/INTERVIEW.md) | Trace a read, save and calculation; explain choices and limitations |
| [Delivery and readiness](docs/DELIVERY.md) | Requirement-to-evidence checklist, release gates, internal rubric and video script |
| [Release verification](docs/release-verification.json) | Source/environment of current checks; earlier measurements remain historical |
| [AI collaboration](docs/AI_COLLABORATION.md) | Real instructions, accepted/revised proposals, corrections and verification |
| [Design foundation](DESIGN.md) | Shared tokens, accessibility adaptations and paper report treatment |
| [Historical performance](docs/FINAL_PASS.md) | Payloads, SQL/network timings and chart-replay diagnosis with original sources |

## Run locally

Node **24.x** and npm (lockfile checked with npm **11.17.0**). Persistent relational PostgreSQL; hosted development is sufficient, with no local Docker prerequisite.

```powershell
git clone https://github.com/Ayuxh-Pratap/incubyte-salary-desk.git
cd incubyte-salary-desk
npm ci
Copy-Item .env.example .env.local
```

Edit `.env.local`: your own development pooled/direct PostgreSQL URLs, `DATABASE_PURPOSE=development`, `APP_ORIGIN=http://localhost:3000`, and distinct random session/evaluator secrets. Never commit or share these values. Then, **on your fresh designated development database**:

```powershell
npm run db:migrate
npm run db:seed
npm run dev
```

Open `http://localhost:3000` and sign in with **your own** `EVALUATOR_PASSWORD`. Daily development is just `npm run dev`; no reset or reseed is required. The explicit insert-only seed preserves salary edits and checks exactly 10,000 employees. Reset is a separate destructive operator command.

```powershell
npm test
npm run lint
npm run typecheck
npm run design:check
npm run build:verify
```

For isolated PostgreSQL/full production-browser tests, configure a **different** `TEST_DATABASE_URL` / `TEST_DATABASE_PURPOSE=test`, then follow [complete test and production-rehearsal commands](docs/LOCAL_SETUP.md). Never point tests at the public demo.

## Business scope and clarification

While awaiting clarification, the candidate approved current **annual base pay**, explicit currency/period and single-currency analysis. No employer clarification reply is present in the supplied assessment material; unanswered choices are not employer-approved.

Bonuses, equity, benefits, deductions, tax and payroll are excluded. Amounts are positive and currency-precision aware; missing values never become zero. Country and pay currency are independent. There is **no FX conversion or mixed-currency monetary total**. Supported operations are browse/search/filter/sort/page, detail, current-salary update and descriptive analysis. No employee creation/deletion, history or future-effective changes. Figures do not establish fairness or explain pay differences.

## Engineering approach

Next.js App Router/TypeScript modular monolith; PostgreSQL/Drizzle; Zod; Vitest/Playwright; Tailwind/Base UI/Animate UI/Motion. Chart.js is scoped to bounded Dashboard series. No product LLM or external cache service.

Exact BIGINT minor units and string JSON preserve amounts; medians retain a denominator. Shared SQL predicates align directory and analysis. Conditional versions prevent lost writes. APIs stay authenticated/private/no-store; bounded session memory provides fresh reuse and explicit expiry/invalidation. One encrypted evaluator identity suits this synthetic assessment; full IAM/audit history are excluded.

The genuine incremental history includes corrections and UI revisions; it was not reconstructed or squashed into a fictional sequence. [Third-party notices](THIRD_PARTY_NOTICES.md) preserve reuse licenses. Correspondence, resume, credentials, evaluator codes and operational logs are excluded.

Production uses its existing purpose-marked demo database; previews/tests use separate databases. Current verification is linked above. Historical review reports retain their sources and limitations; they are not fresh benchmarks or an Incubyte rubric.
