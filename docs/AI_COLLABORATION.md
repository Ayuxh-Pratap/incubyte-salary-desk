# AI collaboration record

## 2026-11-11 scope and foundation

Human instruction: build Salary Desk as an independent Next.js/TypeScript/PostgreSQL assessment; use a documentation-first commit, selective Job Desk UI reuse, genuine tests/commits, hosted development database, exact currency-aware calculations, no product LLM, no private inputs in the repository.

Human decisions: current annual base pay; single-currency analysis; salary edits only; no history/FX/employee creation/deletion; evaluator-protected synthetic demo. These remain provisional pending an employer clarification already sent by the candidate.

AI contribution: read the assessment and supporting files, inspected Job Desk source, checked target Git boundaries, researched official styling and package/hosting constraints, and proposed this module/data/verification structure.

Accepted: modular monolith, database paging, pure financial rules, separate environments, documentation of observed brand values. Rejected: copying the full Job Desk shell/search index or treating a prior evaluation score as product evidence. No private email, resume, contacts, credentials, screenshots or source correspondence are included.

Review findings: inherited primary-button contrast and short controls require correction; focus should not depend on a faint ring. Found official green/lime colors through public inline styling rather than an invented brand guide.

Verification so far: destination absent; parent is outside a Git repository; Node 24.19.0 available; registry metadata checked for Next, Drizzle, Vitest, Base UI and Animate UI. No application tests exist yet; no test-first cycle is claimed.

Record subsequent meaningful prompts, accepted/changed/rejected suggestions, bugs caught, tests actually run and code paths to understand. Do not store private chain-of-thought or fabricate decisions.

## Foundation slice — actual verification

Money tests were run before the module existed and failed on its missing import; after implementation all 10 money cases passed. Filter and security tests were then run before their modules, failed, and passed after implementation (15 total). No test-first claim is made for presentation wrappers. Production build and type/lint checks passed. The design checker caught a whitespace-sensitive comparison after formatting; it now tolerates formatting while enforcing values. Browser testing exposed a real theme hydration mismatch; mounting-sensitive pressed states were corrected. The initial browser assertion also matched Next's route announcer and was narrowed to the actual error field. Browser rerun status is recorded after completion.

Compatibility: Node 24.19, Next 16.4.6, React 19.3.1, Drizzle 0.45.4/kit 0.31.11, Vitest 5.1, Playwright 1.65. ESLint 10 ran but conflicts with Next's official plugin peer ranges; reverted to compatible 9.39.5 pending upstream support. Production npm audit reports zero advisories; development-tool advisories remain under review. Packaged Geist avoids a Google Fonts download during builds.

Foundation browser rerun passed: login/logout, hostile-origin rejection, light/dark theme and 320 px overflow check. Screenshots were inspected locally and remain ignored. No hosted database verification or deployment is claimed yet.

## Seed and browsing slice

Ran the seed test before its module existed, then implemented deterministic generation: 10,000 unique IDs and employee numbers, six currencies, a three-person leadership group, varied names, fractional precision and tied values. A new regression test failed because salary ordering accepted multiple currencies; the parser now requires a currency for monetary sorting. All 17 unit tests pass. Seed SQL preserves existing rows with conflict-do-nothing inside a transaction and verifies the final count; hosted execution remains pending Neon authentication. No database-backed behavior is claimed verified yet.

Browsing verification caught two issues before commit: response state now carries its request key, including failures, to prevent stale or indefinitely loading populations; a mobile theme click was intercepted by Next’s development indicator, confirmed from the trace actionability log. Disabled that development-only indicator rather than forcing the click or inflating timeouts.

## Salary-edit slice

Ran salary use-case tests before the module existed, then implemented strict validation, exact parsing, immutable currency/period checks and version-conditional persistence. All 21 unit cases pass, including failed persistence and an update race returning no row. Browser tests with explicit transport fixtures verify invalid input, retained input after 503, 409 review, correct version progression, save confirmation and unsaved-close cancellation. These fixtures are UI evidence, not PostgreSQL persistence evidence. Visual inspection caught a generic dialog animation on a side sheet; explicit right-side motion and Base UI event cancellation now keep the panel stable. Four browser checks pass. The proposed amount remains intact during conflict review; only a confirmed write uses the saved-success state.

