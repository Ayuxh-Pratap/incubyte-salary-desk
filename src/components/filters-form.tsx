"use client";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import {
  Search,
  SlidersHorizontal,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";
import { applyFilterDraft, parseFilters, type Filters } from "@/domain/filters";
import type { Catalog } from "@/domain/employee";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Sheet } from "./ui/sheet";
function draftFields(filters: Filters) {
  return {
    q: filters.q,
    country: filters.country || "",
    department: filters.department || "",
    role: filters.role || "",
    currency: filters.currency || "",
    sort: filters.sort,
    pageSize: String(filters.pageSize),
    groupBy: filters.groupBy,
  };
}
export function FiltersForm({
  filters,
  catalog,
  overview = false,
  pending,
  onNavigate,
  children,
}: {
  filters: Filters;
  catalog?: Catalog;
  overview?: boolean;
  pending: boolean;
  onNavigate: (filters: Filters) => void;
  children: ReactNode;
}) {
  const formId = useId(),
    [open, setOpen] = useState(false);
  const applied = draftFields(filters),
    source = JSON.stringify(applied);
  const [draft, setDraft] = useState<{
    source: string;
    fields: ReturnType<typeof draftFields>;
    submitted?: { source: string; fields: string };
  }>({ source, fields: applied });
  let fields = draft.fields;
  if (draft.source !== source) {
    // An accepted URL must not overwrite edits made after that submission.
    const newerDraft =
      draft.submitted?.source === source &&
      JSON.stringify(draft.fields) !== draft.submitted.fields;
    fields = newerDraft ? draft.fields : applied;
    setDraft({ source, fields });
  }
  const changed = Object.entries(fields).some(
    ([key, value]) => value !== applied[key as keyof typeof applied],
  );
  const active = [
    filters.q,
    filters.country,
    filters.department,
    filters.role,
    filters.currency,
  ].filter(Boolean).length;
  function change(key: string, value: string) {
    setDraft((previous) => ({
      ...previous,
      source,
      fields: { ...fields, [key]: value },
    }));
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = applyFilterDraft(filters, fields);
    setDraft({
      source,
      fields,
      submitted: {
        source: JSON.stringify(draftFields(next)),
        fields: JSON.stringify(fields),
      },
    });
    onNavigate(next);
    setOpen(false);
  }
  function reset() {
    const next = parseFilters(overview ? { currency: "INR" } : {});
    setDraft({
      source,
      fields: {
        q: "",
        country: "",
        department: "",
        role: "",
        currency: next.currency || "",
        sort: next.sort,
        pageSize: String(next.pageSize),
        groupBy: next.groupBy,
      },
    });
    onNavigate(next);
    setOpen(false);
  }
  const selectClass =
    "min-h-11 w-full min-w-0 rounded-lg border border-control-border bg-card px-3 text-ui text-foreground shadow-well";
  const filterFields = (prefix: string) => (
    <div className="space-y-5">
      {[
        {
          name: "country",
          label: "Country",
          plural: "countries",
          options: catalog?.countries.map((c) => ({
            value: c.code,
            label: c.name,
          })),
        },
        {
          name: "department",
          label: "Department",
          plural: "departments",
          options: catalog?.departments.map((c) => ({
            value: c.id,
            label: c.name,
          })),
        },
        {
          name: "role",
          label: "Role",
          plural: "roles",
          options: catalog?.roles.map((c) => ({ value: c.id, label: c.name })),
        },
        {
          name: "currency",
          label: "Pay currency",
          plural: "currencies",
          options: catalog?.currencies.map((c) => ({
            value: c.code,
            label: c.code,
          })),
        },
      ].map(({ name, label, plural, options }) => (
        <div
          key={name}
          className="block space-y-1.5 text-meta font-medium text-foreground-2"
        >
          <label htmlFor={prefix + name} className="block">
            {label}
          </label>
          <select
            id={prefix + name}
            form={formId}
            name={name}
            value={fields[name as keyof typeof fields]}
            onChange={(e) => change(name, e.target.value)}
            required={overview && name === "currency"}
            disabled={!catalog}
            className={selectClass}
          >
            {!catalog ? (
              <option value={fields[name as keyof typeof fields]}>
                Loading options…
              </option>
            ) : (
              <>
                {!(overview && name === "currency") && (
                  <option value="">All {plural}</option>
                )}
                {fields[name as keyof typeof fields] &&
                  !options?.some(
                    (o) => o.value === fields[name as keyof typeof fields],
                  ) && (
                    <option value={fields[name as keyof typeof fields]}>
                      Unknown {label.toLowerCase()} (
                      {fields[name as keyof typeof fields]})
                    </option>
                  )}
                {options?.map((o) => (
                  <option value={o.value} key={o.value}>
                    {o.label}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      ))}
      <p className="text-meta leading-relaxed text-muted-foreground">
        Current annual base salary.{" "}
        {overview
          ? "Choose one currency; no FX conversion."
          : "Select one currency to sort by salary."}
      </p>
      <Button
        type="button"
        variant="ghost"
        className="w-full justify-start"
        onClick={reset}
      >
        <RotateCcw aria-hidden />
        Clear filters
      </Button>
    </div>
  );
  return (
    <form
      id={formId}
      onSubmit={submit}
      className="grid min-w-0 items-start gap-5 xl:grid-cols-[224px_minmax(0,1fr)]"
    >
      <aside
        aria-label="Employee filters"
        className="scroll-lean sticky top-6 hidden max-h-[calc(100dvh-72px)] overflow-y-auto rounded-xl border bg-card p-4 shadow-panel xl:block"
        tabIndex={0}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-heading font-medium">Filters</h2>
          <span className="text-meta text-muted-foreground">
            {active} active
          </span>
        </div>
        {filterFields(formId + "-desktop-")}
      </aside>
      <div className="@container min-w-0">
        <div className="mb-4 rounded-xl border bg-card p-3 shadow-panel">
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search employees</span>
              <Search
                className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground"
                aria-hidden
              />
              <Input
                name="q"
                value={fields.q}
                onChange={(e) => change("q", e.target.value)}
                maxLength={100}
                placeholder="Search name or employee number…"
                className="pl-9"
              />
            </label>
            <Button
              variant="outline"
              type="button"
              className="xl:hidden"
              onClick={() => setOpen(true)}
              aria-label={"Open filters, " + active + " active"}
            >
              <SlidersHorizontal aria-hidden />
              <span className="hidden min-[430px]:inline">Filters</span>
              {active > 0 && (
                <span className="rounded bg-inset px-1.5 text-meta tabular-nums">
                  {active}
                </span>
              )}
            </Button>
            <Button
              type="submit"
              aria-label="Apply filters"
              aria-busy={pending}
            >
              {pending ? (
                <LoaderCircle aria-hidden className="animate-spin" />
              ) : (
                <Search aria-hidden />
              )}
              <span className="hidden sm:inline">Apply filters</span>
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <p className="text-meta text-muted-foreground">
              {changed
                ? "Draft changes · Apply to update results"
                : "Search and filters apply together"}
            </p>
            <div className="flex flex-wrap gap-2">
              {overview ? (
                <label className="flex items-center gap-2 text-meta text-foreground-2">
                  Group by
                  <select
                    name="groupBy"
                    value={fields.groupBy}
                    onChange={(e) => change("groupBy", e.target.value)}
                    className={cn(selectClass, "w-auto")}
                  >
                    <option value="department">Department</option>
                    <option value="country">Country</option>
                    <option value="role">Role</option>
                  </select>
                </label>
              ) : (
                <>
                  <label>
                    <span className="sr-only">Sort employees</span>
                    <select
                      name="sort"
                      aria-label="Sort employees"
                      value={fields.sort}
                      onChange={(e) => change("sort", e.target.value)}
                      className={cn(selectClass, "w-auto")}
                    >
                      <option value="name-asc">Name A–Z</option>
                      <option value="name-desc">Name Z–A</option>
                      <option value="updated-desc">Recently updated</option>
                      <option value="salary-asc" disabled={!fields.currency}>
                        Salary low–high
                      </option>
                      <option value="salary-desc" disabled={!fields.currency}>
                        Salary high–low
                      </option>
                    </select>
                  </label>
                  <label>
                    <span className="sr-only">Records per page</span>
                    <select
                      name="pageSize"
                      aria-label="Records per page"
                      value={fields.pageSize}
                      onChange={(e) => change("pageSize", e.target.value)}
                      className={cn(selectClass, "w-auto")}
                    >
                      {[25, 50, 100].map((n) => (
                        <option key={n} value={n}>
                          {n} per page
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              )}
            </div>
          </div>
        </div>
        {children}
      </div>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        title="Employee filters"
        description="Draft changes apply together. Close to keep your draft, or apply to update results."
        closeLabel="Close filters"
      >
        {filterFields(formId + "-mobile-")}
        <Button
          type="submit"
          form={formId}
          className="mt-6 w-full"
          aria-busy={pending}
        >
          Apply filters
        </Button>
      </Sheet>
    </form>
  );
}
