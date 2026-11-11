import Link from "next/link";
import { Globe, Building2, ArrowUpRight } from "lucide-react";
import type { Catalog } from "@/domain/employee";
import { barPercent, type Dashboard } from "@/domain/dashboard";
import { ChartSkeleton } from "./skeletons";
export function DashboardPopulation({
  population: global,
  catalog,
}: {
  population?: Dashboard["population"];
  catalog?: Catalog;
}) {
  if (!global)
    return (
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  const countries = global.countries,
    departments = global.departments;
  const countryName = (key: string) =>
    catalog?.countries.find((c) => c.code === key)?.name || key;
  const departmentName = (key: string) =>
    catalog?.departments.find((d) => d.id === key)?.name || key;
  return (
    <div className="mt-5 grid gap-5 xl:grid-cols-2">
      <section className="rounded-xl border bg-card p-5 shadow-panel">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-heading font-medium">People by country</h2>
            <p className="mt-1 text-meta text-muted-foreground">
              Employment country · All{" "}
              {global.headcount.toLocaleString("en-US")} employees
            </p>
          </div>
          <Globe className="size-4 text-muted-foreground" aria-hidden />
        </div>
        {countries.length ? (
          <ul className="space-y-2">
            {countries.map((group) => (
              <li key={group.key}>
                <Link
                  href={"/employees?country=" + group.key}
                  aria-label={"Explore country " + countryName(group.key)}
                  className="block rounded-lg px-1 py-2 hover:bg-row-hover"
                >
                  <span className="flex items-start justify-between gap-4 text-ui">
                    <span>{countryName(group.key)}</span>
                    <span className="shrink-0 tabular-nums">
                      {group.count.toLocaleString("en-US")}{" "}
                      <span className="text-meta text-muted-foreground">
                        employees
                      </span>
                    </span>
                  </span>
                  <span
                    className="mt-2 block h-1.5 rounded-full bg-inset"
                    aria-hidden
                  >
                    <span
                      className="block h-full rounded-full bg-foreground/35"
                      style={{
                        width:
                          barPercent(
                            BigInt(group.count),
                            BigInt(global.headcount),
                          ) + "%",
                      }}
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-8 text-muted-foreground">
            No employees in the dataset.
          </p>
        )}
      </section>
      <section className="rounded-xl border bg-card p-5 shadow-panel">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-heading font-medium">People by department</h2>
            <p className="mt-1 text-meta text-muted-foreground">
              Current headcount · All pay currencies
            </p>
          </div>
          <Building2 className="size-4 text-muted-foreground" aria-hidden />
        </div>
        {departments.length ? (
          <ul className="space-y-2">
            {departments.map((group) => (
              <li key={group.key}>
                <Link
                  href={"/employees?department=" + group.key}
                  aria-label={"Explore department " + departmentName(group.key)}
                  className="flex min-h-11 items-center justify-between gap-4 rounded-lg px-1 py-2 hover:bg-row-hover"
                >
                  <span>{departmentName(group.key)}</span>
                  <span className="flex shrink-0 items-center gap-4">
                    <span
                      className="hidden h-1.5 w-28 overflow-hidden rounded-full bg-inset sm:block"
                      aria-hidden
                    >
                      <span
                        className="block h-full rounded-full bg-foreground/35"
                        style={{
                          width:
                            barPercent(
                              BigInt(group.count),
                              BigInt(global.headcount),
                            ) + "%",
                        }}
                      />
                    </span>
                    <span className="w-12 text-right tabular-nums">
                      {group.count.toLocaleString("en-US")}
                    </span>
                    <ArrowUpRight
                      className="size-3.5 text-muted-foreground"
                      aria-hidden
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-8 text-muted-foreground">No departments to show.</p>
        )}
      </section>
    </div>
  );
}
