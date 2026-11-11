# Salary Desk — Job Desk fidelity and measured navigation

Local review branch only. Reviewed application source: 406b4e2. Published main/production are unchanged. The later compact-layout request is included: equal-height headcount cards, legend beside the doughnut, no disclosure footers, compact theme well, square inner table header and four financial metric cards.

## Evidence-backed causes

- The 10,000 label is a count, not a 10,000-record response. Every timed employee payload contained 25 employees. Decoded response range fell from 8963–9009 bytes to 6713–6759; list projections omit editor-only update/version fields. Detail still has its full context. PostgreSQL legitimately scans/aggregates the complete matching population.
- Before, every route mount refetched catalog and result data; returning and browser history repeated those reads. Same-route filter/page changes also waited for server-route rendering before JSON. Source trace: screens -> useRemote effect, useWorkspaceNavigation router.push -> page searchParams -> JSON.
- Count/page and overall/group reads were separate queries inside transactions, paying repeated WAN round trips. Normal pages, full analyses and Dashboard now use one snapshot statement each, plus the unchanged environment-purpose check per API request.
- Measurement exposed four independent catalog queries competing for pooled connections; one small ordered JSON catalog statement replaces them. A first-failing integration assertion demonstrated the 4 -> 1 change. There was no N+1 employee lookup or client-side hydration of the full dataset.
- Connection/network setup remains material: one fresh pooled connection took **3126.67 ms**. This does not isolate TLS, WAN, provider wake-up or platform scheduling. The existing pooled endpoint/attachDatabasePool/max-three setup is retained; no cache service, new index or backend split was justified.

## Same-environment before/after

Windows, Node 24, Chromium, localhost **production builds**, isolated Neon US East test DB with 10,000 synthetic employees; India client. Three fresh browser contexts per phase, same process/pool within each phase. Nine sequential journeys per context; 27 observations per phase. Click/goto to accepted screen/result readiness, with decoded response-body accounting. First-process arrival is shown separately from later warmed contexts; true Neon autosuspend cold behavior is unverified.

Milliseconds shown as minimum / **median** / maximum, n=3 each:

| Journey             |              Before ms |               After ms | Data API responses before → after |
| ------------------- | ---------------------: | ---------------------: | --------------------------------: |
| first-dashboard     | 2512 / **2517** / 6126 | 1080 / **1159** / 4549 |                           1–2 → 2 |
| dashboard-employees | 1987 / **2434** / 2440 |    918 / **918** / 918 |                             2 → 1 |
| employees-overview  | 1909 / **1911** / 1942 |    885 / **914** / 917 |                             2 → 1 |
| return-employees    | 1886 / **1889** / 1900 |       63 / **65** / 72 |                             2 → 0 |
| browser-back        | 1870 / **1872** / 2375 |       18 / **18** / 21 |                             2 → 0 |
| browser-forward     | 1868 / **1881** / 2386 |       19 / **19** / 20 |                             2 → 0 |
| apply-filter        | 1884 / **1942** / 2384 |    680 / **685** / 688 |                             1 → 1 |
| next-page           | 1860 / **1878** / 1880 |    842 / **867** / 867 |                             1 → 1 |
| employee-detail     |    869 / **871** / 874 |    857 / **874** / 889 |                             1 → 1 |

Raw [before](review/performance-before.json), [after](review/performance-after.json) and [verification summary](review/fidelity-verification.json) retain every sample, payload size, returned row count, resource type and timed SQL category. Diagnostic SQL logging includes no arguments or credentials. SQL counts in journey windows include transaction control/background work and are not falsely presented as precise per-handler attribution. The initial before sample's catalog completion straddled the next journey; its one-response count is recorded as observed, not called an optimization.

First Dashboard: before 6126 ms then 2517/2512 ms; after 4549 / 1159 / 1080 ms. Cached return and Back/Forward perform zero data API requests in these samples. First detail fetch remains about 0.9 seconds; a fresh detail reopen reuses its cache (browser-verified). No percentage improvement or universal latency guarantee is inferred.

