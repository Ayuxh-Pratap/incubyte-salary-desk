"use client";
import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import {
  METRICS,
  filterQuery,
  exactMedian,
  type Metric,
  type Analysis,
} from "@/domain/analysis";
import type { Catalog } from "@/domain/employee";
import { Sheet } from "./ui/sheet";
export function MetricExplanation({
  metric,
  onClose,
  analysis,
  catalog,
}: {
  metric: Metric | null;
  onClose: () => void;
  analysis: Analysis;
  catalog?: Catalog;
}) {
  const filters = analysis.filters;
  const labels = [
    ["Search", filters.q || "Any name or employee number"],
    [
      "Country",
      catalog?.countries.find((c) => c.code === filters.country)?.name ||
        "All countries",
    ],
    [
      "Department",
      catalog?.departments.find((c) => c.id === filters.department)?.name ||
        "All departments",
    ],
    [
      "Role",
      catalog?.roles.find((c) => c.id === filters.role)?.name || "All roles",
    ],
    ["Currency", analysis.currency],
    ["Period", "Annual base salary"],
  ];
  return (
    <Sheet
      open={!!metric}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={metric ? METRICS[metric].label : "Metric explanation"}
      description="Definition, population and calculation basis."
    >
      {metric && (
        <>
          <p className="text-heading font-medium">What this number means</p>
          <p className="mt-3 text-foreground-2">{METRICS[metric].definition}</p>
          <div className="mt-5 rounded-xl border bg-muted p-4">
            <p className="font-semibold tabular-nums">
              {analysis.summary.count.toLocaleString("en-US")} matching
              employees
            </p>
            <p className="mt-1 text-meta text-muted-foreground">
              The entire filtered population, across every page.
            </p>
          </div>
          <dl className="mt-5 divide-y">
            {labels.map(([name, value]) => (
              <div key={name} className="flex justify-between gap-4 py-3">
                <dt className="text-muted-foreground">{name}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          {metric === "median" && analysis.summary.median && (
            <div className="mt-5 rounded-lg border p-4">
              <p className="font-medium">Before display rounding</p>
              <p className="mt-2 break-words font-mono tabular-nums">
                {exactMedian(analysis.summary.median, analysis.currency)}
              </p>
              <p className="mt-2 text-meta text-muted-foreground">
                An even population can produce half of the smallest currency
                unit. The underlying calculation retains it.
              </p>
            </div>
          )}
          <p className="mt-5 flex gap-2 text-meta text-muted-foreground">
            <Info className="size-4 shrink-0" />
            These descriptive statistics do not establish pay fairness, market
            competitiveness or the causes of pay differences.
          </p>
          <Link
            href={"/employees?" + filterQuery({ ...filters, page: 1 })}
            onClick={onClose}
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-3 font-medium text-primary-foreground"
          >
            Explore matching{" "}
            {analysis.summary.count === 1 ? "employee" : "employees"}
            <ArrowRight className="size-4" />
          </Link>
        </>
      )}
    </Sheet>
  );
}
