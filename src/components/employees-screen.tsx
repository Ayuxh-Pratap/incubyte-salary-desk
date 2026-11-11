"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Users,
  RefreshCw,
} from "lucide-react";
import type { Filters } from "@/domain/filters";
import type { Employee, EmployeePage, Catalog } from "@/domain/employee";
import { formatMoney } from "@/domain/money";
import { useRemote } from "./use-remote";
import { FiltersForm } from "./filters-form";
import { Button } from "./ui/button";
import { Sheet } from "./ui/sheet";
import { EmployeeDetail } from "./employee-detail";
export function EmployeesScreen({ filters }: { filters: Filters }) {
  const router = useRouter(),
    query = new URLSearchParams(
      Object.entries(filters).map(([k, v]) => [k, String(v)]),
    ).toString();
  const results = useRemote<EmployeePage>("/api/employees?" + query),
    catalog = useRemote<Catalog>("/api/catalog");
  const [selected, setSelected] = useState<Employee | null>(null);
  const [dirty, setDirty] = useState(false);
  function page(number: number) {
    const params = new URLSearchParams(query);
    params.set("page", String(number));
    router.push("/employees?" + params.toString());
  }
  const overview = new URLSearchParams(query);
  overview.set("currency", filters.currency || "INR");
  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-meta font-medium uppercase tracking-wider text-muted-foreground">
            People & compensation
          </p>
          <h1 className="mt-2 text-title font-semibold tracking-tight">
            Employees
          </h1>
          <p className="mt-2 text-foreground-2">
            Find a person. Understand their pay. Make a careful correction.
          </p>
        </div>
        <Link
          href={"/overview?" + overview.toString()}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border bg-card px-3 font-medium shadow-button"
        >
          Salary overview
          <ArrowRight className="size-4" />
        </Link>
      </div>
      <FiltersForm key={query} filters={filters} catalog={catalog.data} />
      {catalog.error && (
        <p role="alert" className="mt-3 text-destructive">
          Filter options could not load. {catalog.error}{" "}
          <button className="min-h-11 underline" onClick={catalog.reload}>
            Retry options
          </button>
        </p>
      )}
      <section
        className="mt-5 overflow-hidden rounded-xl border bg-card"
        aria-label="Employee results"
      >
        <header className="flex min-h-16 flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            <h2 className="font-medium">
              {results.data
                ? results.data.total.toLocaleString("en-US") +
                  " matching employees"
                : "Employee directory"}
            </h2>
          </div>
          <span className="text-meta text-muted-foreground">
            {filters.currency || "Multiple currencies"} · Annual base
          </span>
        </header>
        {results.loading ? (
          <div role="status" className="space-y-3 p-5">
            <span className="sr-only">Loading employees</span>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : results.error ? (
          <div role="alert" className="p-6">
            <h3 className="font-medium">We couldn’t load the directory</h3>
            <p className="mt-2 text-muted-foreground">{results.error}</p>
            <Button onClick={results.reload} variant="outline" className="mt-4">
              <RefreshCw />
              Try again
            </Button>
            <Link
              className="ml-4 inline-flex min-h-11 items-center underline"
              href="/login"
            >
              Sign in
            </Link>
          </div>
        ) : results.data?.employees.length ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead className="bg-muted/50 text-meta text-muted-foreground">
                  <tr>
                    {[
                      "Employee",
                      "Department / role",
                      "Country",
                      "Annual base salary",
                      "",
                    ].map((h, i) => (
                      <th key={i} scope="col" className="px-4 py-3 font-medium">
                        {h || <span className="sr-only">View employee</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {results.data.employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <button
                          className="min-h-11 text-left font-medium hover:underline"
                          onClick={() => setSelected(employee)}
                          aria-label={"View " + employee.name}
                        >
                          {employee.name}
                          <span className="block text-meta font-normal text-muted-foreground">
                            {employee.employeeNumber}
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        {employee.departmentName}
                        <span className="block text-meta text-muted-foreground">
                          {employee.roleName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground-2">
                        {employee.countryName}
                      </td>
                      <td className="px-4 py-3 font-medium whitespace-nowrap">
                        {formatMoney(employee.salaryMinor, employee.currency)}
                      </td>
                      <td className="px-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={"Open " + employee.employeeNumber}
                          onClick={() => setSelected(employee)}
                        >
                          <ArrowRight />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="divide-y md:hidden">
              {results.data.employees.map((employee) => (
                <li key={employee.id}>
                  <button
                    className="flex min-h-24 w-full items-center justify-between gap-3 p-4 text-left"
                    onClick={() => setSelected(employee)}
                    aria-label={"View " + employee.name}
                  >
                    <span className="min-w-0">
                      <span className="block font-medium">{employee.name}</span>
                      <span className="mt-1 block text-meta text-muted-foreground">
                        {employee.employeeNumber} · {employee.departmentName}
                      </span>
                      <span className="block text-meta text-muted-foreground">
                        {employee.countryName} · {employee.roleName}
                      </span>
                      <span className="mt-2 block font-medium tabular-nums">
                        {formatMoney(employee.salaryMinor, employee.currency)}{" "}
                        <span className="text-meta font-normal text-muted-foreground">
                          / year
                        </span>
                      </span>
                    </span>
                    <ArrowRight className="size-4 shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="p-10 text-center">
            <Users className="mx-auto mb-3 size-6 text-muted-foreground" />
            <h3 className="font-medium">No employees match these filters</h3>
            <p className="mt-2 text-muted-foreground">
              Try a broader name search or clear a filter.
            </p>
          </div>
        )}
        {results.data && (
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
            <p className="text-meta text-muted-foreground">
              {results.data.total
                ? (results.data.page - 1) * results.data.pageSize +
                  1 +
                  "–" +
                  Math.min(
                    results.data.page * results.data.pageSize,
                    results.data.total,
                  ) +
                  " of " +
                  results.data.total.toLocaleString("en-US")
                : "0 employees"}{" "}
              · Page {results.data.page} of {results.data.pages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                aria-label="Previous page"
                disabled={results.data.page <= 1}
                onClick={() => page(results.data!.page - 1)}
              >
                <ChevronLeft />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <Button
                variant="outline"
                aria-label="Next page"
                disabled={results.data.page >= results.data.pages}
                onClick={() => page(results.data!.page + 1)}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight />
              </Button>
            </div>
          </footer>
        )}
      </section>
      <p className="mt-4 text-meta text-muted-foreground">
        Showing current values. Totals and salary comparisons require one
        currency.
      </p>
      <Sheet
        open={!!selected}
        onOpenChange={(open) => {
          if (
            !open &&
            dirty &&
            !window.confirm("Discard your unsaved salary change?")
          )
            return false;
          if (!open) {
            setSelected(null);
            setDirty(false);
          }
        }}
        title="Employee compensation"
        description="Current annual base salary and employee context."
      >
        {selected && (
          <EmployeeDetail
            key={selected.id}
            id={selected.id}
            onSaved={results.reload}
            onDirtyChange={setDirty}
          />
        )}
      </Sheet>
    </>
  );
}
