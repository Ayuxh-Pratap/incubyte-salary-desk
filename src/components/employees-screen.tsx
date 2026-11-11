"use client";
import Link from "next/link";
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
import { filterQuery } from "@/domain/analysis";
import { useRemote } from "./use-remote";
import { useWorkspaceNavigation } from "./use-workspace-navigation";
import { FiltersForm } from "./filters-form";
import { Button } from "./ui/button";
import { Sheet } from "./ui/sheet";
import { EmployeeDetail } from "./employee-detail";
import { EmployeeTable } from "./employee-table";
import { Skeleton } from "./skeletons";
export function EmployeesScreen({ filters }: { filters: Filters }) {
  const query = filterQuery(filters),
    results = useRemote<EmployeePage>("/api/employees?" + query),
    catalog = useRemote<Catalog>("/api/catalog");
  const navigation = useWorkspaceNavigation(
      "/employees",
      filters,
      results.reload,
    ),
    busy = navigation.pending || results.loading;
  const [selected, setSelected] = useState<Employee | null>(null),
    [dirty, setDirty] = useState(false);
  const metadata = results.data ?? results.previousData;
  const rows =
    filters.page > 1 && metadata
      ? Math.max(
          1,
          Math.min(
            filters.pageSize,
            metadata.total - (filters.page - 1) * filters.pageSize,
          ),
        )
      : filters.pageSize;
  const overview = new URLSearchParams(query);
  overview.set("currency", filters.currency || "INR");
  return (
    <>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-meta text-muted-foreground">
            Workspace · People & compensation
          </p>
          <h1 className="mt-1 text-title font-semibold tracking-tight md:text-title-lg">
            Employees
          </h1>
          <p className="mt-2 max-w-2xl text-foreground-2">
            Find a person. Understand their pay. Make a careful correction.
          </p>
        </div>
        <Link
          href={"/overview?" + overview.toString()}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border bg-card px-3 font-medium shadow-button hover:shadow-button-hover"
        >
          Salary overview
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </header>
      <FiltersForm
        filters={filters}
        catalog={catalog.data}
        pending={busy}
        onNavigate={navigation.navigate}
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
            ? "Updating employees"
            : results.error
              ? "Employee directory unavailable"
              : (results.data?.total ?? 0) + " matching employees"}
        </p>
        <section
          className="rounded-xl border bg-card shadow-panel"
          aria-label="Employee results"
          aria-busy={busy}
        >
          <header className="flex min-h-16 flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" aria-hidden />
              <h2 className="font-medium">
                {busy
                  ? "Updating employee results…"
                  : results.data
                    ? results.data.total.toLocaleString("en-US") +
                      " matching " +
                      (results.data.total === 1 ? "employee" : "employees")
                    : "Employee directory"}
              </h2>
            </div>
            <span className="text-meta text-muted-foreground">
              {filters.currency || "Multiple currencies"} · Annual base
            </span>
          </header>
          {busy ? (
            <EmployeeTable
              loading
              rows={rows}
              selectedId={selected?.id}
              onSelect={setSelected}
              sort={filters.sort}
            />
          ) : results.error ? (
            <div role="alert" className="min-h-80 p-6">
              <h3 className="font-medium">We couldn’t load the directory</h3>
              <p className="mt-2 text-muted-foreground">{results.error}</p>
              <Button
                onClick={results.reload}
                variant="outline"
                className="mt-4"
              >
                <RefreshCw aria-hidden />
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
            <EmployeeTable
              employees={results.data.employees}
              loading={false}
              rows={rows}
              selectedId={selected?.id}
              onSelect={setSelected}
              sort={filters.sort}
            />
          ) : (
            <div className="min-h-80 px-6 py-16 text-center">
              <Users
                className="mx-auto mb-3 size-6 text-muted-foreground"
                aria-hidden
              />
              <h3 className="font-medium">No employees match these filters</h3>
              <p className="mt-2 text-muted-foreground">
                Try a broader name search or clear a filter.
              </p>
            </div>
          )}
          <footer
            className="sticky bottom-0 z-10 flex min-h-18 flex-wrap items-center justify-between gap-3 rounded-b-xl border-t bg-card px-4 py-3"
            data-testid="pagination"
          >
            <p className="text-meta text-muted-foreground">
              {busy ? (
                <>
                  <span className="sr-only">Updating page</span>
                  <Skeleton className="h-3 w-40" />
                </>
              ) : results.data ? (
                <>
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
                </>
              ) : (
                "Page unavailable"
              )}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                aria-label="Previous page"
                disabled={
                  busy || !!results.error || !metadata || metadata.page <= 1
                }
                onClick={() =>
                  navigation.navigate({ ...filters, page: metadata!.page - 1 })
                }
              >
                <ChevronLeft aria-hidden />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <Button
                variant="outline"
                aria-label="Next page"
                disabled={
                  busy ||
                  !!results.error ||
                  !metadata ||
                  metadata.page >= metadata.pages
                }
                onClick={() =>
                  navigation.navigate({ ...filters, page: metadata!.page + 1 })
                }
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight aria-hidden />
              </Button>
            </div>
          </footer>
        </section>
        <p className="mt-4 text-meta text-muted-foreground">
          Current values only. Totals and salary comparisons require one
          currency.
        </p>
      </FiltersForm>
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
        closeLabel="Close employee panel"
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
