# Final focused review — Salary Desk

Subsequent Presentation revision: the case study is now one continuous full-width story with connected SVG flows (source `39f40eb`). This report retains its earlier functional measurements and original UI descriptions; current case-study verification is a separate field in `verification.json`, with screenshots in `docs/review/case-study`.

This report concerns the unpublished `codex/visual-quality` branch. The public baseline remains `3c6ff79`; production has not changed. Navigation/SQL/edit evidence was collected against application source `730076b` on a localhost production build, Windows/Node 24/Chromium, an India client and a purpose-marked isolated Neon US East test database. The corrected idle probe uses `79f3c64`; final UI/assets and production-browser verification use `b3e2106`. Later changes refine Presentation content/semantics/navigation and a clipped label, plus measurement capture timing; no salary-query/domain code changed. Historical reports remain historical.

## Dashboard correction and demonstrated cause

The currency label/control now form a grid within a bottom-aligned wrapping form. At 390, 768 and 1366px the selector and button share 44px height and the same top edge; previously their top edges differed by 4px. At 200% root text on a 390px viewport, both are 88px high and wrap without horizontal overflow. This is an enlarged-text probe, not a complete browser-zoom/assistive-technology audit.

The doughnut canvas is 208px high, centered inside the retained 256px plot region. The adjacent legend, exact counts, drill-downs and department plot remain intact. Both cards retain their existing composition. The Job Desk foundation still matches all 216 checked token/mapping values.

Production reproduction distinguished connected canvases from Chart.js instances and HTTP requests. Before correction, each canvas acquired its context once initially, twice after an unrelated root-style mutation, three times after theme change and seven times after two actual expiry intervals. Only two additional Dashboard HTTP requests occurred during those two intervals. Source inspection confirmed `destroy/new` on array/callback identity changes and a root class/style observer. These were chart lifecycle defects, not evidence of seven database recalculations.

The correction creates an instance for its canvas/type/orientation, keeps event callbacks current through refs, compares bounded series values, updates changed data in place and applies theme options without recreation. Theme comes from next-themes; the broad root observer is gone. Reduced motion remains supported. Unchanged revalidation does not run a data update merely because new arrays were allocated. Navigation away legitimately destroys a canvas; returning creates a new instance and cleans up the old one.

The after idle artifact records three real active refresh intervals, a real hidden expiry and visible/focus resume, currency draft/application and navigation return. Native canvas counters are runtime proxies interpreted with source; they are not React render counters or a general-purpose profiling system.

## Focused performance comparison

Same script and environment; three fresh browser contexts in one process per run. Values below are all samples in milliseconds, including Playwright action/route/data readiness and response-body collection. They are not click-to-first-feedback times or an SLA. Before source `ebcbd91`; after functional source `730076b`. Sequential tests/benchmarks avoided simultaneous verification traffic.

| Journey                   | Before, n=3      | After, n=3         | After API / SQL |
| ------------------------- | ---------------- | ------------------ | --------------- |
| Initial Dashboard         | 4363 / 980 / 979 | 4258 / 1175 / 1174 | 2 / 4           |
| Dashboard → Employees     | 952 / 923 / 929  | 939 / 908 / 921    | 1 / 2           |
| Employees → Overview      | 877 / 913 / 899  | 890 / 893 / 888    | 1 / 2           |
| Return to fresh Employees | 62 / 59 / 60     | 56 / 60 / 56       | 0 / 0           |
| Back                      | 49 / 19 / 19     | 18 / 19 / 18       | 0 / 0           |
| Forward                   | 54 / 20 / 24     | 21 / 26 / 26       | 0 / 0           |
| Apply filter              | 861 / 719 / 723  | 686 / 694 / 694    | 1 / 2           |
| Next page                 | 867 / 857 / 847  | 844 / 834 / 847    | 1 / 2           |
| Open detail               | 916 / 890 / 887  | 900 / 867 / 894    | 1 / 2           |

The first Dashboard sample uses a new app process/pool; true Neon cold state was not controlled. Warm initial Dashboard samples were slower after this pass. Most uncached journey differences are small and cannot establish a causal speed improvement. The substantial verified improvement is removing repeated chart recreation and making background freshness quiet, while retaining fast fresh-cache returns. No percentile or percentage-speedup claim is warranted.

Employee JSON remained **25 rows**, 6716 decoded bytes unfiltered, 6713 filtered and 6759 on the measured next page. Detail was 365 bytes; analysis 1341; Dashboard aggregate series 2353 plus 1280 catalog bytes. Counts and full-population statistics do not imply bulk browser hydration. Different-route RSC requests carry the route shell; same-route filter/page changes use the URL and one JSON read, without an RSC-then-JSON waterfall. Exact per-request RSC/asset bytes and SQL timings are retained in the before/after artifacts.

A separate single warm navigation probe records immediate link feedback, route/pending-region readiness and final data readiness independently in `ui-runtime.json`. These DOM/click observations complement controlled-latency browser regressions; they are not a distribution of interaction latency.

Direct reads used one statement each. Five sequential WAN-inclusive samples and one EXPLAIN ANALYZE per scenario recorded:

| Query             | PostgreSQL execution, n=1 | Direct pooled read including WAN, n=5 |
| ----------------- | ------------------------- | ------------------------------------- |
| Employee page     | 4.334ms                   | 295.55–307.19ms                       |
| Full USD analysis | 6.716ms                   | 295.23–306.44ms                       |
| Dashboard series  | 26.164ms                  | 313.35–327.03ms                       |
| Lookup catalog    | 0.142ms                   | 290.13–298.04ms                       |

