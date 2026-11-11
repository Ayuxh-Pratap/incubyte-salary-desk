import type { NextConfig } from "next";
const config: NextConfig = {
  outputFileTracingIncludes: {
    "/presentation/**": [
      "./docs/PRESENTATION.md",
      "./README.md",
      "./docs/LOCAL_SETUP.md",
      "./docs/INTERVIEW.md",
      "./docs/FINAL_PASS.md",
      "./docs/review/final-pass/read-query-plans.json",
      "./docs/review/final-pass/edit-cache-measurement.json",
      "./docs/review/final-pass/ui-runtime.json",
      "./docs/presentation-diagrams.json",
      "./REQUIREMENTS.md",
      "./docs/ENGINEERING.md",
      "./docs/AI_COLLABORATION.md",
      "./docs/DELIVERY.md",
      "./docs/FIDELITY_PERFORMANCE.md",
      "./docs/release-verification.json",
      "./docs/review/final-pass/chart-idle-before.json",
      "./docs/review/final-pass/chart-idle-after.json",
      "./docs/review/final-pass/performance-before.json",
      "./docs/review/final-pass/performance-after.json",
      "./src/domain/money.ts",
      "./src/server/employees/queries.ts",
      "./src/server/employees/salary-repository.ts",
      "./src/components/dashboard-plot.tsx",
      "./src/lib/read-cache.ts",
      "./src/components/use-remote.ts",
      "./src/server/db/schema.ts",
    ],
  },
  poweredByHeader: false,
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};
export default config;
