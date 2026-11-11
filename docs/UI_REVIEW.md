# Salary Desk visual-quality review

This is our internal review rubric, not Incubyte’s scoring system. Baseline: public commit `3c6ff79`; work stays on local `codex/visual-quality`. No main push, production deployment, public-history rewrite, email or submission is authorized in this pass.

## Baseline evidence and decisions

- Reconfirmed 27 unit cases, eight isolated hosted PostgreSQL cases, one live salary-save/analysis browser case and five remaining production-browser cases. Lint/type/design and production build passed; lint emitted one warning from an ignored private operator helper because ESLint does not yet exclude `.vercel`.
- Read domain/use-case code, schema/query/environment boundaries, API access, UI state, tests, CI and deployment records. Scores do not infer architecture from screenshots or claim full operational readiness from test counts.
- Project contains a 48-second silent reference WebM; no candidate-narrated recording or shareable narrated-video link is present in the project/handoff. A mandatory video handoff remains unproven. No claim about files outside inspected evidence.
- P1 Graphite + Lime selected explicitly by the user after reviewing the five-pair artifact. Only this pair will be applied globally. The other directions remain documentation, not a settings feature.

## Actual reuse and divergence

| Area                 | Observed reuse                                                      | Divergence / root cause                                                                                                    |
| -------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Typography/providers | Packaged Geist, next-themes and reduced-motion provider pattern     | Preserved; no font replacement needed                                                                                      |
| Tokens               | Semantic Tailwind roles and documented/checkable CSS palette        | Dark canvas/surface/paper were changed to green; neutral surface ramp was lost                                             |
| Buttons              | Base UI + CVA wrapper, icons and loading state                      | Simplified to one shallow shadow; missing distinct highlight/hover/pressed tokens                                          |
| Sheets               | Animate UI/Base UI accessible dialog pattern, reviewed cancellation | Close label hardcoded to employee panel; loading shape does not match editor                                               |
| Shell                | Compact left navigation and mobile adaptation                       | Job Desk inset composition was not retained: right padding, all-corner border/radius, max-w-7xl and document scroll        |
| Filters/data         | Salary-specific forms and database queries                          | Horizontal form, no adjacent/sticky rail; skeletons erase table tracks/footer                                              |
| Focus                | Solid theme-aware global outline                                    | Three-pixel offset creates the detached halo seen in the screenshots; do not copy Job Desk’s weaker low-opacity focus ring |
| Sidebar footer       | Theme and logout primitives                                         | Promotional card, repeated disclaimer and oversized stacking; logout ignores failure response                              |

## Baseline A — architecture/engineering: 87 / 100

| Dimension                 | Score | Evidence                                                                                           | Remaining gap / confidence                                                                                                            |
| ------------------------- | ----: | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Domain and money          | 24/25 | BigInt minor units, string JSON, rational median, MAX/precision/rounding tests                     | Approved business definitions still externally provisional; high confidence within current scope                                      |
| Backend/DB/API            | 18/20 | Shared parameterized predicates, repeatable-read analysis, constraints, conditional version update | No recovery/load exercise; no new service justified; high for inspected paths                                                         |
| Structure/maintainability | 13/15 | Pure domain, thin routes, query adapters                                                           | Repeated loading/table layout and large screen components; medium-high                                                                |
| Automated verification    | 13/15 | Fresh 27/8/6 checks, real simultaneous-write integration, controlled UI failure                    | Missing loading/navigation-race/responsive rail/Dashboard coverage; high for asserted behaviors only                                  |
| Security/reliability      |  8/10 | UI/API sessions, origin checks, purpose markers, fail-closed test DB                               | Shared evaluator identity, no per-user revocation/rate-limit evidence; logout failure ignored; medium-high, no penetration-test claim |
| Performance/operations    |  7/10 | Bounded pages, measured 10k queries, isolated environments, verified earlier deployed persistence  | Free-plan cold-start/load and recovery unverified; measurements are limited samples; medium                                           |
| Documentation/AI evidence |   4/5 | Requirements-first history, decision/AI record, reproducible instructions                          | Narrated video absent; baseline UI claims outpace actual presentation; high for repository artifacts                                  |

## Baseline B — UI/interaction: 55 / 100

