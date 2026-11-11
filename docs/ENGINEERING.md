# Engineering decisions and walkthroughs

## Product boundary and change handling

Current annual base salary, positive values, explicit currency and annual period, single-currency analysis, current-value edits only. These are candidate-approved working definitions pending Incubyte clarification. No FX, payroll, creation/deletion, history, scheduled changes or product LLM.

When clarification arrives, trace its impact before changing code:

| Clarification                  | Affected implementation                                                                       |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| Base versus total compensation | REQUIREMENTS, schema/components, validation, seed, aggregation and tests                      |
| Monthly or mixed pay periods   | Period constraints, normalization policy, calculation/display rules and fixtures              |
| FX comparison                  | Approved rates/as-of policy, normalization model, aggregates and labels; currently prohibited |
| History/effective dates        | Data model/migrations, update use case, UI and concurrency/integration tests                  |
| Employee operations/access     | API authorization, schema rules, interaction and acceptance checks                            |

## Modular monolith

```mermaid
flowchart LR
 HR[HR browser] --> UI[React workspace]
 UI --> API[Next routes: session + origin + validation]
 API --> Domain[Pure money and salary use case]
 API --> Queries[Drizzle parameterized queries]
 Domain --> Adapter[Versioned salary repository]
 Adapter --> DB[(PostgreSQL on Neon)]
 Queries --> DB
 API --> Dashboard[Dashboard bounded headcounts + financial aggregates + histogram]
 Dashboard --> DB
 Seed[Explicit synthetic seed command] --> DB
```

src/domain contains money, filters, analysis definitions and the salary-update use case. src/server/db owns schema/connection; employees and analysis modules own SQL; HTTP routes adapt transport and enforce access. Components own drafts and interaction, never direct DB access. The salary use case depends on two small repository operations; no generic service/repository framework or separate backend.

## Exact money and schema

Six tables: employees, countries, currencies, departments, roles, and a singleton environment marker. Foreign keys, unique employee numbers, positive salary/version checks and an annual-period constraint protect persisted data. An unused role/department mapping was removed with a real migration because metadata editing is excluded.

