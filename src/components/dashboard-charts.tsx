"use client";
import { useState } from "react";
import { Plot, seriesTokens } from "./dashboard-plot";
import Link from "next/link";
import { Skeleton } from "./skeletons";
import { useRouter } from "next/navigation";
import type { Dashboard } from "@/domain/dashboard";
import type { Catalog } from "@/domain/employee";
import { formatMoney } from "@/domain/money";
export function PopulationCharts({
  population,
  catalog,
}: {
  population: Dashboard["population"];
  catalog?: Catalog;
}) {
  const router = useRouter();
  const countryName = (key: string) =>
      catalog?.countries.find((c) => c.code === key)?.name || key,
    departmentName = (key: string) =>
      catalog?.departments.find((d) => d.id === key)?.name || key;
  return (
    <div className="mt-5 grid min-w-0 gap-5 xl:grid-cols-2">
      {[
        {
          title: "Headcount by country",
          groups: population.countries,
          name: countryName,
          filter: "country",
          type: "doughnut" as const,
        },
        {
          title: "Headcount by department",
          groups: population.departments,
          name: departmentName,
          filter: "department",
          type: "bar" as const,
        },
      ].map(({ title, groups, name, filter, type }) => (
        <section
          key={filter}
          className="min-w-0 rounded-xl bg-card p-5 shadow-panel"
          aria-label={title}
        >
          <h2 className="text-heading font-medium">{title}</h2>
          <p className="mt-1 mb-5 text-meta text-foreground-2">
            All {population.headcount.toLocaleString("en-US")} employees · Every
            pay currency
          </p>
          <div
            className={
              type === "doughnut"
                ? "grid grid-cols-[minmax(0,1fr)_minmax(122px,0.9fr)] items-center gap-4"
                : "min-w-0"
            }
          >
            <Plot
              type={type}
              horizontal={type === "bar"}
              labels={groups.map((g) => name(g.key))}
              values={groups.map((g) => g.count)}
              label={
                title + "; exact headcounts are provided in accompanying text"
              }
              tooltip={(i) =>
                groups[i].count.toLocaleString("en-US") +
                " employees · " +
                ((groups[i].count / population.headcount) * 100).toFixed(1) +
                "% of organization"
              }
              onPick={(i) =>
                router.push(
                  "/employees?" +
                    filter +
                    "=" +
                    encodeURIComponent(groups[i].key),
                )
              }
            />
            {type === "doughnut" ? (
              <ul
                aria-label="Country legend"
                className="text-meta text-foreground-2"
              >
                {groups.map((g, i) => (
                  <li key={g.key}>
                    <Link
                      title={name(g.key)}
                      aria-label={"Explore country " + name(g.key)}
                      href={"/employees?country=" + encodeURIComponent(g.key)}
                      className="flex min-h-10 min-w-0 items-center gap-2 rounded-md px-1 transition-colors hover:bg-row-hover hover:text-foreground"
                    >
                      <span
                        aria-hidden
                        className="size-2 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            "var(" +
                            seriesTokens[i % seriesTokens.length] +
                            ")",
                        }}
                      />
                      <span className="min-w-0">{name(g.key)}</span>
                      <span className="ml-auto shrink-0 tabular-nums">
                        {g.count.toLocaleString("en-US")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="sr-only" aria-label="Department headcounts">
                {groups.map((g) => (
                  <li key={g.key}>
                    {name(g.key)}: {g.count.toLocaleString("en-US")} employees
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
export function SalaryDistribution({
  distribution,
  currency,
  count,
  loading = false,
}: {
  distribution: Dashboard["distribution"];
  loading?: boolean;
  currency: string;
  count: number;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const range = (i: number) =>
    formatMoney(distribution[i].lower, currency) +
    " – " +
    formatMoney(distribution[i].upper, currency);
  return (
    <section
      aria-busy={loading}
      className="mt-5 min-w-0 rounded-xl bg-card p-5 shadow-panel"
      aria-label="Annual salary distribution"
    >
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h3 className="text-heading font-medium">
            Annual salary distribution
          </h3>
          <p className="mt-1 text-meta text-foreground-2">
            {loading
              ? currency + " · Current annual base · Population loading"
              : currency +
                " · Current annual base · All " +
                count.toLocaleString("en-US") +
                " matching employees"}
          </p>
        </div>
        <Link
          href={"/employees?currency=" + currency}
          className="flex min-h-11 items-center text-ui underline underline-offset-4"
        >
          Browse this currency population
        </Link>
      </div>
      {loading ? (
        <>
          <Skeleton className="mt-5 h-64 w-full" />
          <p className="mt-3 min-h-10 text-meta text-foreground-2">
            Loading exact salary bands…
          </p>
          <div className="mt-2 border-t pt-3">
            <div className="min-h-11 py-3">
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </>
      ) : !distribution.length ? (
        <p className="flex h-64 items-center justify-center text-foreground-2">
          No employees are currently paid in {currency}.
        </p>
      ) : (
        <>
          <div className="mt-5">
            <Plot
              type="bar"
              labels={distribution.map((_, i) => "Band " + (i + 1))}
              values={distribution.map((b) => b.count)}
              tooltip={(i) =>
                range(i) +
                " · " +
                distribution[i].count.toLocaleString("en-US") +
                " employees"
              }
              onPick={setSelected}
              label={
                "Salary histogram in " +
                currency +
                " annual base; vertical axis employee count; exact band ranges follow"
              }
            />
          </div>
          <p
            role="status"
            className="mt-3 min-h-10 text-meta text-foreground-2"
          >
            {selected !== null && distribution[selected]
              ? range(selected) +
                " · " +
                distribution[selected].count.toLocaleString("en-US") +
                " employees."
              : "Select a band to inspect its exact range and employee count."}{" "}
            Equal-width bands in exact minor units, inclusive boundaries; no FX
            conversion.
          </p>
          <details className="mt-2 border-t pt-3">
            <summary className="min-h-11 cursor-pointer py-3 text-ui font-medium">
              View exact salary bands and counts
            </summary>
            <div className="overflow-x-auto">
              <table className="w-full text-ui">
                <caption className="sr-only">
                  {currency} annual-base salary distribution, inclusive
                  minor-unit ranges
                </caption>
                <thead>
                  <tr className="text-left text-meta text-foreground-2">
                    <th scope="col" className="py-2">
                      Annual salary range
                    </th>
                    <th scope="col" className="text-right">
                      Employees
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {distribution.map((b, i) => (
                    <tr key={b.lower} className="border-t">
                      <th
                        scope="row"
                        className="min-h-11 py-3 text-left font-normal tabular-nums"
                      >
                        {range(i)}
                      </th>
                      <td className="text-right tabular-nums">
                        {b.count.toLocaleString("en-US")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
      <p className="mt-4 text-meta text-foreground-2">
        Descriptive synthetic data. Small groups are unstable; this chart does
        not establish pay fairness or market benchmarks.
      </p>
    </section>
  );
}