## Filtered analysis and hosted verification

Ran analysis/drill-down tests before implementation; all 24 domain/security unit cases now pass. PostgreSQL numeric sums and ranked middle rows preserve exact overall/group medians; five real integration tests passed against a separate hosted test database (40.29 seconds including seeding and WAN queries). They cover 10,000 rows, repeat-seed preservation, stable bounded pages, literal wildcard search, USD/JPY/KWD aggregates against a pure reference, empty populations, SQL constraints and version conflicts.

Neon’s temporary account-free project was provisioned at no cost; branch management was refused before ownership claim. Instead, separate PostgreSQL databases isolate development, test, demo and preview. The project expires 2026-11-14 08:00 UTC unless claimed. Development migration and 10,000-row seed succeeded. A review caught that the first live browser harness had not applied its test URL to the server environment; it was not accepted as verification. Development’s known fixture amount was checked and remained unchanged. Fixed the server config, disabled server reuse, and added an environment response assertion before browser writes.

The full production browser suite passed (six checks, 28.6 seconds), including a live hosted save/reload/analysis and restoration of the synthetic amount. Development Turbopack repeatedly reloaded when the connected views compiled; production had no loop. This remains a development-runtime issue to isolate, not a database correctness failure. Async dropdowns were changed to controlled selection so fetched options cannot silently display a different currency from the actual filters; live regression checks cover the selected value.

## Hardening and reproducibility

Two new trusted-origin cases were run failing-first, then implemented: configured origins plus Vercel-issued deployment/branch origins, with no trust in request Host/forwarded headers. A fresh production browser run passed all six checks; Webpack development also passed the live case, resolving the observed development reload loop without changing the production compiler. The actual framework cause is not claimed beyond that reproduced comparison.

Review removed an unused role/department mapping via a real new migration. Design checks now resolve semantic CSS mappings rather than only comparing declared palette values. PostgreSQL connection/statement waits are bounded and unexpected API errors log sanitized identifiers only. Eight hosted integration checks passed, including exact totals above BIGINT sum range and two simultaneous saves with one winner. npm ci succeeded from the lockfile. A compatible audit-fix attempt left upstream development-only advisories; no force/downgrade was accepted. Current official GitHub action releases were verified and pinned to immutable commits. Separate preview/demo databases were migrated and seeded with 10,000 rows each; secrets were configured via stdin and remain ignored/server-side.

A final population-label regression was written failing-first: when lookup loading fails, active country/department/role codes must remain visible rather than becoming “All”. Implemented the fallback and controlled unknown-option display; 27 unit cases pass. Final hardening browser rerun passed all six checks (27.9 seconds). Publication review detected inherited personal author-email metadata; new commits use the verified GitHub noreply identity, with existing metadata awaiting the candidate’s choice. No private address is copied into project documents.

The first cloud attempt exposed two deployment assumptions: the CLI used production for a first deployment unless preview was explicit, and session configuration was validated before Next could reach its request-time cookies boundary. The build failed with no published working deployment. The helper now awaits cookies first, and a cross-platform build verification clears runtime credentials during compilation. Browser CI will use that build check before starting with its separately configured runtime. Deployment commands now specify the environment explicitly.

The secret-free production build passed after the request-time boundary correction; lint/type checks and all 27 unit cases passed. The actual CLI dry-run payload (103 source paths) was inspected and excludes environment files, Neon metadata, logs and private input documents.

## Deployment, recording and candidate-approved privacy

The protected Vercel Hobby preview passed independent app-auth checks, secure cookie checks, 25-of-10,000 browsing, invalid/stale writes, save/reload, matching analysis and a second-deployment persistence check. All demonstration amounts were restored. A clearly labelled silent walkthrough of the deployed HR workflow was recorded; candidate narration remains pending. Desktop/tablet/dark-mobile screenshots and a 320px overflow check were inspected. Final text/control-width refinements preserve the same business behavior.

The candidate approved GitHub noreply email metadata. Seven unpublished commits were redacted locally, with each tree, message, author/committer name, timestamp and sequence verified preserved. An ignored bundle retains the original local metadata; commit IDs necessarily changed. The development progression is unchanged.