| Dimension            | Score | Evidence                                                         | Remaining gap / confidence                                                                                                                       |
| -------------------- | ----: | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| IA/data presentation | 14/25 | Units, employee detail, population analysis and drill-down exist | No Dashboard, wide gutter/max-width waste, numeric alignment and range hierarchy weak; high                                                      |
| Design consistency   | 10/20 | Central tokens/shared primitives                                 | Green surfaces, weak depth, header/hover collision, detached focus; high                                                                         |
| Responsive behavior  | 13/20 | Real 320px check and mobile cards                                | Desktop space wasted, horizontal filters consume tablet height, no compact filter sheet; medium-high                                             |
| Interaction/loading  |  8/20 | AbortController + URL-key guard prevent obsolete results         | Pending starts after navigation, mismatched skeletons, footer disappears, no latency/race evidence; high for code, medium for unexercised timing |
| Accessibility        | 10/15 | Native labels, sheet focus/escape, 44px targets, reduced motion  | Busy announcements, compact navigation, clipped focus and table scroll/keyboard need checks; medium, not a complete WCAG audit                   |

A high score does not satisfy the missing mandatory narrated-video handoff. JD mapping: exact TypeScript rules/SQL address backend craftsmanship; test-first changes and reviewable slices demonstrate quality/refactoring; honest AI decisions demonstrate intentional AI use. No product chatbot is needed.

## Chosen composition and implementation plan

Use the existing modular monolith, one main-panel scroller and a sticky filter rail (not fixed). A document-scrolling patch would leave the shell mismatch; a client-app rewrite would add risk without HR value. Reuse the existing server rules and query boundaries.

1. **Baseline + palettes**: this record, one shared-template HTML comparison, 170 measured contrast checks. Baseline screenshots use only the isolated test DB.
2. **Foundation**: apply approved P1 centrally; tactile control tokens, adjacent 2px focus, flush-right inset shell, compact footer and collapsible navigation. Preserve all access checks; handle failed logout honestly.
3. **Workspace**: desktop filter rail at >=1280px, scrollable only when viewport height requires; below that, labelled focus-contained sheet. Search/view controls beside results. Every draft control (including sorting/page size) applies together through Apply; pagination is immediate. URL remains source of applied state; Back/Forward restores it. New data never appears under stale labels.
4. **Pending/results**: shared navigation transition and keyed abortable requests; retain structure/headers/pagination, render matching table/card/detail skeletons, announce busy/error/empty states. Do not retain stale rows under new filters.
5. **Dashboard**: default /dashboard (root/login route there). Global current headcount and country/department/currency counts, global headcount bars and workspace links. Selected currency: current annual-base headcount/total/median and department median bars. Reuse salaryAnalysis; one narrowly scoped grouped headcount query, no employee-array download, no history/FX/targets/activity. Global and currency-scoped populations explicitly separated. All charts expose exact values as text; bounded numeric conversion is for bar percentages only.
6. **Verify + review**: focused failing-first tests for Dashboard rules/query and consequential interactions; full relevant checks after changes, representative 390/768/1366/1920 both-theme screenshots plus 320px overflow. Controlled latency/failure/race tests; isolated salary writes/restoration. Update before/after scorecards with evidence, gaps and confidence. Local coherent commits only.

## Dashboard data definitions

Global headcount counts every current employee once; country is employment country, not inferred pay currency. Country and department bars display headcounts, not monetary totals. Countries/departments/currencies cards count populated groups. The currency selector applies on submit. Currency metrics and departmental medians include every employee paid in the selected currency, current annual base only. Median uses the existing exact rational calculation. Bar widths normalize exact rational values into bounded percentages for display; values and comparisons retain currency/period labels. Small groups are descriptive, not fairness evidence. Detailed filters and metric explanations remain in Salary Overview; individual corrections remain in Employees.

## Palette and pattern references

[Five-pair comparison](review/palette-comparison.html), [measured contrast pairs](review/palette-contrast.json). All palettes use the same semantic structure; contrast checks cover declared pairs, not a full accessibility audit.

