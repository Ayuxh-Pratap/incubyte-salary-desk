import { sql } from "drizzle-orm";
import { employees } from "../db/schema";
import type { QueryDb } from "../employees/queries";
import { salaryAnalysis } from "../analysis/queries";
import { analysisFilters } from "../../domain/analysis";
import type { Dashboard } from "../../domain/dashboard";
export async function dashboardData(
  db: QueryDb,
  currency: string,
): Promise<Dashboard> {
  const filters = analysisFilters({ currency, groupBy: "department" });
  const result = await db.execute<{
    dimension: "country" | "department" | "currency";
    key: string;
    count: number;
  }>(sql`
 select case when grouping(${employees.country})=0 then 'country'
   when grouping(${employees.department})=0 then 'department' else 'currency' end as dimension,
   coalesce(${employees.country},${employees.department},${employees.currency}) as key,
   count(*)::integer as count
 from ${employees}
 group by grouping sets ((${employees.country}),(${employees.department}),(${employees.currency}))
 order by dimension,count desc,key
 `);
  const groups = (dimension: "country" | "department" | "currency") =>
    result.rows
      .filter((r) => r.dimension === dimension)
      .map(({ key, count }) => ({ key, count }));
  const countries = groups("country");
  return {
    population: {
      headcount: countries.reduce((n, g) => n + g.count, 0),
      countries,
      departments: groups("department"),
      currencies: groups("currency"),
    },
    compensation: await salaryAnalysis(db, filters),
  };
}
