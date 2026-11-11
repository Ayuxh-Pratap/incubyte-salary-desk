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
