export const REPOSITORY =
  "https://github.com/Ayuxh-Pratap/incubyte-salary-desk";
export const PUBLISHED_COMMIT = "3c6ff79a9997829a655a295ec325d93594e3fb8a";
// Only these reviewed files may be shown. Never enumerate a directory or accept a path from the URL.
export const ARTIFACTS = {
  "final-report": {
    file: "docs/FINAL_PASS.md",
    title: "Final focused-pass report",
    status: "Current local review; measured outcomes and release gates",
    format: "markdown",
  },
  "query-plans": {
    file: "docs/review/final-pass/read-query-plans.json",
    title: "Current SQL execution evidence",
    status:
      "Current local isolated database; n=5 WAN reads and one plan per query",
    format: "json",
  },
  "edit-evidence": {
    file: "docs/review/final-pass/edit-cache-measurement.json",
    title: "Salary save and invalidation",
    status: "Current after-only isolated write, original amount restored",
    format: "json",
  },
  "ui-runtime": {
    file: "docs/review/final-pass/ui-runtime.json",
    title: "Feedback and Presentation asset evidence",
    status: "Current local production observation; see sample limits",
    format: "json",
  },
  requirements: {
    file: "REQUIREMENTS.md",
    title: "One-page requirements",
    status: "Current working scope",
    format: "markdown",
  },
  engineering: {
    file: "docs/ENGINEERING.md",
    title: "Architecture and tradeoffs",
    status: "Current canonical notes",
    format: "markdown",
  },
  "ai-record": {
    file: "docs/AI_COLLABORATION.md",
    title: "AI collaboration record",
    status: "Recorded sequence, including historical entries",
    format: "markdown",
  },
  delivery: {
    file: "docs/DELIVERY.md",
    title: "Delivery and recording guidance",
    status: "Published baseline and remaining review gates are separate",
    format: "markdown",
  },
  "current-verification": {
    file: "docs/review/final-pass/verification.json",
    title: "Final focused-pass verification",
    status: "Current local evidence; check its recorded status and source",
    format: "json",
  },
  "idle-before": {
    file: "docs/review/final-pass/chart-idle-before.json",
    title: "Chart replay before correction",
    status: "Historical baseline for this pass",
    format: "json",
  },
  "idle-after": {
    file: "docs/review/final-pass/chart-idle-after.json",
    title: "Chart lifecycle after correction",
    status: "Current local evidence when recorded",
    format: "json",
  },
  "performance-before": {
    file: "docs/review/final-pass/performance-before.json",
    title: "Navigation before this pass",
    status: "Historical baseline, n=3 per journey",
    format: "json",
  },
  "performance-after": {
    file: "docs/review/final-pass/performance-after.json",
    title: "Navigation after this pass",
    status: "Current local evidence when recorded",
    format: "json",
  },
  "previous-review": {
    file: "docs/FIDELITY_PERFORMANCE.md",
    title: "Prior fidelity/performance review",
    status: "Historical: source 406b4e2, not the current pass",
    format: "markdown",
  },
} as const;
export const SOURCES = {
  money: {
    file: "src/domain/money.ts",
    title: "Exact monetary parsing",
    focus: "const amount =",
  },
  queries: {
    file: "src/server/employees/queries.ts",
    title: "Bounded employee query",
    focus: ".limit(f.pageSize)",
  },
  salary: {
    file: "src/server/employees/salary-repository.ts",
    title: "Version-checked persistence",
    focus: ".where(and(",
  },
  chart: {
    file: "src/components/dashboard-plot.tsx",
    title: "Persistent chart lifecycle",
    focus: "Instance lifetime follows",
  },
  cache: {
    file: "src/lib/read-cache.ts",
    title: "Session-scoped read cache",
    focus: "async load(",
  },
  freshness: {
    file: "src/components/use-remote.ts",
    title: "Visible-view freshness",
    focus: "const revalidate =",
  },
  schema: {
    file: "src/server/db/schema.ts",
    title: "Relational schema and constraints",
    focus: "positive_bounded_salary",
  },
} as const;
export function artifactKey(slug: string) {
  return Object.hasOwn(ARTIFACTS, slug)
    ? (slug as keyof typeof ARTIFACTS)
    : undefined;
}
export function sourceKey(slug: string) {
  return Object.hasOwn(SOURCES, slug)
    ? (slug as keyof typeof SOURCES)
    : undefined;
}
