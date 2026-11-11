# Salary Desk engineering case study

Canonical narrative for the evaluator-protected case study. Product facts come from the requirements and implementation; measurements remain attached to their recorded source and environment. The presentation is AI-assisted work, not a claim of employer approval or human-only authorship.

## Start here

### Help HR answer a question and make a safe correction

ACME's HR Manager has 10,000 employees across countries and needs to answer three ordinary questions: who is this person, what are they paid, and how does their pay compare with a clearly defined group?

A spreadsheet can hold those values, but the work becomes fragile when names repeat, units are implicit, totals mix currencies, or two people edit the same salary. Salary Desk makes the population and units visible, and makes a correction an explicit, checked action.

### Follow one HR question through the product

Start with [Dashboard in USD](/dashboard?currency=USD). Global headcount spans every currency; salary figures do not. Open [India employees paid in USD](/employees?country=IN&currency=USD), inspect an employee, and review a proposed change before saving. Finish in [USD analysis by department](/overview?currency=USD&groupBy=department), where every figure covers the matching population across all pages.

The case study below follows the same progression: define the job, draw the boundaries, trace a save, then inspect what was actually verified. Source excerpts and selected artifacts are available when a reviewer wants to go deeper.

## Product and scope

### Three surfaces, one connected workflow

**Dashboard orients.** Headcount by country and department, plus a selected-currency salary distribution, answer where the population is and which view to open next.

**Employees supports the correction.** Search, filters, stable sorting and bounded pages lead to a person's current compensation. The editor shows an exact change preview, preserves a failed draft and asks the user to review a newer version after a conflict.

**Salary Overview explains the population.** Total, median, minimum and maximum use the entire filtered group. Headcount stays in the population line. “Explain a number” names the definition, units and matching employees instead of leaving an unexplained dashboard value.

### Define comparable pay before calculating it

The candidate-approved working definition is **current annual base salary**, stored with explicit currency and period. Countries and pay currencies are independent. Bonuses, equity, benefits, deductions, tax and payroll are excluded. Values are positive; missing values do not become zero.

One currency is required for monetary analysis. No exchange rate or normalization policy was supplied, so there is no FX conversion or combined global salary total. Descriptive differences do not establish fairness or explain why pay differs.

These are working product decisions pending external clarification, not definitions approved by Incubyte. Creation/deletion, history, future-effective changes, imports and bulk edits were deliberately left out to complete a defensible core within the assessment window.

```document
requirements
```

## Architecture and flows

### One application, with responsibilities you can point to

Next.js owns the browser UI and authenticated request boundary. Pure TypeScript handles monetary and salary-update rules. Drizzle query modules and a small persistence adapter own PostgreSQL access. A second backend service, public salary cache or product LLM was not justified by this scope.

The diagram separates deployment boundaries from code responsibilities. A read can go directly from validated filters to a query; an edit also passes through the exact-money use case. Both reach the same persistent relational store.

```diagram
architecture
```

### The relationships are part of correctness

An employee references four lookup tables: country, pay currency, department and role. Currency precision determines which decimal inputs are valid. The employee row retains exact minor units, the annual period, a version and server-owned update metadata.

The independent environment marker is an operational guard, not another employee relationship. PostgreSQL constraints protect the stored values even if a caller gets past a UI check.

```diagram
model
```

```source
schema
```

### Twenty-five rows returned; the whole population counted

The list query applies a shared, parameterized predicate, allowlisted sort and id tie-breaker before database pagination. A normal page combines its count and bounded rows in one statement. A requested page past the end has a deliberate count-and-clamp fallback.

Analysis uses the same population predicate. Its aggregate may read thousands of matching rows in PostgreSQL; it does not send those employee records to the browser or calculate statistics from the visible page. The measured default response contained 25 employees, about 6.7 KB of decoded JSON.

```source
queries
```

### A save has more than one honest outcome

HR submits a decimal proposal with the version originally read. Access, origin and schema checks run on the server. The domain validates amount and units, then the repository performs a conditional update.

An invalid proposal returns a field error. A stale version returns a conflict. Only a confirmed update shows success and invalidates affected views. A failed or uncertain save keeps the draft; another writer's newer salary is never silently overwritten.

```diagram
salary
```

```source
salary
```

### Exact amounts never take a floating-point detour

The parser turns the decimal string directly into minor-unit `BigInt`. USD has two decimal places, JPY zero and KWD three. The database stores `BIGINT`; JSON carries amount strings. Totals use SQL numeric arithmetic.

An even-sized median keeps the sum of its two middle values and denominator two. That can preserve half a minor unit; display rounding happens deliberately at the boundary. Charts consume bounded employee counts, while their salary boundaries and labels remain exact strings.

