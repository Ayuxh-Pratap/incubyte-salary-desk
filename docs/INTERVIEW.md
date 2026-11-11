# Engineering and interview walkthrough

Use this to understand and demonstrate the code, not to memorize unsupported claims. This is an **AI-assisted assessment implementation**. Explain decisions you actually reviewed and the parts you can trace; the collaboration record and Git history show the recorded contributions and sequence.

## A two-minute system explanation

Salary Desk replaces fragile salary spreadsheets for ACME's HR Manager. It helps find an employee, make a checked current annual-base correction, and compare a defined population in one currency. Global headcount is valid across currencies; monetary totals are not. Current annual base, no FX/history/payroll and limited employee operations are candidate-approved working definitions awaiting external clarification.

It is a Next.js TypeScript modular monolith. React handles controls and pending/error states; authenticated HTTP handlers validate requests; independent domain functions handle exact monetary rules; server queries and a salary repository use Drizzle/PostgreSQL. The database enforces relationships, salary constraints and version-checked writes. Presentation reads explicitly selected report files, without employee queries or chart initialization.

Walk Dashboard → Employees → detail/preview/save → Salary Overview → Presentation. Show the currency and population labels, then one test and the source path protecting the behavior. Use [the architecture diagrams](ENGINEERING.md) and [report](PRESENTATION.md) as visual aids.

## Trace one read

1. In Employees, change draft country/currency/search, then Apply. The accepted URL includes filters, sort and page size. Changing a draft select alone does not fetch.
2. `filters-form.tsx` and the screen use shared filter parsing; `use-remote.ts` asks `read-cache.ts` for the canonical key. A fresh same-session entry returns promptly; same-key in-flight work deduplicates.
3. The API checks the evaluator session and validates input. `src/server/employees/queries.ts` builds the shared parameterized predicate and allowlisted stable order.
4. PostgreSQL returns only the requested fields/page (normally 25 rows) and full matching count. A count of 10,000 is not a 10,000-row payload.
5. JSON serializes monetary values as strings. Generation guards prevent an old response replacing a newer filter. Back/Forward restores the query, including cached data where fresh.

Open these actual paths in the repository: `src/domain/filters.ts`, `src/server/employees/queries.ts`, `src/lib/read-cache.ts`, `src/components/use-remote.ts` and the employee API route. Follow the exports rather than assuming every responsibility lives in a React component.

## Trace one salary update

1. `salary-editor.tsx` keeps the loaded version and the user's amount string. Domain rules produce the exact old/new/absolute/percentage preview.
2. PATCH includes the expected version and explicit currency/period. Session, trusted origin, Zod shape and domain validation run server-side even if the UI already checked it.
3. `src/server/employees/salary-repository.ts` performs a conditional update for ID **and expected version**; it increments version and records server metadata atomically.
4. If another editor won, HTTP 409 preserves the draft and asks for review. Invalid input, network errors and unconfirmed outcomes never display a fabricated success.
5. A confirmed save invalidates list/analysis/Dashboard reads and seeds the confirmed detail. Refresh/reload verifies persistence in the database. Integration/browser tests use isolated test data, not the public demo.

## Explain a calculation

INR `1200000.01` parses to `120000001n` minor units. It is serialized as a string; converting it through a JavaScript Number first would weaken the exactness guarantee.

For two USD salaries of 101 and 102 cents, the exact median is **203/2 cents = USD 1.015**, displayed as **USD 1.02** under the documented rounding rule. Integer division to 101 cents would silently lose the half-cent. PostgreSQL aggregate values and the domain formatter retain the rational value until display.

Changing USD 100.00 to 110.00 gives +1,000 minor units, displayed +USD 10.00 and +10.00%. JPY accepts no decimal places; KWD accepts three. Statistics operate over every matched record in the selected currency and annual period, not just visible rows. Read `src/domain/money.ts`, analysis helpers and their tests before explaining the precise rounding implementation.

## The cache, charts and infrastructure

The cache belongs to one authenticated session, has at most 24 entries, and stores no salary payloads in localStorage. List/analysis/Dashboard freshness is 30 seconds, details 15 seconds and lookups five minutes; stale retention is bounded. Focus reuses fresh data, hidden tabs defer expiry reads, and same-key requests deduplicate. Save invalidates dependencies; sign-out/401 clears protected memory; cross-tab messages carry invalidation rather than salary payloads.

