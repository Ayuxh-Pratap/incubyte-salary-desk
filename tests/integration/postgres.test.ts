import { beforeAll, afterAll, it, expect } from "vitest";
import { Pool } from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq, sql } from "drizzle-orm";
import * as schema from "../../src/server/db/schema";
import { seedDatabase } from "../../src/server/db/seed";
import { syntheticEmployees } from "../../src/domain/seed";
import { parseFilters } from "../../src/domain/filters";
import { summarize } from "../../src/domain/money";
import { listEmployees, getEmployee } from "../../src/server/employees/queries";
import { salaryAnalysis } from "../../src/server/analysis/queries";
import { salaryRepository } from "../../src/server/employees/salary-repository";
import { saveSalary } from "../../src/domain/salary-update";
import { isolatedTestUrl, verifyTestMarker } from "../../scripts/test-database";
let pool: Pool, db: NodePgDatabase<typeof schema>;
beforeAll(async () => {
  pool = new Pool({
    connectionString: isolatedTestUrl(),
    max: 3,
    application_name: "salary-desk-integration",
  });
  await verifyTestMarker(pool);
  db = drizzle(pool, { schema });
  await seedDatabase(db);
});
afterAll(async () => {
  if (pool) await pool.end();
});
class Rollback extends Error {}
async function rollback(
  work: (tx: NodePgDatabase<typeof schema>) => Promise<void>,
) {
  try {
    await db.transaction(async (tx) => {
      await work(tx as unknown as typeof db);
      throw new Rollback();
    });
  } catch (error) {
    if (!(error instanceof Rollback)) throw error;
  }
}
it("seeds exactly 10000 and repeated seeding preserves salary edits and version", async () => {
  const count = await db.execute<{ count: string }>(
    sql`select count(*)::text as count from employees`,
  );
  expect(count.rows[0].count).toBe("10000");
  await rollback(async (tx) => {
    await tx
      .update(schema.employees)
      .set({ salaryMinor: 12345n, version: 7 })
      .where(eq(schema.employees.id, 1));
    expect(await seedDatabase(tx)).toBe(10000);
    expect(await getEmployee(tx, 1)).toMatchObject({
      salaryMinor: "12345",
      version: 7,
    });
  });
});
it("uses bounded stable pages, real filters and literal search wildcards", async () => {
  const f = parseFilters({ currency: "USD", sort: "salary-desc" });
  const first = await listEmployees(db, f),
    second = await listEmployees(db, { ...f, page: 2 });
  expect(first.employees).toHaveLength(25);
  expect(first.total).toBeGreaterThan(25);
  expect(
    new Set([...first.employees, ...second.employees].map((e) => e.id)).size,
  ).toBe(50);
  expect((await listEmployees(db, f)).employees.map((e) => e.id)).toEqual(
    first.employees.map((e) => e.id),
  );
  expect((await listEmployees(db, parseFilters({ q: "%_" }))).total).toBe(0);
  expect(
    (await listEmployees(db, parseFilters({ q: "ACME-00001" }))).employees[0]
      .id,
  ).toBe(1);
  expect(
    (await listEmployees(db, parseFilters({ q: "José" }))).total,
  ).toBeGreaterThan(0);
});
it("aggregates every filtered record and matches exact in-memory reference including group medians", async () => {
  const records = syntheticEmployees();
  for (const currency of ["USD", "JPY", "KWD"]) {
    const f = parseFilters({ currency, groupBy: "department", pageSize: "25" });
    const result = await salaryAnalysis(db, f);
    const expected = records.filter((e) => e.currency === currency);
    expect(result.summary).toEqual(
      summarize(expected.map((e) => e.salaryMinor.toString())),
    );
    expect(result.summary.count).toBeGreaterThan(25);
    for (const group of result.groups)
      expect(group.summary).toEqual(
        summarize(
          expected
            .filter((e) => e.department === group.key)
            .map((e) => e.salaryMinor.toString()),
        ),
      );
  }
});
it("handles an empty population and never accepts mixed-currency analysis", async () => {
  const result = await salaryAnalysis(
    db,
    parseFilters({ currency: "USD", q: "no-such-synthetic-person" }),
  );
  expect(result.summary).toEqual(summarize([]));
  expect(result.groups).toEqual([]);
  await expect(salaryAnalysis(db, parseFilters({}))).rejects.toThrow(
    "single currency",
  );
});
it("enforces database constraints and atomic version updates without losing the winning value", async () => {
  await rollback(async (tx) => {
    for (const change of [
      { salaryMinor: 0n },
      { salaryMinor: -1n },
      { period: "monthly" },
      { version: 0 },
      { currency: "XXX" },
    ])
      await expect(
        tx.transaction(async (nested) => {
          await nested
            .update(schema.employees)
            .set(change)
            .where(eq(schema.employees.id, 1));
        }),
      ).rejects.toThrow();
    const original = (await getEmployee(tx, 1))!;
    const repo = salaryRepository(tx);
    const mutation = {
      amount: "12345.67",
      currency: original.currency,
      period: "annual",
      version: original.version,
    };
    const winner = await saveSalary(repo, 1, mutation);
    expect(winner.version).toBe(original.version + 1);
    await expect(saveSalary(repo, 1, mutation)).rejects.toMatchObject({
      code: "conflict",
    });
    expect(await repo.compareAndSwap(1, original.version, 999n)).toBeNull();
    expect((await getEmployee(tx, 1))?.salaryMinor).toBe(winner.salaryMinor);
  });
});
