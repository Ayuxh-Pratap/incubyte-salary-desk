import Link from "next/link";
import type { Catalog } from "@/domain/employee";
import type { Analysis } from "@/domain/analysis";
import { barPercent, medianMinorTwice } from "@/domain/dashboard";
import { formatRational } from "@/domain/money";
import { Skeleton } from "./skeletons";
export function DashboardMedians({
  compensation,
  catalog,
  currency: selectedCurrency,
  rows = 7,
}: {
  compensation?: Analysis;
  catalog?: Catalog;
  currency: string;
  rows?: number;
}) {
  const currency = compensation?.currency ?? selectedCurrency;
  const departmentName = (key: string) =>
    catalog?.departments.find((d) => d.id === key)?.name || key;
  const maximum =
    compensation?.groups.reduce((max, g) => {
      const n = medianMinorTwice(g.summary.median);
      return n > max ? n : max;
    }, 0n) ?? 0n;
  return (
    <section
      aria-label="Department median comparison"
      aria-busy={!compensation}
      className="min-w-0 rounded-xl border bg-card p-5 shadow-panel"
    >
      <h3 className="text-heading font-medium">Department medians</h3>
      <p className="mt-1 text-meta text-muted-foreground">
        {currency} · Current annual base · Entire selected-currency population
      </p>
      {!compensation ? (
        <ul className="mt-5 space-y-1" aria-hidden>
          {Array.from({ length: rows }, (_, n) => (
            <li key={n}>
              <div className="block rounded-lg px-1 py-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex h-[21px] items-center">
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="mt-0.5 flex h-[18px] items-center">
                      <Skeleton className="h-2.5 w-28" />
                    </div>
                  </div>
                  <div className="flex h-[21px] items-center">
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
                <Skeleton className="mt-2 h-2 w-full" />
              </div>
            </li>
          ))}
        </ul>
      ) : compensation.groups.length ? (
        <ul className="mt-5 space-y-1">
          {compensation.groups.map((group) => (
            <li key={group.key}>
              <Link
                href={
                  "/overview?currency=" + currency + "&department=" + group.key
                }
                className="block rounded-lg px-1 py-2 hover:bg-row-hover"
              >
                <span className="flex flex-wrap items-start justify-between gap-2 text-ui">
                  <span>
                    {departmentName(group.key)}
                    <span className="mt-0.5 block text-meta text-muted-foreground">
                      {group.summary.count.toLocaleString("en-US")}{" "}
                      {group.summary.count === 1 ? "employee" : "employees"}
                      {group.summary.count < 5 ? " · Small sample" : ""}
                    </span>
                  </span>
                  <span className="break-words font-medium tabular-nums">
                    {group.summary.median
                      ? formatRational(group.summary.median, currency)
                      : "—"}
                  </span>
                </span>
                <span
                  aria-hidden
                  className="mt-2 block h-2 rounded-full bg-inset"
                >
                  <span
                    className="block h-full rounded-full bg-primary/75"
                    style={{
                      width:
                        barPercent(
                          medianMinorTwice(group.summary.median),
                          maximum,
                        ) + "%",
                    }}
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-10 text-muted-foreground">
          No employees paid in this currency.
        </p>
      )}
      <p className="mt-4 text-meta text-muted-foreground">
        Bar lengths are relative to the largest department median. Values round
        only for display. Small samples do not establish pay fairness.
      </p>
    </section>
  );
}