The candidate also requested the official Neon skill/setup and confirmed Free ownership claim. Installed only neon/neon-postgres for this project; all 14 Markdown skill/reference files match the current official repository despite an inconsistent CLI stale report. Added one project-pinned authenticated MCP entry to private Codex user settings, exposing read-only schema/query/docs tools; other settings were compared and preserved. MCP initialization, 11-tool discovery and a live read-only table call succeeded. No new product services or runtime dependencies were introduced. Claiming rotated PostgreSQL credentials; purpose-separated URLs were refreshed through a separate ignored env pull, retaining all records and evaluator settings. All four databases still contain 10,000 rows.

After the ownership claim, old PostgreSQL authentication failed. Refreshed current connection credentials into a separate ignored file and revalidated all four database-purpose markers and 10,000-row counts before updating local/Vercel URL values. The data was preserved without reseeding. The MCP installer confirmed a newly minted project-limited key; read-only schema/query/docs exposure is a server restriction, separate from key scope. All existing user configuration outside the new Neon entry was compared and preserved.

### Claimed-project final review check

After the user confirmed the Free project claim, verified all four database purposes still contained 10,000 employees and refreshed the rotated credentials without reseeding. Deployed source commit `18dbc94` to a new protected preview and verified application-level anonymous rejection, secure evaluator session, bounded browsing, invalid input rejection, optimistic conflict rejection, persistent save/reload, exact filtered analysis reflecting the edit, and restoration of the original synthetic salary. The first private verification helper used the wrong cookie name; corrected the helper to the configured `salary-desk-session` and reran successfully. No application fix was required. Updated the review URL and committed sanitized observations; publication and candidate narration remain pending review.


### Approved public publication

The user explicitly approved public GitHub publication and Vercel production deployment. Published the reviewed incremental history on main after checking known credentials/private paths and noreply metadata. GitHub SSH authentication failed; used the existing authenticated HTTPS credential helper per invocation without changing global Git settings. Hosted CI https://github.com/Ayuxh-Pratap/incubyte-salary-desk/actions/runs/42995364770 passed lint, types, design checks, 27 unit cases, eight PostgreSQL cases and six production-browser checks. Configured only production DATABASE_URL, DATABASE_PURPOSE=demo, and fresh distinct evaluator/session secrets via stdin; checked demo purpose and exactly 10,000 rows first. Production is reachable without Vercel account access and enforces application evaluator access. Verified bounded browsing, validation, conflict rejection, persistent save/reload, full-population analysis, login navigation and 320px dark UI. The private HTTP helper initially expected only an HTTP redirect; corrected it for Next.js streamed redirect semantics and verified actual browser navigation to login. No product change was needed. A synthetic edit is checkpointed for the subsequent production-redeployment verification and restoration. No email/submission was sent.


### Production redeployment and final handoff

Production source `5ba7488` redeployed successfully to the canonical public URL. The previously saved synthetic amount survived; filtered analysis still matched, the evaluator session remained valid, and the original amount was restored with a version-checked update. Verified the restored value and 10,000-row bounded directory afterward. Recorded sanitized evidence in deployment-checks.json. Prepared an ignored evaluator-access note with only the application code and instructions, separate from database/session secrets. The candidate-narrated video and candidate-sent assessment submission remain pending; the agent has not emailed or submitted anything.


### Visual-quality review — baseline and approved foundation

User requested a local review branch, five paired palettes, Job Desk shell/filter/depth restoration, Dashboard, loading/race checks and evidence-based scorecards, with no main push or production changes. Inspected actual components, tokens, query/monetary boundaries, tests, CI and video artifacts. Reconfirmed 27 unit + eight PostgreSQL + six browser checks (one live plus five controlled/access) before application changes. Internal baseline scores 87 engineering / 55 UI do not substitute for submission requirements. Generated one shared-template five-pair artifact with 170 contrast checks; user selected P1 Graphite + Lime.

Implemented neutral semantic surfaces, adjacent focus, non-self-referencing elevation tokens, compact/collapsible shell and honest logout errors. Browser regression first failed at the baseline right edge (1912 instead of 1920); shell test then passed including collapse and failed logout. The first alert locator also matched Next’s route announcer; scoped it to the actual error. Corrected a private shell quoting error using a file-based helper; no secrets were exposed.