Same-route filter/page updates no longer block on their own RSC navigation. The remaining one RSC in those after windows is the **other route's /overview link prefetch**, confirmed by its URL; it does not initiate the employee JSON. Primary navigation uses Next Link prefetch and immediate LinkPending feedback; other visible drill-down links can issue bounded route prefetches. No employee pages/JSON are eagerly prefetched in bulk. Shared layouts perform access checks, not salary queries.

Initial decoded non-API document/assets/prefetch bodies grew from 1024208/1024208/1024208 to 1491327/1491327/1484961 bytes per fresh context. Chart.js and the animated custom controls have a real initial bundle cost. Chart registration is limited and dynamically scoped to Dashboard; cache reuse improves subsequent navigation but does not erase this first-load tradeoff. These are decoded response bytes, **not compressed network transfer**.

## Query and edit evidence

[Reproducible query observations/plans](review/read-query-plans.json): five sequential direct reads per scenario, then one EXPLAIN ANALYZE. Direct times include WAN; server execution does not.

| Read             | Statements | Server execution ms | Five direct WAN samples ms             |
| ---------------- | ---------: | ------------------: | -------------------------------------- |
| employee_page    |          1 |               4.296 | 316.69, 318.47, 307.86, 312.91, 309.3  |
| full_analysis    |          1 |               6.936 | 311.42, 309.94, 307.2, 311.85, 311.15  |
| dashboard_series |          1 |              30.873 | 333.16, 327.95, 325.02, 325.28, 327.02 |
| lookup_catalog   |          1 |               0.152 | 304.19, 303.6, 302.71, 302.8, 308.34   |

Normal pages use a window count over joined display fields with stable order and LIMIT/OFFSET. An offset past the end deliberately has an extra count/clamped-page fallback; tests cover it. Analysis preserves the complete filtered dataset. Dashboard's bounded headcounts/financial summaries/eight-bin histogram share one statement snapshot. New SQL does more in-database aggregate work than the old indexed row-only plan, but avoids the repeated WAN round trips. No mathematical calculation is moved to the visible page.

One additional **after-only** [save/cache measurement](review/edit-cache-measurement.json): confirmation 1401 ms; return to previously cached exact-employee analysis 912 ms. The updated amount was observed through a new analysis request, not an old cached result. Save triggered PATCH + current-list GET; returning triggered analysis GET. Original synthetic amount restored in finally. This is n=1 verification, not a before/after speed comparison.

## Cache policy and refresh

Memory owned by the authenticated workspace provider, keyed by session scope + canonical API URL. No salary data in localStorage, IndexedDB, public CDN caches or cross-user server caches. HTTP remains private,no-store, with access checks on every fetch. Session reads may deduplicate with React cache during a render/request.

| Data                                                | Fresh TTL | Additional reuse                                                    |
| --------------------------------------------------- | --------- | ------------------------------------------------------------------- |
| Filtered/sorted/paginated page, analysis, Dashboard | 30s       | Same-key stale revalidation up to 120s more                         |
| Employee detail                                     | 15s       | Same-key bounded stale revalidation; CAS still rejects old versions |
| Lookup catalog                                      | 5 min     | Same-key bounded stale revalidation                                 |

At most 24 insertion-ordered keys; in-flight requests deduplicate. Active reads revalidate at expiry and on focus/visibility. Fresh return renders without a forced skeleton. New uncached keys show matching skeletons and never paint old rows under new filters. Explicit refresh forces a read; same-key data remains with busy feedback, errors expose Retry. Failed/out-of-order/invalidated responses cannot overwrite the accepted key.

A confirmed salary save invalidates all salary-bearing keys, atomically retains the confirmed detail, refreshes the visible list and notifies other tabs in the same session scope. Revisited analyses/Dashboard read again. Sign-out clears/denies memory and notifies other tabs; 401 erases cached data. New login gets a new random scope. External API editors are observed on revalidation, not through a real-time subscription. Browser Back/Forward restores URL state and may reuse a fresh entry.

## Visual foundation and final composition

[216-value vendored manifest](design-foundation.json), [16 contrast checks](review/contrast-fidelity.json), DESIGN.md and runtime CSS agree. Actual source canvas/field/panel/inset roles, alpha hairlines (8% ink / 10% white), input borders, typography/spacing/radii, button/well/popover shadows, icon stroke and motion timings are retained. No lime/green brand overrides or runtime sibling dependency remain. Buttons/input wrappers and Motion/Animate UI/Base UI patterns are adapted, not claimed to be unmodified copies. Accessibility exceptions are explicit: deep existing orange for white action labels, visible adjacent focus and appropriate data-control touch targets.