```source
money
```

### Fast returns need a freshness policy

Each evaluator browser scope owns a bounded, 24-entry memory cache. The full URL identifies filters, sort, page, page size, currency and grouping. Fresh returns reuse the snapshot; visible expired views revalidate quietly. Hidden tabs wait until visible or focused. In-flight requests deduplicate and generations prevent an older result from winning.

Successful salary saves retain confirmed detail and invalidate list, analysis and Dashboard snapshots, including other tabs in the same scope. Sign-out or a 401 clears protected memory. API authentication and private/no-store responses remain authoritative; there is no publicly shared salary cache.

```diagram
cache
```

[Inspect the cache](/presentation/source/cache) and [freshness hook](/presentation/source/freshness). Directory/analysis/Dashboard fresh lifetime is 30 seconds, detail 15 seconds and lookups five minutes. Stale retention is bounded rather than indefinite.

## Decisions and AI collaboration

### The constraints explain the stack

The short assessment window and TypeScript role favored a modular monolith: Next.js, PostgreSQL, Drizzle and Zod, with Vitest and Playwright for different failure modes. Hosted development avoids a Docker prerequisite. Separate purpose-marked development, test, preview and demonstration databases keep verification from becoming a demo reset.

The candidate chose the product boundaries. AI helped interpret the brief, propose and implement code, write tests, adapt the UI and build measurement tools. The accepted work was checked against code and runtime evidence; this is not presented as human-only authorship or a flawless first attempt.

### What broke changed the implementation

**A newer draft was being reset by an older response.** A first-failing browser case led to submission-snapshot handling and immediate same-route URL changes. Unaccepted edits no longer issue requests or disappear when an accepted request finishes.

**The UI interpretation drifted from its source foundation.** The candidate locked Job Desk's actual design system. A standalone 216-value manifest now checks the retained tokens and mappings without a runtime dependency on the private sibling application.

**Charts looked as if the data kept recalculating.** Production instrumentation separated HTTP refresh from Chart.js instance creation. New arrays/callbacks and a broad root-style observer repeatedly destroyed and rebuilt charts. Persistent instances, current callback refs and in-place data/theme updates removed replay while keeping legitimate freshness.

```source
chart
```

### A real sequence, not a reconstructed story

The milestones below come from actual commits. Published milestones link to the public baseline; local review commits are explicitly unpublished. The AI record identifies the test-first cycles that were actually observed, along with corrections to database harnesses, serializers, overflow, theme timing and measurement readiness.

Where a decision's timing was not recorded, its current rationale is not relabeled as historical evidence. The case study is another AI-assisted presentation revision, not an additional product capability.

```diagram
timeline
```

[Read the actual AI collaboration record](/presentation/artifacts/ai-record).

## Quality and evidence

### Measure the waiting, then change the cause

The hypothesis was that every page downloaded 10,000 employees. The production traces did not support it: measured responses held 25 rows. Normal list reads used one query plus the environment-purpose check; fresh cached returns used neither HTTP nor SQL.

The remaining uncached wait was mostly round trips and connection setup. A direct pooled read including WAN took roughly 296–307 ms, while the measured list query executed in PostgreSQL in 4.334 ms. Removing correctness checks or replacing a full-population statistic with a page calculation would make the result worse.

```evidence
performance
```

These are three samples per journey on a localhost production build, with an India client and isolated Neon US East test database. First-process behavior is separate from warm behavior; Neon cold state was not controlled. Warm initial Dashboard was slower after the final focused pass. No blanket percentage improvement, percentile ranking or SLA is claimed.

### Verification is useful when it names the failure

Unit tests protect precision, bounds, median/rounding rules, filters, update outcomes and cache behavior. PostgreSQL tests exercise exact aggregates, constraints, stable pages, seed preservation and a simultaneous-write race. Browser tests cover a live HR save plus controlled delays, failure, conflict, history, access and responsive interaction.

The baseline record below identifies the functional source it verifies. Case-study-specific verification is recorded separately in its revision field; earlier measurements do not silently become verification of a new layout.

```evidence
current
```

### Be clear about what remains

The public repository, deployed application and hosted baseline CI exist. This review remains local until release is authorized. The final candidate-narrated video and shareable link are still pending; a silent reference recording and a script do not complete that deliverable. The agent does not email or submit the assessment.

Physical devices, non-Chromium browsers, full assistive-technology/forced-colors/zoom review, production load and controlled cold starts remain limited or unverified. External business clarification is also pending. The following selected records make those limits inspectable without exposing credentials, private correspondence or operational logs.

```artifacts
index
```
