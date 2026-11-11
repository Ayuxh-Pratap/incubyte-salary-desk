"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Info, RefreshCw, ArrowRight } from "lucide-react";
import type { Filters } from "@/domain/filters";
import {
  METRICS,
  filterQuery,
  drilldownFilters,
  type Metric,
  type Analysis,
} from "@/domain/analysis";
import type { Catalog } from "@/domain/employee";
import { formatMoney, formatRational, type Summary } from "@/domain/money";
import { useRemote } from "./use-remote";
import { FiltersForm } from "./filters-form";
import { MetricExplanation } from "./metric-explanation";
import { Button } from "./ui/button";
function metricValue(key: Metric, summary: Summary, currency: string) {
  if (key === "count") return summary.count.toLocaleString("en-US");
  if (key === "median")
    return summary.median ? formatRational(summary.median, currency) : "—";
  if (summary.count === 0) return "—";
  return summary[key] === null ? "—" : formatMoney(summary[key], currency);
}
export function OverviewScreen({ filters }: { filters: Filters }) {
  const query = filterQuery(filters),
    data = useRemote<Analysis>("/api/analysis?" + query),
    catalog = useRemote<Catalog>("/api/catalog");
  const [metric, setMetric] = useState<Metric | null>(null);
  const groupName = (key: string) =>
    filters.groupBy === "country"
      ? catalog.data?.countries.find((c) => c.code === key)?.name
      : filters.groupBy === "department"
        ? catalog.data?.departments.find((c) => c.id === key)?.name
        : catalog.data?.roles.find((c) => c.id === key)?.name;
  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-meta font-medium uppercase tracking-wider text-muted-foreground">
            Compensation intelligence
          </p>
          <h1 className="mt-2 text-title font-semibold tracking-tight">
            Salary overview
          </h1>
          <p className="mt-2 text-foreground-2">
            Understand a defined population, in one currency at a time.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={data.reload}
            disabled={data.loading}
          >
            <RefreshCw />
            Refresh
          </Button>
          <Link
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border bg-card px-3 font-medium shadow-button"
            href={"/employees?" + query}
          >
            View employees
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
      <FiltersForm
        key={query}
        filters={filters}
        catalog={catalog.data}
        overview
      />
      {catalog.error && (
        <p role="alert" className="mt-3 text-destructive">
          Filter options could not load. {catalog.error}{" "}
          <button className="min-h-11 underline" onClick={catalog.reload}>
            Retry options
          </button>
        </p>
      )}
      {data.loading ? (
        <div
          role="status"
          className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
        >
          <span className="sr-only">Calculating full population</span>
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="h-32 animate-pulse rounded-xl border bg-card"
            />
          ))}
        </div>
      ) : data.error ? (
        <section role="alert" className="mt-5 rounded-xl border bg-card p-6">
          <h2 className="font-semibold">
            We couldn’t calculate this population
          </h2>
          <p className="mt-2 text-muted-foreground">{data.error}</p>
          <Button className="mt-4" variant="outline" onClick={data.reload}>
            <RefreshCw />
            Try again
          </Button>
        </section>
      ) : (
        data.data && (
          <>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-meta text-muted-foreground">
              <span>
                {data.data.summary.count.toLocaleString("en-US")}{" "}
                {data.data.summary.count === 1 ? "employee" : "employees"} ·{" "}
                {data.data.currency} · Annual base salary
              </span>
              <span>All matching records, across every page</span>
            </div>
            <section
              aria-label="Salary metrics"
              className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
            >
              {(Object.keys(METRICS) as Metric[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setMetric(key)}
                  className="min-w-0 rounded-xl border bg-card p-4 text-left shadow-sm hover:border-ring"
                  aria-label={"Explain " + METRICS[key].label}
                >
                  <span className="flex items-start justify-between gap-2 text-meta font-medium text-muted-foreground">
                    {METRICS[key].label}
                    <ArrowUpRight className="size-3.5 shrink-0" />
                  </span>
                  <span className="mt-4 block break-words text-heading font-semibold tracking-tight tabular-nums">
                    {metricValue(key, data.data!.summary, data.data!.currency)}
                  </span>
                  <span className="mt-3 block text-meta text-muted-foreground">
                    Explain this number
                  </span>
                </button>
              ))}
            </section>
            {data.data.summary.count === 0 ? (
              <section className="mt-5 rounded-xl border bg-card p-8 text-center">
                <h2 className="text-heading font-medium">
                  No matching salaries
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Broaden the filters to create a population. Missing salary
                  metrics are shown as a dash, not zero.
                </p>
              </section>
            ) : (
              <section
                aria-label="Grouped salary analysis"
                className="mt-5 overflow-hidden rounded-xl border bg-card"
              >
                <header className="border-b p-4">
                  <h2 className="text-heading font-medium">
                    By {filters.groupBy}
                  </h2>
                  <p className="mt-1 text-meta text-muted-foreground">
                    {data.data.currency} / year · Select a group to inspect the
                    same population in the directory.
                  </p>
                </header>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-left tabular-nums">
                    <thead className="bg-muted/50 text-meta text-muted-foreground">
                      <tr>
                        {[
                          "Group",
                          "Employees",
                          "Annual base total",
                          "Median annual base",
                          "Lowest – highest",
                          "",
                        ].map((h, i) => (
                          <th
                            key={i}
                            className="px-4 py-3 font-medium"
                            scope="col"
                          >
                            {h || (
                              <span className="sr-only">Explore group</span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.data.groups.map((group) => (
                        <tr key={group.key} className="hover:bg-muted/50">
                          <td className="px-4 py-4 font-medium">
                            {groupName(group.key) || group.key}
                            {group.summary.count < 5 && (
                              <span className="mt-1 block text-meta font-normal text-muted-foreground">
                                Small sample
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            {group.summary.count.toLocaleString("en-US")}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {formatMoney(
                              group.summary.total,
                              data.data!.currency,
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {group.summary.median
                              ? formatRational(
                                  group.summary.median,
                                  data.data!.currency,
                                )
                              : "—"}
                          </td>
                          <td className="px-4 py-4 text-meta whitespace-nowrap text-foreground-2">
                            {group.summary.min &&
                              formatMoney(
                                group.summary.min,
                                data.data!.currency,
                              )}
                            <br />
                            to{" "}
                            {group.summary.max &&
                              formatMoney(
                                group.summary.max,
                                data.data!.currency,
                              )}
                          </td>
                          <td className="p-3">
                            <Link
                              aria-label={
                                "Explore " + (groupName(group.key) || group.key)
                              }
                              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-muted"
                              href={
                                "/employees?" +
                                filterQuery(
                                  drilldownFilters(
                                    filters,
                                    filters.groupBy,
                                    group.key,
                                  ),
                                )
                              }
                            >
                              <ArrowUpRight className="size-4" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <ul className="divide-y md:hidden">
                  {data.data.groups.map((group) => (
                    <li key={group.key}>
                      <Link
                        className="block p-4"
                        href={
                          "/employees?" +
                          filterQuery(
                            drilldownFilters(
                              filters,
                              filters.groupBy,
                              group.key,
                            ),
                          )
                        }
                      >
                        <div className="flex justify-between gap-3 font-medium">
                          <span>{groupName(group.key) || group.key}</span>
                          <ArrowUpRight className="size-4 shrink-0" />
                        </div>
                        <p className="mt-1 text-meta text-muted-foreground">
                          {group.summary.count}{" "}
                          {group.summary.count === 1 ? "employee" : "employees"}
                          {group.summary.count < 5 ? " · Small sample" : ""}
                        </p>
                        <dl className="mt-3 grid grid-cols-2 gap-3">
                          <div>
                            <dt className="text-meta text-muted-foreground">
                              Annual base total
                            </dt>
                            <dd className="mt-1 break-words font-medium tabular-nums">
                              {formatMoney(
                                group.summary.total,
                                data.data!.currency,
                              )}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-meta text-muted-foreground">
                              Median annual base
                            </dt>
                            <dd className="mt-1 break-words font-medium tabular-nums">
                              {group.summary.median
                                ? formatRational(
                                    group.summary.median,
                                    data.data!.currency,
                                  )
                                : "—"}
                            </dd>
                          </div>
                        </dl>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <div className="mt-4 flex items-start gap-2 text-meta text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0" />
              <p>
                Current base salary only. No FX conversion. Small samples are
                descriptive and unstable. These figures do not establish pay
                fairness or explain pay differences.
              </p>
            </div>
            <MetricExplanation
              metric={metric}
              onClose={() => setMetric(null)}
              analysis={data.data}
              catalog={catalog.data}
            />
          </>
        )
      )}
    </>
  );
}
