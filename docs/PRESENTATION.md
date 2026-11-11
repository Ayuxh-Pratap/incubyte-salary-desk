# Salary Desk engineering presentation

A curated reader for the assessment, backed by the working code and selected canonical records. This document is the narrative source rendered inside the evaluator-protected application. It is not evidence of employer approval or a human-only development process.

## Start here

### A clear view of current pay

ACME's HR Manager manages 10,000 employees across countries. Spreadsheets make it difficult to find the right person, make a careful salary correction, and compare a clearly defined population without mixing units or currencies.

Salary Desk makes those three tasks explicit. It is an independent assessment concept using entirely synthetic data. The candidate approved the working definitions; external clarification remains pending.

### Review it in five minutes

1. Open [Dashboard](/dashboard?currency=USD). Separate global headcount from annual base pay in the selected currency; inspect the distribution and its exact bands.
2. Visit [India employees paid in USD](/employees?country=IN&currency=USD). Search or page through bounded results, open a person, and inspect the change preview. Saving uses a version check; failed saves preserve the draft.
3. Inspect [USD analysis by department](/overview?currency=USD&groupBy=department). Its statistics cover every matching employee, not the visible directory page. Explain a median and follow the matching population.
4. Continue to [Architecture and flows](/presentation/architecture), then [Quality and evidence](/presentation/quality). Trace one rule and inspect the verification's source and environment.

### Know which version you are reviewing

The public repository and deployed application contain the published baseline. This local review adds the refined workspace, protected browser cache, charts and this Presentation. Review changes remain unpublished until the candidate authorizes the release.

The final narrated candidate video is still pending. A demo script and silent baseline clip do not satisfy that deliverable. This presentation does not submit the assessment.

## Product and scope

### One user, three connected tasks

The HR Manager needs to find people, correct current pay safely, and answer descriptive compensation questions for a trustworthy population. The product connects those tasks instead of filling a generic dashboard with unrelated metrics.

The Dashboard orients and directs. Employees is the operational directory/editor. Salary Overview is the detailed, filtered analysis workspace. Four financial cards show total, median, minimum and maximum; headcount remains in the population line.

### Working definitions, not employer confirmation

Current annual base salary is explicit in the data and UI. Bonuses, equity, benefits, deductions and payroll are excluded. Salary values are positive; missing values never become zero. Countries and pay currencies are independent. Totals and comparisons use one currency; no FX conversion is assumed.

There is no employee creation/deletion, salary history, future-effective scheduling, import pipeline or product chatbot. These require additional business rules and would delay a complete assessment. The two focused enhancements are explaining a number and previewing a salary change.

The one-page requirements below were committed before application implementation. They remain the compact scope authority; extended reasoning belongs in the engineering notes.

```document
requirements
```

## Architecture and flows

### A modular monolith with visible boundaries

Next.js serves the UI and thin authenticated HTTP routes. Pure TypeScript rules do the monetary work. Drizzle queries and a small persistence adapter connect to PostgreSQL. A separate backend or cache service was not justified.

```diagram
architecture
```

Source map: the request boundary is `src/server/http.ts`; domain rules are in `src/domain`; SQL is in `src/server/employees`, `analysis` and `dashboard`. [Read the architecture notes](/presentation/artifacts/engineering).

### Relational constraints protect the persisted state

Employees reference country, currency, department and role. The environment marker belongs to deployment protection, not an employee relationship. Positive bounded minor units, annual period, unique employee number and version constraints are enforced in PostgreSQL.

```diagram
model
```

```source
schema
```

### Read, filter and page without a browser-side copy

The server validates URL filters and allowlists sorting, adds a stable id tie-breaker, then applies `LIMIT/OFFSET`. Normal pages combine a window count with the bounded rows in one statement; an offset past the end has a deliberate clamped-page fallback. List and analysis share the same predicate. An aggregate over 10,000 records can be appropriate; sending those records to the browser is a different concern.

```source
queries
```

### Follow a salary change

The server parses decimal input directly into exact minor units. Currency and annual period remain immutable in this workflow. A conditional update checks the version: one concurrent writer succeeds; a stale writer receives a conflict rather than silently overwriting newer pay.

```diagram
salary
```

```source
salary
```

### Exact money is independent of the chart API

Minor-unit amounts stay `BIGINT`/`BigInt` and cross JSON as strings. SQL totals use exact numeric arithmetic. The median retains its one- or two-value denominator, including half a minor unit for even populations. Display rounding is deliberate. Only bounded employee counts become chart numbers; salary boundaries remain exact strings in tooltips and tables.

```source
money
```

### A short-lived browser snapshot, not a public salary cache

The authenticated workspace owns a bounded memory cache. Exact URL keys include the relevant population and view state under a session scope. Fresh returns reuse their view. Visible expired views revalidate; hidden tabs wait until visible/focused. Saves invalidate salary-bearing results and notify other tabs; sign-out and 401 responses clear protected memory.