Chart instances follow the mounted canvas/type/orientation, not changing array or callback identities. Callbacks remain current through refs; changed values/theme update the existing instance. Unchanged polling does not replay entrance animation. Unmounting and later returning can legitimately create a new chart. Reduced motion remains supported. Read `dashboard-plot.tsx` and the chart lifecycle browser tests.

A paginated query can take longer than its SQL execution because of browser routing, authentication, request round trips, connection setup and the hosted database network. The historical plans and WAN samples separate these factors. The process pool is reused and bounded; a free-plan cold start cannot honestly be promised away. Vercel and Neon retain data across deployment because PostgreSQL storage is independent of the application filesystem.

## Alternatives and tradeoffs worth defending

| Question | Grounded answer |
| --- | --- |
| Why not a separate backend? | The module boundaries are explicit within one deployment. A new service would add networking/operations without a concrete requirement. |
| Why PostgreSQL rather than a local file? | Constraints and aggregate SQL fit the model; hosted persistence survives application restart/redeploy. |
| Why minor units rather than Number? | Money must remain exact above safe-number limits and across different currency precisions. Rational medians defer rounding. |
| Why offset rather than cursor pagination? | The assessed dataset is 10,000 employees and stable tie-breaking is implemented. Add cursor complexity only for a demonstrated need. |
| Why not FX conversion or salary history? | Both require business definitions that were not established. Excluding them avoids misleading comparisons and invented policy. |
| Why no chatbot? | AI development assistance is required; a product LLM is not. These HR operations are deterministic. |
| Why a small custom cache? | It provides bounded per-session reuse/deduplication/invalidation without an extra service or broad client-state framework. Its behavior is directly tested. |

## Likely interview questions

**What prevents a lost update?** The SQL WHERE includes the expected version, and version increments in the same update. A second stale writer affects no row and receives a conflict.

**Can a client bypass salary validation?** UI validation is convenience. The authenticated server boundary validates shape/domain rules and the database enforces constraints.

**Does an HTTP error prove the save failed?** Not always: the database could commit before the connection fails. Keep the draft and reconcile authoritative state; do not blindly claim success or retry an overwrite.

**How do you avoid cross-currency mistakes?** Explicit currency/annual period on records, currency-required salary analysis/sorting, and no FX or mixed monetary total. Shared predicates keep list and analytical populations consistent.

**How is the median different from averaging the current page?** SQL selects the whole filtered population; exact aggregate arithmetic retains an even population's half-unit before deliberate display rounding.

**How do tests avoid changing the demo?** Explicit TEST_DATABASE_URL/PURPOSE, normalized identity separation from other configured databases, purpose markers and live-test headers. CI uses a disposable PostgreSQL service.

**Is repeated seeding safe?** Deterministic identifiers plus conflict-do-nothing inserts prevent duplicates and preserve salary edits. Reset is a separate guarded destructive operator command, never a build/start action.

**What caused the chart replay?** The old effect coupled instance lifetime to unstable data/callback identities and broad DOM mutations. Runtime before/after observations distinguished HTTP revalidation from chart recreation; the new lifecycle updates in place.

**What does passing CI not prove?** It does not establish a load SLA, disaster recovery, comprehensive accessibility, enterprise identity/audit controls, or agreement on outstanding business definitions.

**How did AI help, and what did you review?** Refer to concrete entries in `AI_COLLABORATION.md`: proposed scope/architecture, exact-money cases, connection/TLS/environment checks, stale-cache/chart defects and source/evidence corrections. Do not invent rejected ideas or claim every line was human-written or test-first.

**What would you do next?** Clarify policy, add organization identity/roles and audit/history only when required, then measure real workloads and strengthen operational recovery/accessibility. Those are future work, not hidden completed features.

## Practice before the interview

- Run the app locally using [LOCAL_SETUP.md](LOCAL_SETUP.md), authenticate, and explain one filtered list response in DevTools without showing secrets.
- Read the salary repository and money tests, then explain the update and median examples aloud.
- Inspect `git log --reverse --oneline`: distinguish original build, revisions, verification and final documentation. Preserve the actual sequence.
- Study historical performance sources and sample limits. Say what was measured, not an invented percentile or reliability promise.
- Rehearse the four-minute demonstration in [DELIVERY.md](DELIVERY.md). The final video remains the candidate's recording task.
