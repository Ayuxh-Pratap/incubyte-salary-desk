import { sql } from "drizzle-orm";
import { employees as e } from "../db/schema";
import type { QueryDb } from "../employees/queries";
import { summaryQuery, summary, type DbSummary } from "../analysis/queries";
import { analysisFilters } from "../../domain/analysis";
import type { Dashboard } from "../../domain/dashboard";
export async function dashboardData(
  db: QueryDb,
  currency: string,
): Promise<Dashboard> {
  const filters = analysisFilters({ currency, groupBy: "department" });
  // All chart populations and exact financial values share one PostgreSQL statement snapshot.
  const result = await db.execute<{
    kind: "headcount" | "overall" | "group" | "bucket";
    data: Record<string, unknown>;
  }>(sql`
 select 'headcount' as kind,jsonb_build_object('dimension',case when grouping(${e.country})=0 then 'country' when grouping(${e.department})=0 then 'department' else 'currency' end,'key',coalesce(${e.country},${e.department},${e.currency}),'count',count(*)::integer) as data
 from ${e} group by grouping sets ((${e.country}),(${e.department}),(${e.currency}))
 union all select 'overall',to_jsonb(t) from (${summaryQuery(filters)}) t
 union all select 'group',to_jsonb(t) from (${summaryQuery(filters, true)}) t
 union all select 'bucket',jsonb_build_object('lower',b.lower::text,'upper',b.upper::text,'count',count(p.id)::integer)
 from (
   select (lo+floor(i*width/least(8,width)))::numeric as lower,(lo+floor((i+1)*width/least(8,width))-1)::numeric as upper
   from (select min(salary_minor)::numeric as lo, max(salary_minor)::numeric-min(salary_minor)::numeric+1 as width from employees where currency=${currency}) bounds
   cross join generate_series(0,7) i where lo is not null and i<least(8,width)
 ) b left join employees p on p.currency=${currency} and p.salary_minor>=b.lower and p.salary_minor<=b.upper
 group by b.lower,b.upper
 `);
  const heads = result.rows
    .filter((r) => r.kind === "headcount")
    .map(
      (r) =>
        r.data as unknown as { dimension: string; key: string; count: number },
    );
  const groups = (dimension: string) =>
    heads
      .filter((r) => r.dimension === dimension)
      .map(({ key, count }) => ({ key, count }))
      .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
  const countries = groups("country");
  const overall = result.rows.find((r) => r.kind === "overall")!
    .data as unknown as DbSummary;
  return {
    population: {
      headcount: countries.reduce((n, g) => n + g.count, 0),
      countries,
      departments: groups("department"),
      currencies: groups("currency"),
    },
    compensation: {
      currency,
      period: "annual",
      filters,
      summary: summary(overall),
      groups: result.rows
        .filter((r) => r.kind === "group")
        .map((r) => r.data as unknown as DbSummary)
        .map((row) => ({ key: row.group_key, summary: summary(row) }))
        .sort(
          (a, b) =>
            b.summary.count - a.summary.count || a.key.localeCompare(b.key),
        ),
    },
    distribution: result.rows
      .filter((r) => r.kind === "bucket")
      .map((r) => r.data as unknown as Dashboard["distribution"][number])
      .sort((a, b) => (BigInt(a.lower) < BigInt(b.lower) ? -1 : 1)),
  };
}
