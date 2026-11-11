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
