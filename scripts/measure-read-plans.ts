import { config } from "dotenv";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { isolatedTestUrl, verifyTestMarker } from "./test-database";
import * as schema from "../src/server/db/schema";
import { parseFilters } from "../src/domain/filters";
import { listEmployees, catalog } from "../src/server/employees/queries";
import { salaryAnalysis } from "../src/server/analysis/queries";
import { dashboardData } from "../src/server/dashboard/queries";
config({ path: ".env.local", quiet: true });
const pool = new Pool({ connectionString: isolatedTestUrl(), max: 1 });
const start = performance.now();
const client = await pool.connect();
const connectionMs = performance.now() - start;
client.release();
await verifyTestMarker(pool);
let statements: { query: string; params: unknown[] }[] = [];
const db = drizzle(pool, {
  schema,
  logger: {
    logQuery(query, params) {
      statements.push({ query, params });
    },
  },
});
try {
  const observations = [];
  for (const [name, run] of [
    [
      "employee_page",
      () => listEmployees(db, parseFilters({ currency: "USD", page: 2 })),
    ],
    [
      "full_analysis",
      () => salaryAnalysis(db, parseFilters({ currency: "USD" })),
    ],
    ["dashboard_series", () => dashboardData(db, "USD")],
    ["lookup_catalog", () => catalog(db)],
  ] as const) {
    statements = [];
    const samples = [];
    for (let i = 0; i < 5; i++) {
      const at = performance.now();
      await run();
      samples.push(Math.round((performance.now() - at) * 100) / 100);
    }
    const target = statements[0],
      plan = (
        await pool.query(
          "explain (analyze,buffers,format json) " + target.query,
          target.params,
        )
      ).rows[0]["QUERY PLAN"][0];
    const nodes: Array<Record<string, unknown>> = [];
    function walk(p: Record<string, unknown>) {
      nodes.push({
        node: p["Node Type"],
        index: p["Index Name"],
        rows: p["Actual Rows"],
        loops: p["Actual Loops"],
      });
      for (const child of (p.Plans as Record<string, unknown>[]) || [])
        walk(child);
    }
    walk(plan.Plan);
    observations.push({
      scenario: name,
      statementsPerRead: statements.length / 5,
      samplesIncludingWanMs: samples,
      planningMs: plan["Planning Time"],
      executionMs: plan["Execution Time"],
      nodes,
    });
    console.log(
      name +
        ": " +
        plan["Execution Time"] +
        "ms server execution; " +
        statements.length / 5 +
        " statement/read",
    );
  }
  fs.writeFileSync(
    (process.argv[2] || "docs/review") + "/read-query-plans.json",
    JSON.stringify(
      {
        source: execFileSync("git", ["rev-parse", "HEAD"], {
          encoding: "utf8",
        }).trim(),
        recordedAt: new Date().toISOString(),
        environment:
          "Windows Node 24, India client, isolated Neon US East test database, 10000 synthetic employees; pooled max one",
        connectionMs: Math.round(connectionMs * 100) / 100,
        method:
          "One new-pool connection sample (not guaranteed Neon cold), five sequential direct read samples incl WAN, then one EXPLAIN ANALYZE per scenario; environment guard verified once outside each scenario; no index/schema/data changes",
        observations,
      },
      null,
      2,
    ) + "\n",
  );
} finally {
  await pool.end();
}
