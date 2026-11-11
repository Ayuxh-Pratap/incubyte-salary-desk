# Delivery and verification

## Implementation sequence
- [x] Read original assessment, supporting JD/notes/resume and approved scope.
- [x] Inspect target/parent Git boundaries and selectively map the UI foundation.
- [x] Record requirements and design before application implementation.
- [ ] Runnable Next application, theme/shell, database configuration and first migration.
- [ ] Deterministic seed and database-backed employee browsing.
- [ ] Validated persistent salary edits and optimistic conflict handling.
- [ ] Single-currency filtered statistics over the full population.
- [ ] Explain-a-number drill-down and salary-change preview.
- [ ] Unit, PostgreSQL integration, browser, accessibility/design and production checks.
- [ ] Measured performance on the seeded dataset; deployment persistence verification.
- [ ] Clean setup rehearsal, final checklist, video and publication readiness.

Use genuine test-first cycles for money and consequential server behavior. Capture a failing test, implement the smallest correct behavior, rerun and refactor. Commit coherent actual milestones; never manufacture history.

## Verification map
Money: decimal parsing, precision, positivity, bounds, unit compatibility, sum/min/max/odd-even median, half-up rounding and exact change percentages. Filters: invalid values, sort allowlist, stable pagination, zero matches. Database: migration constraints, exactly 10,000 seeded, repeat seed unchanged, rollback/conflict, complete-population aggregates. Access: UI/API unauthorized, malformed/tampered/expired sessions, origin checks and preview-write protection. UI: failed saves preserve input, success only after persistence, keyboard/dialog focus, responsive themes. E2E: authenticate -> filter -> open employee -> reject invalid salary -> save valid salary -> reload -> verify analysis.

Performance evidence will record method, machine/runtime, database region/tier, dataset, indexes, warm/cold state, query plans and actual timings. No benchmark claims yet.

## Handoff
README must include install/configuration, migrations, seed, guarded reset, tests, deployment and limitations. Final video is required, not replaced by this plan: record the HR problem, one correction, one filtered insight, calculation evidence and a design tradeoff in about 4 minutes. Review deployment, source publication and submission separately; no emails or assessment submission by the agent.

## Current pending items
Hosted database/account configuration, external scope reply, actual deployment and video. No behavior is claimed implemented before verification. Target: strong first submission in 2-3 days, with correctness and deployment ahead of optional polish.