One new-pool connection took 3072.13ms; this is not a proven database cold-start measurement. Normal authenticated API reads deliberately add a separate purpose-marker check. Two WAN round trips, route/client work and occasional connection setup dominate the observed uncached wait; the list computation itself does not. The existing pooled maximum of three, 10-second idle timeout, statement/query timeouts and Vercel pool attachment remain unchanged. No speculative indexes, cache service, purpose-check bypass or database migration was introduced.

One isolated +1-minor-unit salary save confirmed in 1418ms. Returning to an already visited analysis took 897ms and displayed the updated amount. The original amount was restored in `finally`. This is an after-only correctness/freshness observation, not a save-speed comparison. The recorded requests were one PATCH, one active list refresh and one analysis refresh. Exact money, immutable currency/period and compare-and-swap behavior remain unchanged.

Source inspection found four application fetch call sites: the protected read provider, login, salary mutation and sign-out. No LLM SDK or call site exists. Observed final UI/idle sessions recorded no external request origins. This does not establish behavior for every future dependency or environment.

## Cache policy after the pass

- One in-memory provider per evaluator session scope; exact URL keys include population, sort/page/page size/currency. Capacity remains 24 entries. No local/session storage or shared public salary cache.
- Fresh lifetimes remain 30 seconds for list/analysis/Dashboard, 15 seconds for detail and five minutes for lookups. Stale memory is retained for at most an additional 120 seconds; expired active reads use quiet revalidation.
- Subscriptions now notify only the changed query on ordinary reads. A hidden tab does not start an expiry request; visibility/focus performs a deduplicated freshness check. Fresh focus does not fetch. Explicit refresh remains available.
- Generations and aborts prevent older results from winning newer work. Draft filters apply together; unaccepted edits do not fetch. Fresh cached returns avoid forced skeletons; uncached states retain the shell/controls and acknowledge work immediately.
- Successful salary saves retain confirmed detail and invalidate salary lists, analyses and Dashboard. Same-session other tabs receive invalidation. Sign-out/401 clears protected memory. Server authentication, origin checks and `private, no-store` headers remain authoritative.

## Presentation and reviewer path

Five protected sections share the workspace shell: Start here, Product and scope, Architecture and flows, Decisions and AI collaboration, Quality and evidence. Workspace contains Dashboard, Employees and Salary Overview. On phones, the book button opens the Presentation and its section navigation wraps naturally.

The canonical narrative is `docs/PRESENTATION.md`; diagram data is selected separately. Readable HTML diagrams cover architecture, relational relationships, salary update, cache invalidation and verified commit milestones. Actual short code excerpts link to protected source viewers. Explicit artifact/source catalogs reject unknown keys; no directory enumeration or raw HTML/MDX evaluation is used. Literal loaders and exact Next tracing entries avoid bundling private inputs. Streamed Next not-found responses may have status 200 after headers; they show no source/artifact content and remain protected.

Presentation pages are server-rendered. A fresh authenticated Presentation-only context loaded zero chart chunks, created zero canvases and issued zero salary API reads. Shared shell/theme/navigation JavaScript and fonts remain necessary. The recorded fresh resource set was about 0.99MB decoded (including fonts/CSS), so no minimal-bundle claim is made; this is not compressed transfer size. React Markdown and Plot are absent from the Presentation client-reference manifest. Presentation links are not all prefetched from Workspace, and workspace prefetch is disabled while reading the Presentation.

Suggested walkthrough: Start here → Dashboard USD → filtered Employees → USD Overview → Architecture salary sequence/source → Decisions timeline/AI record → Quality current evidence. Public baseline links are pinned or labeled; unpublished review code is not represented as a working GitHub commit URL.

## Verification and release gates

Current completed checks: 39 deterministic unit cases; 12 isolated PostgreSQL integration cases; 30 production-browser checks, with the optional matrix capture skipped in that suite. The focused pass additionally captured Dashboard and Presentation at 390/768/1366px in both themes, plus enlarged text. Lint, types, design consistency and a credential-free production build passed. The final complete source/artifact-link regression also passed after correcting duplicate Markdown headings. Exact source/status is recorded in `verification.json` rather than borrowed from historical CI.

Existing regressions cover access, keyboard/typeahead dropdowns, filters, sorting/page sizes, history, delayed/error/out-of-order responses, input preservation, concurrency, salary persistence, complete-population statistics, currency separation, cache invalidation and reduced motion. New tests protect the chart lifecycle, changed data/theme behavior, hidden freshness, control geometry, source allowlisting and Presentation access/navigation.

Submission gates remain: candidate review of this local branch; approved source publication and deployment; hosted CI for this revision; deployed smoke/persistence checks; candidate-narrated video and its verified share link; candidate-sent submission. Historical public source, deployment and baseline CI already exist. No source publication, production replacement, history rewrite, email or assessment submission occurred in this pass.

Unverified/limited: physical devices, non-Chromium browsers, complete assistive-technology/forced-colors/browser-zoom coverage, production load/failure recovery and controlled infrastructure cold starts. Business definitions remain candidate-approved working choices pending external clarification. These limitations do not get hidden behind an average score.
