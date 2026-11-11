"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, type FormEvent } from "react";
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
import {
  barPercent,
  medianMinorTwice,
  type Dashboard,
} from "@/domain/dashboard";
import { CURRENCIES, formatMoney, formatRational } from "@/domain/money";
import { useRemote } from "./use-remote";
import { Button } from "./ui/button";
import { MetricSkeleton, ChartSkeleton } from "./skeletons";
export function DashboardScreen({ currency }: { currency: string }) {
  const router = useRouter(),
    [navigating, startTransition] = useTransition();
  const data = useRemote<Dashboard>("/api/dashboard?currency=" + currency),
    catalog = useRemote<Catalog>("/api/catalog");
  const busy = navigating || data.loading,
    global = data.data?.population ?? data.previousData?.population;
  const compensation = !busy ? data.data?.compensation : undefined;
  const countries = global?.countries ?? [],
    departments = global?.departments ?? [];
  const countryName = (key: string) =>
    catalog.data?.countries.find((c) => c.code === key)?.name || key;
  const departmentName = (key: string) =>
    catalog.data?.departments.find((d) => d.id === key)?.name || key;
  const maximum =
    compensation?.groups.reduce((max, g) => {
      const n = medianMinorTwice(g.summary.median);
      return n > max ? n : max;
    }, 0n) ?? 0n;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = String(new FormData(event.currentTarget).get("currency"));
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
          <h1 className="mt-1 text-title font-semibold tracking-tight">
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
      <section aria-label="Organization headcounts">
        <div className="mb-3 flex flex-wrap justify-between gap-2">
          <h2 className="font-medium">Organization at a glance</h2>
          <p className="text-meta text-muted-foreground">
            All employees · Across every pay currency
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {global
            ? countCards.map(({ label, value, icon: Icon }) => (
                <Link
                  key={label}
                  href="/employees"
                  data-testid={
                    label === "Employees" ? "global-headcount" : undefined
                  }
                  className="min-h-36 rounded-xl border bg-card p-5 shadow-panel transition-colors hover:bg-row-hover"
                >
                  <div className="flex justify-between gap-3 text-meta text-muted-foreground">
                    <span>{label}</span>
                    <Icon className="size-4" aria-hidden />
                  </div>
                  <span className="mt-4 block text-3xl font-semibold tracking-tight tabular-nums">
                    {value.toLocaleString("en-US")}
                  </span>
                  <span className="mt-2 block text-meta text-muted-foreground">
                    Current employee dataset
                  </span>
                </Link>
              ))
            : [1, 2, 3, 4].map((n) => <MetricSkeleton key={n} />)}
        </div>
      </section>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        {global ? (
          <>
            <section className="rounded-xl border bg-card p-5 shadow-panel">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-heading font-medium">
                    People by country
                  </h2>
                  <p className="mt-1 text-meta text-muted-foreground">
                    Employment country · All{" "}
                    {global.headcount.toLocaleString("en-US")} employees
                  </p>
                </div>
                <Globe className="size-4 text-muted-foreground" aria-hidden />
              </div>
              {countries.length ? (
                <ul className="space-y-2">
                  {countries.map((group) => (
                    <li key={group.key}>
                      <Link
                        href={"/employees?country=" + group.key}
                        aria-label={"Explore country " + countryName(group.key)}
                        className="block rounded-lg px-1 py-2 hover:bg-row-hover"
                      >
                        <span className="flex items-start justify-between gap-4 text-ui">
                          <span>{countryName(group.key)}</span>
                          <span className="shrink-0 tabular-nums">
                            {group.count.toLocaleString("en-US")}{" "}
                            <span className="text-meta text-muted-foreground">
                              employees
                            </span>
                          </span>
                        </span>
                        <span
                          className="mt-2 block h-1.5 rounded-full bg-inset"
                          aria-hidden
                        >
                          <span
                            className="block h-full rounded-full bg-foreground/35"
                            style={{
                              width:
                                barPercent(
                                  BigInt(group.count),
                                  BigInt(global.headcount),
                                ) + "%",
                            }}
                          />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-8 text-muted-foreground">
                  No employees in the dataset.
                </p>
              )}
            </section>
            <section className="rounded-xl border bg-card p-5 shadow-panel">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-heading font-medium">
                    People by department
                  </h2>
                  <p className="mt-1 text-meta text-muted-foreground">
                    Current headcount · All pay currencies
                  </p>
                </div>
                <Building2
                  className="size-4 text-muted-foreground"
                  aria-hidden
                />
              </div>
              {departments.length ? (
                <ul className="space-y-2">
                  {departments.map((group) => (
                    <li key={group.key}>
                      <Link
                        href={"/employees?department=" + group.key}
                        aria-label={
                          "Explore department " + departmentName(group.key)
                        }
                        className="flex min-h-11 items-center justify-between gap-4 rounded-lg px-1 py-2 hover:bg-row-hover"
                      >
                        <span>{departmentName(group.key)}</span>
                        <span className="flex shrink-0 items-center gap-4">
                          <span
                            className="hidden h-1.5 w-28 overflow-hidden rounded-full bg-inset sm:block"
                            aria-hidden
                          >
                            <span
                              className="block h-full rounded-full bg-foreground/35"
                              style={{
                                width:
                                  barPercent(
                                    BigInt(group.count),
                                    BigInt(global.headcount),
                                  ) + "%",
                              }}
                            />
                          </span>
                          <span className="w-12 text-right tabular-nums">
                            {group.count.toLocaleString("en-US")}
                          </span>
                          <ArrowUpRight
                            className="size-3.5 text-muted-foreground"
                            aria-hidden
                          />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-8 text-muted-foreground">
                  No departments to show.
                </p>
              )}
            </section>
          </>
        ) : (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        )}
      </div>
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
          <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
            <label className="space-y-1 text-meta text-foreground-2">
              <span className="block">Pay currency</span>
              <select
                key={currency}
                name="currency"
                aria-label="Dashboard pay currency"
                defaultValue={currency}
                className="min-h-11 rounded-lg border border-control-border bg-card px-3 text-ui shadow-well"
              >
                {Object.keys(CURRENCIES).map((code) => (
                  <option key={code}>{code}</option>
                ))}
              </select>
            </label>
            <Button type="submit" variant="outline" aria-busy={busy}>
              Apply currency
            </Button>
          </form>
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
            <div role="alert" className="rounded-xl border bg-card p-6">
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
                {compensation ? (
                  <section className="min-w-0 rounded-xl border bg-card p-5 shadow-panel">
                    <h3 className="text-heading font-medium">
                      Department medians
                    </h3>
                    <p className="mt-1 text-meta text-muted-foreground">
                      {currency} · Current annual base · Entire
                      selected-currency population
                    </p>
                    {compensation.groups.length ? (
                      <ul className="mt-5 space-y-1">
                        {compensation.groups.map((group) => (
                          <li key={group.key}>
                            <Link
                              href={
                                "/overview?currency=" +
                                currency +
                                "&department=" +
                                group.key
                              }
                              className="block rounded-lg px-1 py-2 hover:bg-row-hover"
                            >
                              <span className="flex flex-wrap items-start justify-between gap-2 text-ui">
                                <span>
                                  {departmentName(group.key)}
                                  <span className="mt-0.5 block text-meta text-muted-foreground">
                                    {group.summary.count.toLocaleString(
                                      "en-US",
                                    )}{" "}
                                    {group.summary.count === 1
                                      ? "employee"
                                      : "employees"}
                                    {group.summary.count < 5
                                      ? " · Small sample"
                                      : ""}
                                  </span>
                                </span>
                                <span className="break-words font-medium tabular-nums">
                                  {group.summary.median
                                    ? formatRational(
                                        group.summary.median,
                                        currency,
                                      )
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
                      Bar lengths are relative to the largest department median.
                      Values round only for display. Small samples do not
                      establish pay fairness.
                    </p>
                  </section>
                ) : (
                  <ChartSkeleton />
                )}
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