```diagram
cache
```

[Inspect the cache](/presentation/source/cache) and [freshness hook](/presentation/source/freshness). Monetary and session protections remain server responsibilities even when the browser reuses a snapshot.

## Decisions and AI collaboration

### Scope decisions kept the product coherent

The candidate approved current annual base salary, single-currency comparisons, current-value edits and a protected synthetic evaluator experience. Employer clarification was requested separately; no unanswered definition is presented as confirmed by Incubyte.

TypeScript/Next.js/PostgreSQL/Drizzle/Zod and a modular monolith fit the role and the short delivery window. Hosted development avoids a local Docker prerequisite. Separate purpose-marked test/demo/preview databases reduce the risk of testing against the demonstration.

### Revisions followed observed failures

- **Exact money:** the recorded missing-module failures preceded the initial rules. Tests then protected currency precision, parsing, bounds, medians and rounding. Later real PostgreSQL fixtures checked aggregate overflow and concurrency.
- **Async drafts:** a delayed response originally reset newer unapplied text. The recorded first-failing browser case led to submission-snapshot handling and, later, immediate same-route URL updates.
- **UI reuse:** early palette interpretation drifted from the actual foundation. The candidate then locked Job Desk's runtime system. A standalone 216-value manifest checks the retained foundation without loading the private sibling application.
- **Read performance:** measurements found repeated lookup reads and WAN round trips, not a 10,000-record browser response. Query consolidation and a bounded session cache followed those observations. No speculative index or service was added.
- **Chart replay:** the final production probe distinguished HTTP revalidation from canvas recreation. New array/callback identities and a broad root-style observer caused repeated destroy/new cycles. Persistent instances and in-place updates correct the lifecycle while preserving freshness.

```diagram
timeline
```

### AI helped implement; review established what could be accepted

AI assisted with interpretation, implementation, test proposals, UI adaptation and measurement tooling. The record includes accepted choices, corrections and failed checks. The candidate supplied the product decisions and must be able to explain and defend the result. This is not presented as human-only authorship or a flawless first attempt.

Concrete corrections include the initially miswired test-database harness, a narrowed-list serializer still expecting detail fields, overflow from an absolute screen-reader label, and canvas colors read before the applied theme. A script was also corrected when it measured before route readiness; discarded samples were not retained as valid results.

The timeline above is drawn from real commits. Recorded test-first cycles are identified in the AI record; no test-first claim is made for every presentation wrapper. Where a decision's timing was not recorded, its present rationale is not rewritten as historical evidence.

[Open the actual AI record](/presentation/artifacts/ai-record). [Inspect the chart lifecycle](/presentation/source/chart).

## Quality and evidence

### Read evidence by version, environment and behavior

The current local record below is generated from completed checks, not copied from a previous pass. Earlier reports remain explicitly historical. Hosted CI and deployed persistence evidence describe the published baseline until this review is released.

```evidence
current
```

### Tests protect plausible failures

Fast deterministic unit cases cover precision, invalid input, maximum amounts, median/rounding rules, shared filters, update behavior and cache scope/deduplication/invalidation. PostgreSQL integration cases cover exact aggregates, stable pages, count/analysis intersections, constraints, seed preservation and a real simultaneous-write race. Browser cases distinguish live persistence from controlled latency/failure fixtures.

The final focused cases check stable chart instances for unchanged data, legitimate data/theme updates, hidden-tab freshness, currency alignment, Presentation access and salary-free Presentation navigation. Real idle observation complements accelerated-clock tests. Reduced motion is respected rather than used to hide replay.

### Performance has an environment, not a percentile slogan

The employee payload is bounded by page size. Full-population analysis stays in PostgreSQL. Reported query execution excludes WAN; browser journeys include route/data/rendering work. Samples identify first-process versus warm behavior and local versus deployed conditions. Small samples do not establish an SLA or a “top 1%” ranking.

The initial chart/custom-control bundle has a real cost. Presentation is server-rendered and does not initialize those charts or fetch salary data. The existing shared shell still needs client JavaScript for navigation, theme and access controls. The product has no LLM feature or LLM call site; external-request observations are recorded rather than assumed.

### Reproducibility and release gates

A lockfile and supported runtime, environment example without values, migrations, explicit deterministic seed/reset commands and isolated verification make the setup inspectable. Seeding is never a request/build side effect. No migration or reset is needed for this UI/Presentation pass.

The published repository/application and historical CI are linked below; local review publication and hosted review CI remain gates. The final narrated video and candidate-sent submission remain pending. No assessment email or submission is performed by the agent.

Physical-device and non-Chromium checks, complete assistive-technology/forced-colors/zoom review, and production cold-start/load/recovery remain limited or unverified. Working business definitions still await external clarification.

```artifacts
index
```
