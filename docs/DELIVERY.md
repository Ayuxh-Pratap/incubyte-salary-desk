# Delivery, verification and demo

Status: core implementation verified; public source and production published with candidate approval; hosted CI passed; candidate narrated video pending. Scope is candidate-approved pending Incubyte clarification. No assessment email has been sent by the agent.

## Completion checklist

- [x] Read assessment/supporting context; inspect independent Git boundary and UI reuse.
- [x] Requirements and architecture committed before application code (initial documentation commit).
- [x] Protected responsive UI, PostgreSQL migrations and deterministic synthetic seed.
- [x] Bounded browsing, literal search, shared filters and stable sorting/pagination.
- [x] Exact salary edits, preview, validation, retained drafts and optimistic conflicts.
- [x] Full-population single-currency analysis, group drill-down and number explanations.
- [x] 27 fast deterministic unit cases; 8 real hosted PostgreSQL cases; 6 production browser checks.
- [x] Design/contrast, lint, type and production-build checks; Webpack development workflow verified.
- [x] Seeded performance observations and EXPLAIN plans; fresh npm ci rehearsal.
- [x] Separate development/test/demo/preview PostgreSQL databases, migrated and seeded explicitly.
- [x] Final hardening browser rerun: six checks passed against a fresh production build.
- [x] Deployed authentication, bounded browsing, edit/reload, analysis and redeployment persistence; synthetic amounts restored.
- [x] Working protected review preview; Neon claimed into a verified Free account.
- [x] Candidate-approved public repository and production publication; first hosted CI passed.
- [ ] Candidate's final narrated video and user-sent submission.

Review preview: https://incubyte-salary-desk-o18vhwryg-ayuxh-prataps-projects.vercel.app (Vercel account access, then evaluator code). The database project is now claimed into the candidate’s verified Free account; the earlier temporary expiry no longer describes the current setup. The candidate explicitly approved public source and production publication. No paid upgrade.

## Published handoff

- Application: https://incubyte-salary-desk.vercel.app (application evaluator code required; no Vercel account).
- Repository: https://github.com/Ayuxh-Pratap/incubyte-salary-desk (public, main branch, genuine incremental commits).
- Hosted verification: https://github.com/Ayuxh-Pratap/incubyte-salary-desk/actions/runs/42995364770.
- Owner access: the production evaluator code is in ignored .env.production.local under EVALUATOR_PASSWORD. Share only that code privately with the evaluator; never share database/session credentials or publish the environment file. Production and preview codes are distinct.
- Video: the silent reference exists; the candidate’s final narration and shareable recording link remain pending.

## Requirement to evidence

| Requirement / risk                         | Evidence                                                                           |
| ------------------------------------------ | ---------------------------------------------------------------------------------- |
| Product framing before build               | REQUIREMENTS.md, first Git commit                                                  |
| Full backend/UI + relational DB            | App routes, domain rules, server queries, Drizzle schema/migrations                |
| Exactly 10,000 synthetic employees         | Seed verifies count transactionally; hosted development/test/demo/preview runs     |
| Repeat seed preserves edits                | Real PostgreSQL integration test; reset is a separate guarded command              |
| Money precision and rounding               | money.test.ts; max-range SQL aggregate fixture; rational median explanation        |
| Complete populations, matching drill-down  | Shared employeeWhere predicate; list/analysis intersection and aggregate tests     |
| Lost-write protection                      | Use-case tests, conditional SQL update, actual simultaneous-write integration case |
| Failure preserves input / no false success | Browser 503/409 interaction test; saved-success only on confirmed response         |
| UI + API protected                         | Server layout/session checks, tampered-session and foreign-origin browser checks   |
| 10,000-record behavior                     | Bounded page assertions; actual query plans/timings in performance.json            |
| Reproducible delivery                      | Lockfile, env example, migration/seed/test commands and CI workflow                |
| Intentional AI collaboration               | AI_COLLABORATION.md records real prompts/decisions, corrections and checks         |
| Deployed persistence / final video         | deployment-checks.json verifies reload/redeploy; silent reference recorded; candidate narration pending |

Unit cases run without DB/network. Hosted integration cases use only a purpose-marked isolated test database and rollback fixtures or restore known amounts. UI transport fixtures deliberately simulate failures; they are not presented as database proof. The live browser case verifies its test-environment response header **before any salary write** and restores its amount. CI uses disposable PostgreSQL 17; [Hosted GitHub CI passed](https://github.com/Ayuxh-Pratap/incubyte-salary-desk/actions/runs/42995364770), including all 27 unit, eight PostgreSQL and six production-browser checks.

## Remaining limitations and decisions

- Working definitions await external clarification; use the impact map in Engineering before changing requirements, schema, parsing, queries, UI or tests.
- One shared evaluator identity and current update metadata; full IAM and salary history are outside scope.
- Descriptive compensation figures do not establish fairness, explain differences or represent market benchmarks. Seed ranges are illustrative.
- The Windows/Turbopack development reload loop was reproduced; supported Webpack development and default production builds both passed the live workflow.
- Production dependency audit has no advisories at the last check. Development tooling retains upstream moderate esbuild/minimatch advisories; no esbuild serve/studio endpoint is exposed. Automatic forced downgrade of Drizzle was rejected. ESLint 9 is retained for Next plugin peer compatibility; ESLint 10 conflicts with those current peer ranges.
- Performance evidence distinguishes local WAN transaction timings from database execution. No production latency, cold-start or SLA claim yet.

## A four-minute demo

1. **0:00–0:25 — Problem.** ACME has 10,000 people in multiple countries. HR needs careful current-pay corrections and answers for clearly defined comparable populations. Explain annual base salary and single-currency scope.
2. **0:25–1:20 — Workflow.** Search an employee number; show country/department/currency context. Enter an invalid amount, then a valid amount. Explain the change preview, save, and reload to demonstrate persistence.
3. **1:20–2:15 — Insight.** Select USD, group by country or department, and explain the median. Show filters, full population and matching employees. Point out small samples and no FX/fairness inference.
4. **2:15–3:15 — Engineering.** Show the tiny architecture diagram. Trace decimal input -> BigInt minor units -> string API -> PostgreSQL; explain the version-checked update and a conflict.
5. **3:15–4:00 — Evidence and tradeoff.** Show fast unit results, PostgreSQL concurrency/aggregate checks and actual performance observations. Explain selective UI reuse and one AI correction you reviewed. State the provisional business definitions and deliberate exclusions.

## Recording and submission steps

Open the deployed app in a clean browser at approximately 1440 × 900, close unrelated tabs and notifications, and authenticate **before** recording so the access code stays private. Capture the browser with microphone narration, follow the story above, and avoid real candidate correspondence or environment files. Keep text legible at normal playback. Stop, replay the entire video, confirm audio and reload/persistence are visible, export a shareable video and verify the link in a private browser. A completed silent reference walkthrough is at artifacts/salary-desk-silent-walkthrough.webm. It is labelled AI-recorded reference footage and remains separate from the candidate’s narrated handoff.

Source and production publication are complete, with hosted CI passing. Complete the candidate-narrated video and replay it before submission. The candidate replies to the original assessment thread with repository, deployment/evaluator-access instructions and video links. The agent does not send or submit it.

Windows recording: authenticate first; press Win + Shift + R, select the browser area, choose Start and enable microphone narration if offered. Follow the four-minute story, stop and replay the saved MP4. If your recorder lacks microphone input, use a recorder with screen-plus-microphone support. See [Microsoft’s recording instructions](https://support.microsoft.com/en-us/windows/apps/use-snipping-tool-to-capture-screenshots).