Custom Select supplies labels, keyboard/typeahead, selected/disabled state, focus return, viewport anchoring and long-list scrolling. The largest lookup has 14 items; a searchable combobox would add complexity without need. Theme segments are compact 28px; sidebar width and active/segment movement use existing Motion. Table header/row hover/selection remain distinct, with square inner table-header edges.

Country composition uses a doughnut with right-side count/link legend; department comparison uses horizontal bars. Equal 256px plot areas and grid stretching match card heights; both disclosure footers are removed. Department exact counts remain accessible text; Employees provides the equivalent keyboard filter workflow. Histogram uses server-derived exact inclusive salary bands within one currency, with count axis, tooltips, selection and exact data table. Only counts become chart numbers; monetary labels remain exact strings. Canvas theme changes now observe the applied DOM theme and actual font stack. [Chart.js integration guidance](https://www.chartjs.org/docs/latest/getting-started/integration.html) informed selective registration.

Four Salary Overview cards show total, median, minimum, maximum. Count remains in the population line and grouped analysis. No backend metric was removed.

[Before/after visual board](review/fidelity-comparison.html) includes the P1 baseline versus current source, phone/tablet/desktop, distribution, editor and custom dropdowns. Full ignored artifacts/review contains the 30-case sweep.

## Verification and limitations

Passed: lint, types, production build without runtime secrets, 216 token/mapping checks and 16 text/action/focus contrast pairs, 35 deterministic unit cases, 12 isolated PostgreSQL cases, **21 production-browser workflows**, and 30 route/theme/viewport captures. No document/main/header horizontal overflow or page errors in the sweep. Representative screenshots were manually inspected in both themes, including the corrected canvas colors/fonts.

Workflow coverage includes exact money/precision/medians, stable bounded pages, literal filters, full-population analysis, invalid input, persistent salary updates, stale conflicts, retained failures, access/origin protection, cached return/history/detail reuse, explicit refresh, same-session post-edit invalidation, cross-tab sign-out, dropdown keyboard/typeahead, reduced-motion/focus/sheet behavior and final compact geometry. Live writes are purpose-guarded isolated test data and restored; demo data was neither reset nor used for UI testing. Production dependency audit reported zero advisories; no forced tooling downgrade.

Limits: Chromium and representative latency schedules, not every possible race or device; physical touch, Safari/Firefox, full screen-reader/forced-colors/zoom audit and production cold-start/load/recovery are unverified. Before and after are local production-build measurements; the deployed Vercel latency is not claimed. The final narrated candidate video remains pending; the old silent recording is a baseline reference. Business definitions remain candidate-approved pending external clarification.

## Reproduce, review and release

Configure ignored .env.local with distinct TEST_DATABASE_URL and TEST_DATABASE_PURPOSE=test; never paste credentials into chat. Normal checks:

```powershell
npm run lint
npm run typecheck
npm run design:check
npm test
npm run test:prepare
npm run test:integration
$env:E2E_LIVE_DATABASE='true'
try { npm run test:e2e } finally { Remove-Item Env:E2E_LIVE_DATABASE }
npm run ui:capture
```

After build:verify, run npx tsx scripts/perf-server.ts in one terminal (isolated production server, port 3300, parameter-free probe logs in ignored .vercel). In another: node scripts/measure-journeys.mjs after; node scripts/measure-edit-journey.mjs; npx tsx scripts/measure-read-plans.ts. Run sequentially without the visual sweep. The edit measurement verifies the test-purpose header and restores its amount. Before artifact came from source 726380a; reproduce that source in an isolated review checkout rather than rewriting this branch.

Review local app and diff against main, screenshots and raw evidence. Release remains gated: candidate review -> authorized review-branch PR/hosted CI -> isolated preview -> approved merge/promotion preserving commits -> final narrated video and candidate-sent submission. No push, production change, history rewrite, email or submission occurred. No migration/reset is needed for this pass.
