"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { analysisFilters } from "@/domain/analysis";
import {
  ArrowUpRight,
  ArrowRight,
  RefreshCw,
  Users,
  Globe,
  Building2,
  Coins,
} from "lucide-react";
import type { Catalog } from "@/domain/employee";
import type { Dashboard } from "@/domain/dashboard";
import { formatMoney, formatRational } from "@/domain/money";
import { useRemote } from "./use-remote";
import { Button } from "./ui/button";
import { MetricSkeleton } from "./skeletons";
import { Skeleton } from "./skeletons";
const ChartLoading = () => (
  <div
    className="mt-5 h-[400px] rounded-xl bg-card p-5 shadow-panel"
    aria-label="Loading chart"
  >
    <Skeleton className="h-5 w-48" />
    <Skeleton className="mt-6 h-64 w-full" />
  </div>
);
const PopulationCharts = dynamic(
  () => import("./dashboard-charts").then((m) => m.PopulationCharts),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-5 xl:grid-cols-2">
        <ChartLoading />
        <ChartLoading />
      </div>
    ),
  },
);
const SalaryDistribution = dynamic(
  () => import("./dashboard-charts").then((m) => m.SalaryDistribution),
  { ssr: false, loading: ChartLoading },
);
import { CurrencyPicker } from "./currency-picker";
export function DashboardScreen({
  currency: initialCurrency,
}: {
  currency: string;
}) {
  const params = useSearchParams();
  const currency = analysisFilters({
    currency: params.get("currency") || initialCurrency,
  }).currency!;
  const data = useRemote<Dashboard>("/api/dashboard?currency=" + currency),
    catalog = useRemote<Catalog>("/api/catalog");
  const busy = data.loading,
    global = data.data?.population ?? data.previousData?.population;
  const compensation = !busy ? data.data?.compensation : undefined;
  const initialError = !global && !busy && !!data.error;
  const countries = global?.countries ?? [],
    departments = global?.departments ?? [];
  function apply(next: string) {
    if (next === currency) {
      data.reload();
      return;
    }
    window.history.pushState(
      null,
      "",
      "/dashboard?currency=" + encodeURIComponent(next),
    );
  }
  const countCards = global
    ? [
        { label: "Employees", value: global.headcount, icon: Users },
        { label: "Countries", value: countries.length, icon: Globe },
        { label: "Departments", value: departments.length, icon: Building2 },
        {
          label: "Pay currencies",
          value: global.currencies.length,
          icon: Coins,
        },
      ]
    : [];
  return (
    <>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-meta text-muted-foreground">ACME workspace</p>
          <h1 className="mt-1 text-title font-medium tracking-tight md:text-title-lg">
            Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-foreground-2">
            A current view of your people and their annual base pay.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Refresh Dashboard"
            aria-busy={data.refreshing}
            onClick={data.reload}
            disabled={busy || data.refreshing}
          >
            <RefreshCw aria-hidden />
          </Button>
          <Link
            href="/employees"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border bg-card px-3 font-medium shadow-button hover:shadow-button-hover"
          >
            Open employees
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </header>
      {initialError && (
        <section role="alert" className="mb-5 rounded-xl bg-card p-5">
          <h2 className="text-heading font-medium">
            We couldn’t load the organization snapshot
          </h2>
          <p className="mt-2 text-muted-foreground">{data.error}</p>
          <Button variant="outline" className="mt-4" onClick={data.reload}>
            <RefreshCw aria-hidden />
            Retry Dashboard
          </Button>
        </section>
      )}
      {!initialError && (
        <section
          aria-label="Organization headcounts"
          aria-busy={!global && busy}
        >
          <div className="mb-3 flex flex-wrap justify-between gap-2">
            <h2 className="font-medium">Organization at a glance</h2>
            <p className="text-meta text-muted-foreground">
              All employees · Across every pay currency
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {global
              ? countCards.map(({ label, value, icon: Icon }) => (
                  <Link
                    key={label}
                    href="/employees"
                    data-testid={
                      label === "Employees" ? "global-headcount" : undefined
                    }
                    className="min-h-32 rounded-xl bg-card p-4 shadow-panel transition-colors sm:min-h-36 sm:p-5 hover:bg-row-hover"
                  >
                    <div className="flex justify-between gap-3 text-meta text-muted-foreground">
                      <span>{label}</span>
                      <Icon className="size-4" aria-hidden />
                    </div>
                    <span className="mt-4 block text-3xl font-medium tracking-tight tabular-nums">
                      {value.toLocaleString("en-US")}
                    </span>
                    <span className="mt-2 hidden text-meta text-muted-foreground sm:block">
                      Current employee dataset
                    </span>
                  </Link>
                ))
              : [1, 2, 3, 4].map((n) => (
                  <MetricSkeleton key={n} className="min-h-32 sm:min-h-36" />
                ))}
          </div>
        </section>
      )}
      {!initialError &&
        (global ? (
          <PopulationCharts population={global} catalog={catalog.data} />
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            <ChartLoading />
            <ChartLoading />
          </div>
        ))}
      <section
        className="mt-8"
        data-testid="currency-compensation"
        aria-label="Currency compensation"
      >
        <header className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-heading font-medium">Compensation snapshot</h2>
            <p className="mt-1 text-meta text-muted-foreground">
              Annual base · One pay currency · No FX conversion
            </p>
          </div>
          <CurrencyPicker currency={currency} pending={busy} onApply={apply} />
        </header>
        <p role="status" aria-live="polite" className="sr-only">
          {data.refreshing
            ? "Refreshing current view"
            : busy
              ? "Updating compensation snapshot"
              : data.error
                ? "Compensation snapshot unavailable"
                : currency + " compensation snapshot ready"}
        </p>
        <div aria-busy={busy}>
          {data.error && !busy ? (
            <div
              role={initialError ? undefined : "alert"}
              className="rounded-xl bg-card p-6"
            >
              <h3 className="font-medium">We couldn’t load this snapshot</h3>
              <p className="mt-2 text-muted-foreground">{data.error}</p>
              <Button variant="outline" className="mt-4" onClick={data.reload}>
                <RefreshCw aria-hidden />
                Try again
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-3">
                {compensation ? (
                  <>
                    {[
                      {
                        label: "Employees paid in " + currency,
                        value:
                          compensation.summary.count.toLocaleString("en-US"),
                      },
                      {
                        label: "Median annual base · " + currency,
                        value: compensation.summary.median
                          ? formatRational(
                              compensation.summary.median,
                              currency,
                            )
                          : "—",
                      },
                      {
                        label: "Annual base total · " + currency,
                        value: compensation.summary.count
                          ? formatMoney(compensation.summary.total, currency)
                          : "—",
                      },
                    ].map(({ label, value }) => (
                      <Link
                        key={label}
                        href={"/overview?currency=" + currency}
                        className="min-h-36 min-w-0 rounded-xl bg-card p-5 shadow-panel hover:bg-row-hover"
                      >
                        <span className="flex justify-between gap-3 text-meta text-muted-foreground">
                          {label}
                          <ArrowUpRight
                            className="size-3.5 shrink-0"
                            aria-hidden
                          />
                        </span>
                        <span className="mt-5 block break-words text-heading font-medium tracking-tight tabular-nums">
                          {value}
                        </span>
                        <span className="mt-3 block text-meta text-muted-foreground">
                          Explore salary analysis
                        </span>
                      </Link>
                    ))}
                  </>
                ) : (
                  [1, 2, 3].map((n) => <MetricSkeleton key={n} />)
                )}
              </div>
              {compensation && data.data ? (
                <SalaryDistribution
                  key={currency}
                  distribution={data.data.distribution ?? []}
                  currency={currency}
                  count={compensation.summary.count}
                />
              ) : (
                <SalaryDistribution
                  distribution={[]}
                  currency={currency}
                  count={0}
                  loading
                />
              )}
            </>
          )}
        </div>
      </section>
      {catalog.error && (
        <p role="alert" className="mt-4 text-meta text-destructive">
          Some group names could not load; active codes remain visible.{" "}
          <button onClick={catalog.reload} className="min-h-11 underline">
            Retry labels
          </button>
        </p>
      )}
    </>
  );
}
