import { config } from "dotenv";
import { performance } from "node:perf_hooks";
import os from "node:os";
import fs from "node:fs";
import { PgDialect } from "drizzle-orm/pg-core";
import { database } from "../src/server/db/connection";
import { parseFilters } from "../src/domain/filters";
import { listEmployees } from "../src/server/employees/queries";
import { salaryAnalysis, summaryQuery } from "../src/server/analysis/queries";
config({ path: ".env.local", quiet: true });
const { pool, db } = await database();
try {
  await pool.query("analyze employees");
  const version = await pool.query("show server_version");
  const population = await pool.query(
    "select count(*)::integer as count from employees",
  );
  const scenarios = [
    {
      name: "name_page_25",
      run: () =>
        db.transaction((tx) => listEmployees(tx, parseFilters({})), {
          isolationLevel: "repeatable read",
          accessMode: "read only",
        }),
    },
    {
      name: "usd_salary_page_25",
      run: () =>
        db.transaction(
          (tx) =>
            listEmployees(
              tx,
              parseFilters({ currency: "USD", sort: "salary-desc" }),
            ),
          { isolationLevel: "repeatable read", accessMode: "read only" },
        ),
    },
    {
      name: "country_department_page",
      run: () =>
        db.transaction(
          (tx) =>
            listEmployees(
              tx,
              parseFilters({ country: "IN", department: "engineering" }),
            ),
          { isolationLevel: "repeatable read", accessMode: "read only" },
        ),
    },
    {
      name: "unicode_name_search",
      run: () =>
        db.transaction((tx) => listEmployees(tx, parseFilters({ q: "José" })), {
          isolationLevel: "repeatable read",
          accessMode: "read only",
        }),
    },
    {
      name: "usd_full_population_analysis",
      run: () =>
        db.transaction(
          (tx) =>
            salaryAnalysis(
              tx,
              parseFilters({ currency: "USD", groupBy: "department" }),
            ),
          { isolationLevel: "repeatable read", accessMode: "read only" },
        ),
    },
  ];
  const observations = [];
  for (const scenario of scenarios) {
    const samples = [];
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      await scenario.run();
      samples.push(Math.round((performance.now() - start) * 100) / 100);
    }
    const sorted = [...samples].sort((a, b) => a - b);
    observations.push({
      scenario: scenario.name,
      samplesMs: samples,
      medianMs: sorted[2],
      maxMs: sorted[4],
    });
    console.log(
      scenario.name + ": median " + sorted[2] + " ms (five WAN samples)",
    );
  }
  const dialect = new PgDialect(),
    compiled = dialect.sqlToQuery(
      summaryQuery(parseFilters({ currency: "USD" })),
    );
  const plans = [];
  for (const item of [
    {
      name: "currency_salary_page",
      sql: "select id from employees where currency=$1 order by salary_minor,id limit 25",
      params: ["USD"],
    },
    {
      name: "name_search",
      sql: "select id from employees where name ilike $1 order by name,id limit 25",
      params: ["%José%"],
    },
    { name: "filtered_analysis", sql: compiled.sql, params: compiled.params },
  ]) {
    const result = await pool.query(
      "explain (analyze,buffers,format json) " + item.sql,
      item.params,
    );
    plans.push({ scenario: item.name, plan: result.rows[0]["QUERY PLAN"][0] });
  }
  const record = {
    recordedAt: new Date().toISOString(),
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      cpu: os.cpus()[0].model,
      databaseVersion: version.rows[0].server_version,
      region: "aws-us-east-2",
      provider: "Neon temporary project, scale-to-zero after five minutes",
      dataset: population.rows[0].count,
      connection:
        "TLS verified; pooled endpoint; max three connections; client in India",
      method:
        "Five sequential samples per scenario after ANALYZE. Transactions include their round trips. New CLI pool; Neon may already be warm. Not an HTTP benchmark and not a cold-start claim.",
    },
    observations,
    plans,
  };
  fs.writeFileSync(
    "docs/performance.json",
    JSON.stringify(record, null, 2) + "\n",
  );
  console.log(
    "Recorded actual observations and EXPLAIN plans in docs/performance.json.",
  );
} finally {
  await pool.end();
}
