# Salary Desk requirements

Status: user-approved working scope, pending Incubyte clarification. Written before implementation.

## Goal and user

Replace ACME's spreadsheet salary workflow for an HR Manager managing 10,000 employees across multiple countries. Make individual corrections safe and compensation questions answerable with clearly defined populations.

## Business definitions

Salary means current annual base salary, with explicit currency and annual period. Bonuses, equity, benefits, deductions and payroll are excluded. Amounts must be positive and respect currency precision; missing values are never zero. Monetary comparisons and totals use a single currency. These are provisional product decisions approved by the candidate, not externally confirmed requirements.

## Workflows

1. Dashboard: organization headcounts and graphical current-pay comparisons in one selected currency, with clear paths into the workspace. No historical activity or mixed-currency monetary total.
2. Employees: search by name or employee number; filter by country, department, role and currency; allowlisted sorting and database pagination.
3. Employee detail: inspect current compensation and safely edit salary. Show update metadata, preserve input after failure, and reject conflicting stale edits.
4. Salary overview: headcount, total, minimum, maximum and median for the entire filtered population, grouped by country, department or role. Label currency, period, filters and sample sizes. Never infer pay fairness.
5. After the core: explain a metric with definitions and matching employees; preview salary changes with exact absolute and rounded percentage differences.

## Acceptance criteria

- Explicit deterministic seeding creates exactly 10,000 fictional employees. Repeated seeding does not duplicate or overwrite edits; reset is separately guarded.
- Employee responses are bounded pages, never a browser-side copy of all records.
- Server validation and database constraints reject invalid amounts without partial writes.
- Version-checked edits persist after reload and deployment restart; failures never show success.
- Summaries and drill-downs share list filters and include all matching records, not only a page.
- Exact money arithmetic handles currency precision, rounding, odd/even median, empty and single-record populations. Mixed currencies cannot produce one total.
- UI and API require evaluator access; secrets stay server-side. Phones, tablets, desktop, both themes and keyboard operation are supported.
- Fast deterministic unit tests, PostgreSQL integration tests, one HR browser workflow, lint/type/design checks and a production build pass.

## Deliberate exclusions

No employee creation/deletion, compensation history, scheduled pay, imports, bulk changes, FX, tax, payroll, chatbot or microservices: these introduce rules outside the current assessment scope.

## Delivery

Git repository with genuine incremental commits, requirements, setup/architecture/tradeoff and AI evidence; persistent deployed application and an actual video demo. Source and production publication were subsequently candidate-approved and completed; evaluator access is configured. The candidate’s narrated video and submission remain pending. Clarification may revise business definitions.