Dashboard adds one grouped headcount query and reuses exact salaryAnalysis in a repeatable-read snapshot. New helper tests failed before the module existed, then passed; PostgreSQL test failed before the query existed, then verified all headcount partitions and USD/JPY/KWD summaries against the seeded reference. Browser test first proved the old root route still landed on Employees, then passed the new default Dashboard/currency/drill-down behavior. A first cold dev/WAN fetch exceeded the test’s 5-second assumption; a bounded 20-second data assertion passed without adding application delays. Charts convert only bounded dimensionless ratios to Number, never monetary amounts. Existing backend architecture/auth/purpose checks stay intact. Narrated candidate video remains unproven.


### Responsive workspace and pending-state slice

Preserved draft-and-Apply semantics, URL validation, server filtering and currency-safe sort fallback. A focused filter-rule test failed before applyFilterDraft existed, then passed; corrected its matcher to distinguish an absent optional property from a present undefined key without changing the business rule. Workspaces now share a sticky desktop rail / compact sheet, search/view toolbar, immediate transition pending state and keyed abortable data. Matched table/card/metric/detail skeletons retain headers and pagination; money remains exact and right aligned, and mobile analysis now includes minimum/maximum values.

Controlled browser checks verified atomic drafts, pagination geometry, final/empty pages, Back/Forward, obsolete response rejection, retry, sheet focus return, adjacent keyboard focus, keyboard table scrolling and short-viewport rail reachability. They caught a real bug: a completed earlier route reset a newer unapplied search draft. Preserved the newer draft using the accepted submission snapshot; the failing RSC-delay case then passed. The same first-failing case caught Dashboard currency draft loss and was fixed in a small CurrencyPicker. Explicit labels were separated from select options to improve exact label targeting. Focus assertions now use actual keyboard navigation after sheet focus restoration, retaining the strict 2px/zero-offset/no-size-change requirement.

A first-failing Dashboard-initial-error case exposed indefinitely displayed loading cards above a distant error. Added a nearby retry and stopped those skeletons on terminal initial failure. Made the failure fixture persist until Retry, so React development Strict Mode’s aborted first request cannot silently turn it into a success. Split Dashboard population/median presentation into focused modules; queries and calculations did not change. Mobile appearance/session controls moved into the header and headcount cards use a compact two-column layout. Seven controlled cases, 30 units, lint/type and expanded design checks passed; full production-browser regression remains the next check.

### Final production regression and chart loading

A generic chart placeholder had different row/header geometry from the actual country/department/median panels. Reused their real panel/header/row tracks for skeletons and verified median-chart height within one pixel in the controlled currency-transition case. The first full production run passed 14/15 browser cases; a fast production run reached the toolbar assertion while the filter sheet’s exiting portal still contained its Apply button. Made closure explicit with a condition-based unmount assertion, then reran all production browser cases successfully. Hover/pressed assertions likewise wait for computed CSS states, with no artificial application delay. Final local checks: lint/types, 24 text-contrast pairs plus focus/field-boundary checks, 30 unit cases, nine PostgreSQL cases and all 15 production-browser checks passed. Live salary writes ran only against the purpose-marked test database and restored the original amount. No main push, production deployment, email or submission occurred in this pass.

### Viewport sweep caught an overflow missed by workflow checks

At 768px Salary Overview, the table was intentionally scrollable but a screen-reader-only absolute header label used a containing block outside that scroller and increased document width to 991px. The main panel and mobile header stayed bounded, which is why a body/main-only visual assumption would have been misleading. Added a failing 768px document-width assertion to the analysis browser case, then positioned both table scroll wrappers relatively. The case passed, and a 16-toggle appearance probe no longer reproduced the overflow. No negative margin, page-level clipping workaround or focus removal was added. The final viewport sweep and production rerun follow this correction.


### Final visual inspection

Captured all three routes at 320/390/768/1366/1920 in both themes: 30 combinations passed document/main/header width checks with no page errors; anonymous Dashboard navigation reached login. Inspected representative phone/tablet/laptop/wide screens in both themes, plus median comparisons and employee detail. The Dashboard action card stretched to the median chart’s height; changed only its grid alignment to keep it compact. Rechecking the final build/browser suite and captures after this visual correction.
