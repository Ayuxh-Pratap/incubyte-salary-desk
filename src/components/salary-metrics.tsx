"use client";
import { ArrowUpRight } from "lucide-react";
import { METRICS, type Metric, type Analysis } from "@/domain/analysis";
import { formatMoney, formatRational, type Summary } from "@/domain/money";
import { MetricSkeleton } from "./skeletons";
function metricValue(key: Metric, summary: Summary, currency: string) {
  if (key === "count") return summary.count.toLocaleString("en-US");
  if (key === "median")
    return summary.median ? formatRational(summary.median, currency) : "—";
  if (summary.count === 0) return "—";
  return summary[key] === null ? "—" : formatMoney(summary[key], currency);
}
export function SalaryMetrics({
  analysis,
  loading,
  onExplain,
}: {
  analysis?: Analysis;
  loading: boolean;
  onExplain: (metric: Metric) => void;
}) {
  return (
    <section
      aria-label="Salary metrics"
      className="grid gap-3 @min-[500px]:grid-cols-2 @min-[1100px]:grid-cols-4"
    >
      {(Object.keys(METRICS) as Metric[])
        .filter((key) => key !== "count")
        .map((key) =>
          loading || !analysis ? (
            <MetricSkeleton key={key} />
          ) : (
            <button
              key={key}
              type="button"
              onClick={() => onExplain(key)}
              className="min-h-36 min-w-0 rounded-xl bg-card p-4 text-left shadow-panel transition-colors hover:bg-row-hover"
              aria-label={"Explain " + METRICS[key].label}
            >
              <span className="flex items-start justify-between gap-2 text-meta font-medium text-muted-foreground">
                {METRICS[key].label}
                <ArrowUpRight className="size-3.5 shrink-0" aria-hidden />
              </span>
              <span className="mt-4 block break-words text-heading font-medium tracking-tight tabular-nums">
                {metricValue(key, analysis.summary, analysis.currency)}
              </span>
              <span className="mt-3 block text-meta text-muted-foreground">
                Explain this number
              </span>
            </button>
          ),
        )}
    </section>
  );
}