Salary is BIGINT minor units, capped at 9,000,000,000,000,000,000 (below PostgreSQL's signed ceiling). USD/EUR/GBP/INR use two decimals, JPY zero, KWD three. Country and pay currency are independent. Decimal strings are parsed directly into BigInt; excess precision, ambiguous notation, non-positive and out-of-range amounts are rejected. Money crosses JSON boundaries as strings. No unsafe Number conversion.

SQL totals use numeric arithmetic and text serialization. Median ranks the entire population and sums its one or two middle values, retaining denominator one or two. An even median can include half a minor unit; the explanation shows it exactly. Display rounding is half up; signed changes round half away from zero, and percentages have two decimals. There is no floating-point percentile calculation or cross-currency monetary total.

## Lists, populations and safe writes

One employeeWhere predicate applies literal wildcard escaping and parameterized country/department/role/currency filters to lists, counts and analysis. Sorting is allowlisted with an id tie-breaker; salary sorting requires a currency. Pages are 25/50/100 records. Normal count/list and full analysis branches share single-statement snapshots; out-of-range pagination has a deliberate count/clamped-page fallback. Drill-down retains the same filters. Unknown or unavailable lookup labels retain active codes rather than claiming All.

Salary edits validate immutable currency/period and parse the amount on the server. UPDATE checks both id and expected version, increments the version and writes server metadata atomically. No returned row means conflict. The UI retains the proposal after validation, network or persistence failure; conflict review rebases it explicitly against the latest snapshot. Success is shown only after a confirmed response. A network failure after commit is treated as uncertain and resolved by rereading/version checks.

## Access and environments

A shared evaluator identity uses an eight-hour encrypted iron-session cookie: HttpOnly, Secure in production, SameSite Strict. Server layout and every data API check the session; mutations also validate origins. Trust comes from explicit APP_ORIGIN and Vercel-issued deployment variables, never request Host or forwarded headers. Health exposes no employee data. Unexpected API failures return a reference and log only method/path, error kind and a sanitized database code.

Development, test, demo and preview use separate PostgreSQL databases with purpose markers. Runtime/migration checks reject mismatches; Vercel preview requires purpose preview and production requires demo. Tests reject development/demo/preview connection identities, including pooled/direct aliases, and browser writes first assert the server's test-purpose header. CI uses disposable PostgreSQL 17; local development needs no Docker.

Neon's account-free project was used initially. The candidate has claimed it into a Free account; account access and all four 10,000-row databases were verified. Claiming rotated the database password, so only connection URLs were refreshed and deployment credentials updated. Data, evaluator secrets and business scope were preserved. No paid resources.

Vercel Hobby, Node 24 and region iad1; Neon aws-us-east-2. Runtime uses pooled node-postgres with attachDatabasePool, max three connections; migrations use direct URLs. Connection/query waits are bounded; statement timeout is eight seconds. Seed/reset are explicit operator commands, never build/request hooks. Production builds are verified with runtime credentials absent. The reviewed Windows/Turbopack development reload loop is avoided using supported Webpack development; default production builds pass independently.

## UI foundation and brand

| Job Desk reference      | Selective adaptation                                                                         |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| DESIGN / globals.css    | Neutral surfaces, compact type, semantic roles, hairlines and tactile controls               |
| Base UI/shadcn wrappers | Small button/input/sheet patterns; corrected focus contrast, touch size and overlay behavior |
| Providers/fonts         | next-themes, packaged Geist and Animate UI reduced-motion preference                         |
| Shell/sidebar           | Recombined Employees/Salary overview navigation; responsive cards/table                      |
| Design checker          | Document-to-CSS palette checks, resolved theme contrast and semantic color checks            |

No job domain, personal data, integrations, Blob sync, PWA/service worker, all-record client index, dev instrumentation or Git history was copied. Applicable notices are retained. Sheet review caught generic-dialog motion and missing close-event cancellation; both were corrected and browser tested.

The locked visual source is now Job Desk DESIGN.md plus its actual runtime implementation. docs/design-foundation.json vendors 216 palette/semantic/type/radius/elevation/motion values with the inspected source commit. No lime/green brand overrides remain. Source documentation/runtime discrepancies and accessibility adaptations are explicit in DESIGN.md. No sibling folder dependency or private Job Desk domain data was introduced.

## Evidence and practical performance

27 deterministic unit cases, eight hosted PostgreSQL integration cases, and six production browser checks passed. Coverage includes precision/bounds, exact large aggregates, odd/even/empty medians, literal search, shared intersections, constraints, seed preservation and a simultaneous-write race with one winner. Controlled UI failures are distinguished from live persistence evidence. Deployed checks confirm authentication, bounded 10,000-record browsing, invalid/stale rejection, save/reload, analysis and persistence across redeployment; original synthetic amounts were restored. Production is published at https://incubyte-salary-desk.vercel.app and source at https://github.com/Ayuxh-Pratap/incubyte-salary-desk, with candidate approval. Hosted CI independently passed all 27/8/6 checks on disposable PostgreSQL. See deployment-checks.json.

Measured 2026-11-11: 10,000 employees; Node 24.19/Windows; client in India; Neon US East; TLS verified, pooled max 3; five sequential samples after ANALYZE. Median transactions: name page 1,330.55 ms; USD salary page 1,204.66 ms; country/department page 1,202.63 ms; Unicode search 1,317.06 ms; full USD analysis 1,529.07 ms. These include WAN and transaction round trips, not deployment latency or cold starts. EXPLAIN execution: indexed currency/salary page 0.034 ms, name search 0.513 ms, overall analysis 2.086 ms. Raw observations/plans are in performance.json. Five samples do not establish an SLA.

Indexes cover name/id, currency/salary/id, country/department and department/role. Retain this small set based on the measured workload; no external search service, replicas or speculative infrastructure.

## Protected read flow and bounded session caching

Every data API still authenticates and returns private, no-store. The server layout verifies the session before mounting RemoteProvider. A new random scope is stored in the encrypted session at login; the provider owns its own memory map. React cache memoizes session reads during a render/request where applicable, without a cross-request protected data cache. No public CDN/full-route salary cache or shared ORM result cache is enabled.

| Read                                  | Fresh TTL  | Policy                                                                                                |
| ------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------- |
| Directory page / analysis / Dashboard | 30 seconds | Canonical URL including all filters, sort, page, page size, grouping and currency, under access scope |
| Employee detail                       | 15 seconds | Employee id under the same scope                                                                      |
| Lookup catalog                        | 5 minutes  | Small ordered lookup arrays, same authenticated scope                                                 |

In-flight reads deduplicate. Capacity is 24 insertion-ordered query keys, not every possible employee page. Fresh returns render immediately; stale same-key values may remain visible during revalidation for at most 120 additional seconds. Beyond that they are discarded. Active views revalidate at expiry and on window focus/visibility. Errors expose Retry; explicit refresh forces a read and shows pending feedback while retaining same-key values. No data is stored in localStorage/sessionStorage/IndexedDB. A failed validation response never populates the cache.

Successful salary saves atomically retain the confirmed detail and invalidate every other salary-bearing result, including pages, analyses and Dashboard. The current list refreshes, a revisited analysis reads again, and scoped BroadcastChannel events invalidate other tabs. Events include document identity to prevent self-delivery. Sign-out clears/denies memory and notifies other tabs; 401 responses fail closed and erase cached data. A new login gets a fresh scope. This remains a short browser snapshot: external editors can be seen at revalidation, and an ambiguous network failure is handled through reread/version conflict rules.

Within a workspace route, installed Next.js history integration updates useSearchParams immediately for filters/pagination/currency, eliminating the RSC-then-JSON waterfall. Different route navigation retains authenticated server layout checks and bounded prefetch of the three workspace destinations. LinkPending acknowledges clicks independently of data completion. Draft controls apply together; exact-key loading skeletons never show rows under another population's labels. Abort/generation guards prevent invalidated or obsolete responses from winning. Router Back/Forward restores the URL and reuses a matching fresh entry.

## Query and Dashboard decisions

Normal employee pages use COUNT OVER with stable allowlisted order and LIMIT/OFFSET, selecting only visible directory fields. Full detail/update metadata is fetched for the editor. Normal directory, analysis and Dashboard requests each make one environment-marker check plus one read statement. Lookup catalog now uses a single small ordered JSON aggregate statement rather than four pooled queries. The original measured fan-out caused late lookup responses on first arrival. No N+1 or 10000-record browser materialization was found. The narrow fallback for an offset past the population can use an additional count/read; tests preserve clamping and empty results.

Analysis reuses the same employee predicate and exact summary SQL for the overall and grouped populations in one UNION statement. Dashboard combines headcount partitions, those financial summaries, and a bounded histogram in one statement snapshot. Histogram bins cover observed min..max in exact integer minor units with at most eight inclusive, disjoint ranges; tied/small ranges use fewer bins; empty currencies return no bins. PostgreSQL NUMERIC avoids BIGINT overflow in calculations. No schema/index change was justified by the measured 10000-row workload.

Only counts become JavaScript chart numbers. Salary boundaries remain exact strings in labels/tooltips/tables. Chart.js 4.6.1 is dynamically imported solely by the Dashboard, registering bar/doughnut controllers, elements, category/linear scales and tooltips. Country doughnut answers composition; horizontal department bars compare headcount with readable labels; the annual-base histogram answers distribution for one selected currency. Global charts explicitly cover all currencies; money never crosses currencies. The country legend sits beside its doughnut and supplies keyboard-accessible population links; screen-reader headcount text accompanies the department chart, with equivalent keyboard filtering in Employees. The histogram retains its exact-band table. Country/department/currency drill-downs accompany the canvas. No historical trends or fairness conclusions are invented.

Current measurement evidence, reproduction commands and limitations are in [fidelity/performance review](FIDELITY_PERFORMANCE.md). Prior P1 review is historical and superseded visually. Published main/production remain the earlier baseline until release approval.

## Four interview walkthroughs

1. **An amount:** domain/money.ts turns INR 1200000.01 into 120000001n. Input is never rounded. JSON carries a string. Middle values 101/102 USD minor units yield 203/2; display USD 1.02, explanation USD 1.015.
2. **A query:** domain/filters.ts validates URL input; server/employees/queries.ts creates the shared predicate, stable order and bounded page. server/analysis/queries.ts applies that predicate to the full population and ranked middle rows, independent of the current page.
3. **An API request:** PATCH app/api/employees/[id]/route.ts passes through server/http.ts for session/origin checks, validates id/JSON, then calls domain/salary-update.ts. server/employees/salary-repository.ts performs the version-conditional update. A race yields HTTP 409.
4. **A save:** components/salary-editor.tsx keeps a separate draft and snapshot, computes the preview, submits its version and handles confirmed success, retained failure and explicit conflict review. Employee detail is an accessible controlled sheet; dirty closure requires a discard decision.

The defensible tradeoff is a small complete current-salary tool with exact arithmetic and transparent populations. History, FX and full IAM require additional business decisions and are deliberately excluded.

Sources: [Incubyte website](https://incubyte.co/), [Neon plans](https://neon.com/docs/introduction/plans), [Vercel Hobby](https://vercel.com/docs/plans/hobby), [Vercel Node runtime](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions). Provider/account observations were checked during setup; current account is Free/Hobby.

## Final compact composition

The two headcount cards share a 256px plot area and stretch equally in the desktop grid. Country legend/count links sit to the right of the doughnut; the former disclosure footers are removed. Theme segments use compact 28px controls within a 32px well; the remaining controls preserve their existing targets. Directory table headers have square inner edges beneath the result header. Salary Overview shows four financial cards: total, median, minimum and maximum. Population count remains visible above them and in the grouped analysis; no aggregate rule or API field was removed.
