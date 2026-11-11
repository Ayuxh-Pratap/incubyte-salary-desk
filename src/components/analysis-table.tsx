"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Filters } from "@/domain/filters";
import {
  filterQuery,
  drilldownFilters,
  type Analysis,
} from "@/domain/analysis";
import { formatMoney, formatRational } from "@/domain/money";
import { Skeleton } from "./skeletons";
export function AnalysisTable({
  groups = [],
  filters,
  groupName,
  loading,
  rows = 7,
}: {
  groups?: Analysis["groups"];
  filters: Filters;
  groupName: (key: string) => string;
  loading: boolean;
  rows?: number;
}) {
  const currency = filters.currency!;
  const href = (key: string) =>
    "/employees?" +
    filterQuery(drilldownFilters(filters, filters.groupBy, key));
  return (
    <>
      <div
        className="relative hidden overflow-x-auto md:block"
        role="region"
        aria-label="Salary analysis table, scroll horizontally if needed"
        tabIndex={0}
      >
        <table className="w-full min-w-[1000px] table-fixed text-left tabular-nums">
          <colgroup>
            <col className="w-[24%]" />
            <col className="w-[10%]" />
            <col className="w-[21%]" />
            <col className="w-[21%]" />
            <col className="w-[19%]" />
            <col className="w-[5%]" />
          </colgroup>
          <thead className="bg-table-head text-meta text-foreground-2">
            <tr className="h-12">
              {[
                "Group",
                "Employees",
                "Annual base total",
                "Median annual base",
                "Lowest / highest",
                "",
              ].map((label, i) => (
                <th
                  scope="col"
                  key={i}
                  className={
                    "px-4 font-medium " + (i > 0 && i < 5 ? "text-right" : "")
                  }
                >
                  {label || <span className="sr-only">Explore group</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading
              ? Array.from({ length: rows }, (_, n) => (
                  <tr key={n} className="h-22" aria-hidden>
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <td key={i} className="px-4 py-3">
                        <Skeleton
                          className={
                            "h-3 " + (i === 0 ? "w-3/4" : "ml-auto w-4/5")
                          }
                        />
                        {i === 4 && (
                          <Skeleton className="mt-3 ml-auto h-3 w-4/5" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              : groups.map((group) => (
                  <tr
                    key={group.key}
                    className="h-22 hover:bg-row-hover focus-within:bg-row-hover"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={href(group.key)}
                        className="inline-flex min-h-11 flex-col justify-center rounded font-medium break-words hover:underline"
                      >
                        {groupName(group.key)}
                        {group.summary.count < 5 && (
                          <span className="mt-0.5 text-meta font-normal text-muted-foreground">
                            Small sample
                          </span>
                        )}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {group.summary.count.toLocaleString("en-US")}
                    </td>
                    <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                      {formatMoney(group.summary.total, currency)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {group.summary.median
                        ? formatRational(group.summary.median, currency)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-meta whitespace-nowrap text-foreground-2">
                      <span className="block">
                        <span className="text-muted-foreground">Min </span>
                        {group.summary.min
                          ? formatMoney(group.summary.min, currency)
                          : "—"}
                      </span>
                      <span className="mt-1 block">
                        <span className="text-muted-foreground">Max </span>
                        {group.summary.max
                          ? formatMoney(group.summary.max, currency)
                          : "—"}
                      </span>
                    </td>
                    <td className="pr-2 py-3">
                      <Link
                        aria-label={"Explore " + groupName(group.key)}
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-foreground-2 hover:bg-inset"
                        href={href(group.key)}
                      >
                        <ArrowUpRight className="size-4" aria-hidden />
                      </Link>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      <div className="md:hidden">
        {loading ? (
          <ul className="divide-y" aria-hidden>
            {Array.from({ length: rows }, (_, n) => (
              <li key={n} className="min-h-56 p-4">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="mt-2 h-3 w-1/3" />
                <div className="mt-5 grid grid-cols-2 gap-5">
                  {[1, 2, 3, 4].map((v) => (
                    <div key={v}>
                      <Skeleton className="h-2.5 w-1/2" />
                      <Skeleton className="mt-2 h-3 w-4/5" />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="divide-y">
            {groups.map((group) => (
              <li key={group.key}>
                <Link
                  className="block min-h-56 rounded-lg p-4 hover:bg-row-hover"
                  href={href(group.key)}
                >
                  <div className="flex justify-between gap-3 font-medium">
                    <span>{groupName(group.key)}</span>
                    <ArrowUpRight className="size-4 shrink-0" aria-hidden />
                  </div>
                  <p className="mt-1 text-meta text-muted-foreground">
                    {group.summary.count.toLocaleString("en-US")}{" "}
                    {group.summary.count === 1 ? "employee" : "employees"}
                    {group.summary.count < 5 ? " · Small sample" : ""}
                  </p>
                  <dl className="mt-4 grid grid-cols-2 gap-4">
                    {[
                      [
                        "Annual base total",
                        formatMoney(group.summary.total, currency),
                      ],
                      [
                        "Median annual base",
                        group.summary.median
                          ? formatRational(group.summary.median, currency)
                          : "—",
                      ],
                      [
                        "Lowest annual base",
                        group.summary.min
                          ? formatMoney(group.summary.min, currency)
                          : "—",
                      ],
                      [
                        "Highest annual base",
                        group.summary.max
                          ? formatMoney(group.summary.max, currency)
                          : "—",
                      ],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-meta text-muted-foreground">
                          {label}
                        </dt>
                        <dd className="mt-1 break-words font-medium tabular-nums">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
