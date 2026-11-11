import { sql, type SQL } from "drizzle-orm";
import { employees } from "../db/schema";
import { employeeWhere, type QueryDb } from "../employees/queries";
import type { Filters } from "../../domain/filters";
import type { Analysis } from "../../domain/analysis";
import type { Summary } from "../../domain/money";
export type DbSummary = {
  group_key: string;
  count: number;
  total: string;
  min: string | null;
  max: string | null;
  median_numerator: string | null;
  median_denominator: number;
};
export function summaryQuery(filters: Filters, grouped = false): SQL {
  if (!filters.currency) throw new Error("A single currency is required.");
  const group = {
    country: employees.country,
    department: employees.department,
    role: employees.role,
  }[filters.groupBy];
  const partition = grouped ? sql`partition by ${group}` : sql``;
  const where = employeeWhere(filters);
  return sql`
 with ranked as (
  select ${employees.salaryMinor} as amount, ${grouped ? sql`${group}` : sql`'all'`} as group_key,
   row_number() over (${partition} order by ${employees.salaryMinor},${employees.id}) as rn,
   count(*) over (${partition}) as population
  from ${employees} where ${where}
 )
 select ${grouped ? sql`group_key,` : sql`'all' as group_key,`} count(*)::integer as count,
  coalesce(sum(amount::numeric),0)::text as total, min(amount)::text as min, max(amount)::text as max,
  (sum(amount::numeric) filter (where rn in ((population+1)/2,(population+2)/2)))::text as median_numerator,
  (count(*) filter (where rn in ((population+1)/2,(population+2)/2)))::integer as median_denominator
 from ranked ${grouped ? sql`group by group_key order by count desc,group_key` : sql``}
 `;
}
export function summary(row: DbSummary): Summary {
  return {
    count: row.count,
    total: row.total,
    min: row.min,
    max: row.max,
    median:
      row.median_numerator === null
        ? null
        : {
            numerator: row.median_numerator,
            denominator: row.median_denominator === 1 ? 1 : 2,
          },
  };
}
export async function salaryAnalysis(
  db: QueryDb,
  filters: Filters,
): Promise<Analysis> {
  if (!filters.currency) throw new Error("A single currency is required.");
  const result = await db.execute<DbSummary & { grouped: boolean }>(
    sql`select false as grouped, t.* from (${summaryQuery(filters)}) t union all select true as grouped,t.* from (${summaryQuery(filters, true)}) t`,
  );
  const overall = result.rows.find((r) => !r.grouped)!;
  const groups = result.rows.filter((r) => r.grouped);
  return {
    currency: filters.currency,
    period: "annual",
    summary: summary(overall),
    groups: groups.map((row) => ({
      key: row.group_key,
      summary: summary(row),
    })),
    filters,
  };
}
