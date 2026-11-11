"use client";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useReducedMotion } from "motion/react";
import {
  Chart,
  BarController,
  DoughnutController,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  type ChartConfiguration,
} from "chart.js";
import Link from "next/link";
import { Skeleton } from "./skeletons";
import { useRouter } from "next/navigation";
import type { Dashboard } from "@/domain/dashboard";
import type { Catalog } from "@/domain/employee";
import { formatMoney } from "@/domain/money";
const seriesTokens = [
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-5",
  "--foreground-2",
  "--foreground-faint",
];
Chart.register(
  BarController,
  DoughnutController,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
);
function Plot({
  type,
  labels,
  values,
  tooltip,
  onPick,
  label,
  horizontal = false,
}: {
  type: "bar" | "doughnut";
  labels: string[];
  values: number[];
  tooltip: (index: number) => string;
  onPick?: (index: number) => void;
  label: string;
  horizontal?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null),
    { resolvedTheme } = useTheme(),
    reduced = useReducedMotion();
  useEffect(() => {
    if (!ref.current) return;
    const style = getComputedStyle(document.documentElement),
      token = (name: string) => style.getPropertyValue(name).trim();
    const colors = seriesTokens.map(token);
    const config: ChartConfiguration<"bar" | "doughnut", number[], string> = {
      type,
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: type === "doughnut" ? colors : token("--chart-1"),
            borderWidth: type === "doughnut" ? 2 : 0,
            borderColor: token("--card"),
            borderRadius: type === "bar" ? 4 : 0,
          },
        ],
      },
      options: {
        indexAxis: horizontal ? "y" : "x",
        responsive: true,
        maintainAspectRatio: false,
        animation: reduced ? false : { duration: 240 },
        plugins: {
          tooltip: {
            callbacks: {
              title: (items) => labels[items[0]?.dataIndex ?? 0],
              label: (item) => tooltip(item.dataIndex),
            },
          },
        },
        onClick: (_event, elements) => {
          if (elements[0]) onPick?.(elements[0].index);
        },
        ...(type === "bar"
          ? {
              scales: {
                x: {
                  beginAtZero: true,
                  grid: { display: horizontal, color: token("--border") },
                  ticks: {
                    precision: 0,
                    color: token("--foreground-2"),
                    font: { family: "Geist", size: 11 },
                    maxRotation: 0,
                    autoSkip: false,
                  },
                },
                y: {
                  beginAtZero: true,
                  grid: { display: !horizontal, color: token("--border") },
                  ticks: {
                    precision: 0,
                    color: token("--foreground-2"),
                    font: { family: "Geist", size: 11 },
                  },
                },
              },
            }
          : { cutout: "68%" }),
      },
    };
    const chart = new Chart(ref.current, config);
    return () => chart.destroy();
  }, [
    type,
    labels,
    values,
    tooltip,
    onPick,
    resolvedTheme,
    reduced,
    horizontal,
  ]);
  return (
    <div className="relative h-64 min-w-0">
      <canvas ref={ref} role="img" aria-label={label}>
        The equivalent values and actions are available in the data table below.
      </canvas>
    </div>
  );
}
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
          className="min-h-[480px] min-w-0 rounded-xl bg-card p-5 shadow-panel"
          aria-label={title}
        >
          <h2 className="text-heading font-medium">{title}</h2>
          <p className="mt-1 mb-5 text-meta text-foreground-2">
            All {population.headcount.toLocaleString("en-US")} employees · Every
            pay currency
          </p>
          <Plot
            type={type}
            horizontal={type === "bar"}
            labels={groups.map((g) => name(g.key))}
            values={groups.map((g) => g.count)}
            label={title + "; equivalent data and drill-downs follow"}
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
          {type === "doughnut" && (
            <ul
              aria-label="Country legend"
              className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-meta text-foreground-2"
            >
              {groups.map((g, i) => (
                <li key={g.key} className="flex min-w-0 items-center gap-2">
                  <span
                    aria-hidden
                    className="size-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        "var(" + seriesTokens[i % seriesTokens.length] + ")",
                    }}
                  />
                  <span className="truncate">{name(g.key)}</span>
                  <span className="ml-auto tabular-nums">
                    {g.count.toLocaleString("en-US")}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <details className="mt-4 border-t pt-3">
            <summary className="min-h-11 cursor-pointer py-3 text-ui font-medium">
              View data and matching employees
            </summary>
            <table className="w-full text-ui">
              <caption className="sr-only">
                {title}; current population, all currencies
              </caption>
              <thead>
                <tr className="text-left text-meta text-foreground-2">
                  <th scope="col" className="py-2">
                    {filter === "country" ? "Country" : "Department"}
                  </th>
                  <th scope="col" className="text-right">
                    Employees
                  </th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => (
                  <tr key={g.key} className="border-t">
                    <th scope="row" className="text-left font-normal">
                      <Link
                        className="flex min-h-11 items-center underline-offset-4 hover:underline"
                        aria-label={"Explore " + filter + " " + name(g.key)}
                        href={
                          "/employees?" +
                          filter +
                          "=" +
                          encodeURIComponent(g.key)
                        }
                      >
                        {name(g.key)}
                      </Link>
                    </th>
                    <td className="text-right tabular-nums">
                      {g.count.toLocaleString("en-US")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
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