- [Carbon data-table guidelines](https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines): group search/utilities in a toolbar, distinguish sortable headers and loading structure.
- [Atlassian dynamic table](https://atlassian.design/components/dynamic-table/): explicit pagination/sorting and coherent selected-row treatment.
- [W3C focus appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance): clearly visible adjacent focus contrast. We check 3:1 token pairs without claiming full WCAG conformance.

## After-pass evidence

Application source reviewed: 3a78def. [Before/after board](review/before-after.html), [verification record](review/verification.json) and selected screenshots in review/evidence. Full local capture set: ignored artifacts/review (30 theme/viewport cases plus detail, median and matched-population shots). Reproduce with npm run ui:capture; the purpose-guarded Playwright matrix is opt-in and skipped in ordinary CI to keep routine checks short. No Job Desk screenshots or private inputs are included.

Completed: approved P1 tokens, flush-right/scrolled inset shell, collapsible navigation, compact appearance/logout, adjacent sticky filters and compact sheet, atomic drafts, persistent URL restoration, table alignment/state separation, matching skeletons, immediate pending feedback, explicit error/retry and the default Dashboard. Fixed failed-logout reporting, newer-draft overwrites during RSC navigation, Dashboard’s distant initial error, and the absolute table-label overflow found by the viewport sweep.

Reconfirmed 30 unit, nine PostgreSQL and 15 production-browser cases; lint/type/design/build passed. Unit run total approximately 0.3s, hosted integration 52.23s including seed/WAN, final browser run 43.5s after its production build. These are observed check durations, not product latency or SLAs. The browser suite uses a purpose-marked isolated test DB for the live write/restoration case; fixtures are separately labelled. No production data was edited/reset for this pass.

Geometry: representative controlled tests assert table header tracks, pagination height, metric-region height and median-chart height within one pixel. Tested delayed accepted responses, late obsolete responses, newer unapplied drafts during RSC, repeat submissions, disabled rapid pagination, history, final/empty pages, retry and sheet focus return. Tactile hover/pressed changes and quiet row actions are checked after computed styles settle. This does not promise zero layout shift for every name, amount, group count or possible timing.

Captured Dashboard, Employees and Overview at 320/390/768/1366/1920 in light/dark; no document/main/mobile-header horizontal overflow or page errors. Inspected representative screens in both themes at each requested device category, plus the editor and median chart. Intentional horizontal table scrolling remains inside its labelled keyboard-scrollable region. Native select menus remain browser/OS controlled.

## Reproduce the checks

Configure isolated TEST_DATABASE_URL / TEST_DATABASE_PURPOSE=test in ignored .env.local first. PowerShell:

```powershell
npm run lint
npm run typecheck
npm run design:check
npm test
npm run test:prepare
npm run test:integration
$env:E2E_LIVE_DATABASE = "true"
try { npm run test:e2e } finally { Remove-Item Env:E2E_LIVE_DATABASE }
npm run ui:capture
```

Playwright builds without runtime secrets and starts its own purpose-marked test server. The ordinary suite has 15 workflow checks; the visual matrix is a separate opt-in case with 30 combinations. It does not write employee data.

## After A — architecture/engineering: 91 / 100

| Dimension                 | Score | Evidence                                                                                                              | Remaining gap / confidence                                                                             |
| ------------------------- | ----: | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Domain and money          | 24/25 | Existing exact rules unchanged; new median normalization and bounded chart-ratio tests                                | Business definitions still externally provisional; high within accepted scope                          |
| Backend/DB/API            | 18/20 | New protected read model reuses salaryAnalysis; one grouped headcount query; all three dimensions sum to 10k in tests | Recovery/load/cold-start behavior not requalified; high for tested paths                               |
| Structure/maintainability | 14/15 | Shared workspace navigation, drafts, table tracks and metrics; focused Dashboard charts                               | Filter component remains substantial; no reason to refactor backend; medium-high                       |
| Automated verification    | 14/15 | 30 rules, nine real PG cases, 15 production-browser checks including meaningful latency/race/geometry cases           | Chromium only; no exhaustive scheduling or property-based suite; high for assertions                   |
| Security/reliability      |  9/10 | Existing gates preserved; Dashboard UI/API access checked; honest logout failure; isolated writes restored            | Shared evaluator identity, no full security audit; medium-high                                         |
| Performance/operations    |  7/10 | Bounded responses and aggregate read model; no browser-side 10k index; prior measured SQL evidence retained           | Review not deployed/hosted-CI tested by instruction; free-plan load/recovery remain unverified; medium |
| Documentation/AI evidence |   5/5 | Requirements/design/readiness updated; real red/green failures/corrections and review evidence committed              | Candidate must understand/explain it and record final video; high for artifact accuracy                |

## After B — UI/interaction: 90 / 100

| Dimension            | Score | Evidence                                                                                                                      | Remaining gap / confidence                                                                             |
| -------------------- | ----: | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| IA/data presentation | 23/25 | Distinct Dashboard/workspaces, explicit global/currency populations, aligned numbers/ranges and drill-downs                   | No HR-user usability study; tablet analysis intentionally scrolls horizontally; medium-high            |
| Design consistency   | 18/20 | Approved neutral P1, centralized elevation/state roles, 170 option-pair and expanded runtime checks                           | Native select popups vary; palette preference is subjective; high for token consistency                |
| Responsive behavior  | 18/20 | 30 captured route/theme/size cases plus short-height rail and table-scroll checks; real overflow regression fixed             | Physical devices and non-Chromium engines unverified; medium-high                                      |
| Interaction/loading  | 18/20 | Two-phase pending, matched tracks, retained pagination, retry, stale-response and newer-draft protection                      | Representative timing/geometry only, not every possible interleaving or dataset; high for tested cases |
| Accessibility        | 13/15 | Explicit labels, 44px targets, keyboard focus/scroll, sheet return, busy/live semantics, reduced motion and measured contrast | Full screen-reader, forced-color and 200% zoom audit not done; medium                                  |

Totals are our internal assessment of this reviewed branch, not Incubyte’s rubric, a production certification, or a substitute for missing deliverables. Engineering improved through focused verification/reliability and clearer UI boundaries; monetary/backend architecture was preserved. The main UI gain is functional information architecture and pending behavior, not a larger feature count.

## Submission blockers, follow-ups and release plan

**Blockers/gates:** final explained demonstration/video link is not evidenced. Only the silent baseline reference and raw clips were found; it does not show this updated Dashboard/P1 pass. Anything recorded elsewhere is unverified. Review changes are intentionally local/unpublished; candidate review, hosted CI/preview and release are still gates before submitting this version. No employer confirmation of provisional business rules is claimed.

**Worthwhile follow-ups:** Firefox/Safari and physical touch checks, manual screen-reader/forced-colors/zoom review, then a small HR task-based usability check. Cold-start/load/recovery evidence is separate operational work, not something a UI score establishes. No history, FX, product LLM, service split or additional primitive library was added to inflate scope.

1. Review local app on port 3200 (private code in ignored .vercel/review-access.md), palette and before/after board; inspect diff from main and this evidence. P1 is already selected.
2. On authorization, publish this review branch/open a PR and run hosted CI. Deploy only an isolated preview with DATABASE_PURPOSE=preview; inspect it on desktop/phone and verify authenticated read/edit/reload without touching demo data unnecessarily.
3. After candidate approval, merge normally preserving genuine incremental commits and promote the reviewed build using the existing demo database. Schema/migrations/seed are unchanged by this pass: no reset or reseeding is needed. Verify public login/API gates and persistent data.
4. Record and replay the final narrated demo against that approved release, share a working video link, then the candidate sends the assessment. The agent does not email or submit it.

**Interview path:** explain why Dashboard headcount partitions are not added together; trace GET /api/dashboard through session checks, a repeatable-read transaction, grouped counts and reused salaryAnalysis. Explain why chart percentages are bounded visual ratios while money stays BigInt/string. Then trace a draft through Apply -> navigation transition -> keyed/abortable fetch -> skeleton -> accepted results; explain the submission snapshot that preserves newer typing. The salary parser/CAS save walkthroughs in Engineering remain unchanged.

## Submission readiness

| Item                                           | State                                                                                                      |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Concise requirements before implementation     | Present in genuine initial commit; definitions provisional                                                 |
| Functional backend/UI, relational DB, 10k seed | Reconfirmed: nine PG cases and 15 production-browser cases; synthetic rows exactly 10k                     |
| Meaningful unit tests                          | 30 passed; exact rules remain fast and deterministic                                                       |
| Public source, genuine incremental history     | Published main baseline preserved; review branch local only                                                |
| Live evaluator access/persistence              | Prior deployment checks recorded; no production changes in this pass                                       |
| CI                                             | Published main baseline still green; review checks passed locally, hosted review run intentionally pending |
| Setup/design/architecture/AI evidence          | Updated for Dashboard, P1 and actual verification; private inputs excluded                                 |
| Actual video demonstration                     | Silent reference exists; candidate narration/link not evidenced — submission blocker                       |
| Final candidate review/submission              | Pending; no email/submission by agent                                                                      |
