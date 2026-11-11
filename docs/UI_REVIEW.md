# Salary Desk visual-quality review

This is our internal review rubric, not Incubyte’s scoring system. Baseline: public commit `3c6ff79`; work stays on local `codex/visual-quality`. No main push, production deployment, public-history rewrite, email or submission is authorized in this pass.

## Baseline evidence and decisions

- Reconfirmed 27 unit cases, eight isolated hosted PostgreSQL cases, one live salary-save/analysis browser case and five remaining production-browser cases. Lint/type/design and production build passed; lint emitted one warning from an ignored private operator helper because ESLint does not yet exclude `.vercel`.
- Read domain/use-case code, schema/query/environment boundaries, API access, UI state, tests, CI and deployment records. Scores do not infer architecture from screenshots or claim full operational readiness from test counts.
- Project contains a 48-second silent reference WebM; no candidate-narrated recording or shareable narrated-video link is present in the project/handoff. A mandatory video handoff remains unproven. No claim about files outside inspected evidence.
- P1 Graphite + Lime selected explicitly by the user after reviewing the five-pair artifact. Only this pair will be applied globally. The other directions remain documentation, not a settings feature.

## Actual reuse and divergence

| Area | Observed reuse | Divergence / root cause |
| --- | --- | --- |
| Typography/providers | Packaged Geist, next-themes and reduced-motion provider pattern | Preserved; no font replacement needed |
| Tokens | Semantic Tailwind roles and documented/checkable CSS palette | Dark canvas/surface/paper were changed to green; neutral surface ramp was lost |
| Buttons | Base UI + CVA wrapper, icons and loading state | Simplified to one shallow shadow; missing distinct highlight/hover/pressed tokens |
| Sheets | Animate UI/Base UI accessible dialog pattern, reviewed cancellation | Close label hardcoded to employee panel; loading shape does not match editor |
| Shell | Compact left navigation and mobile adaptation | Job Desk inset composition was not retained: right padding, all-corner border/radius, max-w-7xl and document scroll |
| Filters/data | Salary-specific forms and database queries | Horizontal form, no adjacent/sticky rail; skeletons erase table tracks/footer |
| Focus | Solid theme-aware global outline | Three-pixel offset creates the detached halo seen in the screenshots; do not copy Job Desk’s weaker low-opacity focus ring |
| Sidebar footer | Theme and logout primitives | Promotional card, repeated disclaimer and oversized stacking; logout ignores failure response |

## Baseline A — architecture/engineering: 87 / 100

| Dimension | Score | Evidence | Remaining gap / confidence |
| --- | ---: | --- | --- |
| Domain and money | 24/25 | BigInt minor units, string JSON, rational median, MAX/precision/rounding tests | Approved business definitions still externally provisional; high confidence within current scope |
| Backend/DB/API | 18/20 | Shared parameterized predicates, repeatable-read analysis, constraints, conditional version update | No recovery/load exercise; no new service justified; high for inspected paths |
| Structure/maintainability | 13/15 | Pure domain, thin routes, query adapters | Repeated loading/table layout and large screen components; medium-high |
| Automated verification | 13/15 | Fresh 27/8/6 checks, real simultaneous-write integration, controlled UI failure | Missing loading/navigation-race/responsive rail/Dashboard coverage; high for asserted behaviors only |
| Security/reliability | 8/10 | UI/API sessions, origin checks, purpose markers, fail-closed test DB | Shared evaluator identity, no per-user revocation/rate-limit evidence; logout failure ignored; medium-high, no penetration-test claim |
| Performance/operations | 7/10 | Bounded pages, measured 10k queries, isolated environments, verified earlier deployed persistence | Free-plan cold-start/load and recovery unverified; measurements are limited samples; medium |
| Documentation/AI evidence | 4/5 | Requirements-first history, decision/AI record, reproducible instructions | Narrated video absent; baseline UI claims outpace actual presentation; high for repository artifacts |

## Baseline B — UI/interaction: 55 / 100

| Dimension | Score | Evidence | Remaining gap / confidence |
| --- | ---: | --- | --- |
| IA/data presentation | 14/25 | Units, employee detail, population analysis and drill-down exist | No Dashboard, wide gutter/max-width waste, numeric alignment and range hierarchy weak; high |
| Design consistency | 10/20 | Central tokens/shared primitives | Green surfaces, weak depth, header/hover collision, detached focus; high |
| Responsive behavior | 13/20 | Real 320px check and mobile cards | Desktop space wasted, horizontal filters consume tablet height, no compact filter sheet; medium-high |
| Interaction/loading | 8/20 | AbortController + URL-key guard prevent obsolete results | Pending starts after navigation, mismatched skeletons, footer disappears, no latency/race evidence; high for code, medium for unexercised timing |
| Accessibility | 10/15 | Native labels, sheet focus/escape, 44px targets, reduced motion | Busy announcements, compact navigation, clipped focus and table scroll/keyboard need checks; medium, not a complete WCAG audit |

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

Not assessed yet. Implemented changes, final checks, screenshots, remaining limitations and both updated scorecards will be recorded here before handoff.

## Submission readiness baseline

| Item | State |
| --- | --- |
| Concise requirements before implementation | Present in genuine initial commit; definitions provisional |
| Functional backend/UI, relational DB, 10k seed | Reconfirmed with isolated tests; baseline presentation needs this pass |
| Meaningful unit tests | 27 passed freshly; more focused coverage planned |
| Public source, genuine incremental history | Published main baseline preserved; review branch local only |
| Live evaluator access/persistence | Prior deployment checks recorded; no production changes in this pass |
| CI | Existing public baseline passed; review changes not yet run/published |
| Setup/design/architecture/AI evidence | Present; update for this pass |
| Actual video demonstration | Silent reference exists; candidate narration/link not evidenced — submission blocker |
| Final candidate review/submission | Pending; no email/submission by agent |
