"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
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
import { DashboardPopulation } from "./dashboard-population";
import { DashboardMedians } from "./dashboard-medians";
import { CurrencyPicker } from "./currency-picker";
export function DashboardScreen({ currency }: { currency: string }) {
  const router = useRouter(),
    [navigating, startTransition] = useTransition();
  const data = useRemote<Dashboard>("/api/dashboard?currency=" + currency),
    catalog = useRemote<Catalog>("/api/catalog");
  const busy = navigating || data.loading,
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
    startTransition(() =>
      router.push("/dashboard?currency=" + encodeURIComponent(next), {
        scroll: false,
      }),
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
          <h1 className="mt-1 text-title font-semibold tracking-tight md:text-title-lg">
            Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-foreground-2">
            A current view of your people and their annual base pay.
          </p>
        </div>
        <Link
          href="/employees"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border bg-card px-3 font-medium shadow-button hover:shadow-button-hover"
        >
          Open employees
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </header>
      {initialError && (
        <section role="alert" className="mb-5 rounded-xl border bg-card p-5">
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
                    className="min-h-32 rounded-xl border bg-card p-4 shadow-panel transition-colors sm:min-h-36 sm:p-5 hover:bg-row-hover"
                  >
                    <div className="flex justify-between gap-3 text-meta text-muted-foreground">
                      <span>{label}</span>
                      <Icon className="size-4" aria-hidden />
                    </div>
                    <span className="mt-4 block text-3xl font-semibold tracking-tight tabular-nums">
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
      {!initialError && (
        <DashboardPopulation population={global} catalog={catalog.data} />
      )}
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
          {busy
            ? "Updating compensation snapshot"
            : data.error
              ? "Compensation snapshot unavailable"
              : currency + " compensation snapshot ready"}
        </p>
        <div aria-busy={busy}>
          {data.error && !busy ? (
            <div
              role={initialError ? undefined : "alert"}
              className="rounded-xl border bg-card p-6"
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
                        className="min-h-36 min-w-0 rounded-xl border bg-card p-5 shadow-panel hover:bg-row-hover"
                      >
                        <span className="flex justify-between gap-3 text-meta text-muted-foreground">
                          {label}
                          <ArrowUpRight
                            className="size-3.5 shrink-0"
                            aria-hidden
                          />
                        </span>
                        <span className="mt-5 block break-words text-heading font-semibold tracking-tight tabular-nums">
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
              <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <DashboardMedians
                  compensation={compensation}
                  catalog={catalog.data}
                  currency={currency}
                  rows={
                    data.previousData?.compensation.groups.length ||
                    catalog.data?.departments.length ||
                    7
                  }
                />
                <aside className="flex min-w-0 flex-col rounded-xl border bg-card p-5 shadow-panel">
                  <h3 className="text-heading font-medium">
                    From insight to action
                  </h3>
                  <p className="mt-2 text-ui text-foreground-2">
                    Explore a defined population, or make a careful individual
                    salary correction.
                  </p>
                  <Link
                    href={"/overview?currency=" + currency}
                    className="mt-5 flex min-h-11 items-center justify-between gap-3 rounded-lg bg-inset px-3 font-medium hover:bg-row-hover"
                  >
                    Salary overview
                    <ArrowRight className="size-4 shrink-0" aria-hidden />
                  </Link>
                  <Link
                    href={"/employees?currency=" + currency}
                    className="mt-2 flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 font-medium hover:bg-row-hover"
                  >
                    Employees paid in {currency}
                    <ArrowRight className="size-4 shrink-0" aria-hidden />
                  </Link>
                  <p className="mt-auto pt-6 text-meta text-muted-foreground">
                    Current values only. Bonuses, benefits, payroll and
                    historical changes are outside this assessment’s working
                    scope.
                  </p>
                </aside>
              </div>
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
