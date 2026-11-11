"use client";
import Link from "next/link";
import { useState } from "react";
import { Info, RefreshCw, ArrowRight } from "lucide-react";
import type { Filters } from "@/domain/filters";
import { filterQuery, type Metric, type Analysis } from "@/domain/analysis";
import type { Catalog } from "@/domain/employee";
import { useRemote } from "./use-remote";
import { useWorkspaceNavigation } from "./use-workspace-navigation";
import { FiltersForm } from "./filters-form";
import { MetricExplanation } from "./metric-explanation";
import { Button } from "./ui/button";
import { SalaryMetrics } from "./salary-metrics";
import { AnalysisTable } from "./analysis-table";
import { Skeleton } from "./skeletons";
export function OverviewScreen({ filters }: { filters: Filters }) {
  const query = filterQuery(filters),
    data = useRemote<Analysis>("/api/analysis?" + query),
    catalog = useRemote<Catalog>("/api/catalog");
  const navigation = useWorkspaceNavigation("/overview", filters, data.reload),
    busy = navigation.pending || data.loading;
  const [metric, setMetric] = useState<Metric | null>(null);
  const groupName = (key: string) =>
    (filters.groupBy === "country"
      ? catalog.data?.countries.find((c) => c.code === key)?.name
      : filters.groupBy === "department"
        ? catalog.data?.departments.find((c) => c.id === key)?.name
        : catalog.data?.roles.find((c) => c.id === key)?.name) || key;
  const rows =
    filters.groupBy === "country"
      ? catalog.data?.countries.length
      : filters.groupBy === "department"
        ? catalog.data?.departments.length
        : catalog.data?.roles.length;
  return (
    <>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-meta text-muted-foreground">
            Workspace · Compensation analysis
          </p>
          <h1 className="mt-1 text-title font-semibold tracking-tight md:text-title-lg">
            Salary overview
          </h1>
          <p className="mt-2 max-w-2xl text-foreground-2">
            Understand a defined population, in one currency at a time.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={data.reload} disabled={busy}>
            <RefreshCw aria-hidden />
            Refresh
          </Button>
          <Link
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border bg-card px-3 font-medium shadow-button hover:shadow-button-hover"
            href={"/employees?" + query}
          >
            View employees
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </header>
      <FiltersForm
        filters={filters}
        catalog={catalog.data}
        overview
        pending={busy}
        onNavigate={(next) => {
          setMetric(null);
          navigation.navigate(next);
        }}
      >
        {catalog.error && (
          <p role="alert" className="mb-3 text-meta text-destructive">
            Filter options could not load. {catalog.error}{" "}
            <button
              type="button"
              className="min-h-11 underline"
              onClick={catalog.reload}
            >
              Retry options
            </button>
          </p>
        )}
        <p role="status" aria-live="polite" className="sr-only">
          {busy
            ? "Calculating full salary population"
            : data.error
              ? "Salary analysis unavailable"
              : "Salary analysis ready"}
        </p>
        <div
          aria-busy={busy}
          aria-label="Salary analysis results"
          role="region"
        >
          {data.error && !busy ? (
            <section
              role="alert"
              className="min-h-80 rounded-xl border bg-card p-6"
            >
              <h2 className="font-semibold">
                We couldn’t calculate this population
              </h2>
              <p className="mt-2 text-muted-foreground">{data.error}</p>
              <Button className="mt-4" variant="outline" onClick={data.reload}>
                <RefreshCw aria-hidden />
                Try again
              </Button>
            </section>
          ) : (
            <>
              <div className="mb-3 flex min-h-6 flex-wrap items-center justify-between gap-2 text-meta text-muted-foreground">
                {busy ? (
                  <Skeleton className="h-3 w-60" />
                ) : (
                  <span>
                    {data.data?.summary.count.toLocaleString("en-US")}{" "}
                    {data.data?.summary.count === 1 ? "employee" : "employees"}{" "}
                    · {filters.currency} · Annual base salary
                  </span>
                )}
                <span>All matching records, across every page</span>
              </div>
              <SalaryMetrics
                analysis={data.data}
                loading={busy}
                onExplain={setMetric}
              />
              {!busy && data.data?.summary.count === 0 ? (
                <section className="mt-5 min-h-80 rounded-xl border bg-card px-6 py-16 text-center">
                  <h2 className="text-heading font-medium">
                    No matching salaries
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Broaden the filters to create a population. Missing salary
                    metrics are a dash, never zero.
                  </p>
                </section>
              ) : (
                <section
                  aria-label="Grouped salary analysis"
                  className="mt-5 rounded-xl border bg-card shadow-panel"
                >
                  <header className="border-b p-4">
                    <h2 className="text-heading font-medium">
                      By {filters.groupBy}
                    </h2>
                    <p className="mt-1 text-meta text-muted-foreground">
                      {filters.currency} / year · Select a group to inspect the
                      same population in the directory.
                    </p>
                  </header>
                  <AnalysisTable
                    groups={data.data?.groups}
                    filters={filters}
                    groupName={groupName}
                    loading={busy}
                    rows={rows || data.previousData?.groups.length || 7}
                  />
                </section>
              )}
              <div className="mt-4 flex items-start gap-2 text-meta text-muted-foreground">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                <p>
                  Current base salary only. No FX conversion. Small samples are
                  descriptive and unstable. These figures do not establish pay
                  fairness or explain pay differences.
                </p>
              </div>
              {!busy && data.data && (
                <MetricExplanation
                  metric={metric}
                  onClose={() => setMetric(null)}
                  analysis={data.data}
                  catalog={catalog.data}
                />
              )}
            </>
          )}
        </div>
      </FiltersForm>
    </>
  );
}
