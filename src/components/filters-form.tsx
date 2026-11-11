"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Filters } from "@/domain/filters";
import type { Catalog } from "@/domain/employee";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
export function FiltersForm({
  filters,
  catalog,
  overview = false,
}: {
  filters: Filters;
  catalog?: Catalog;
  overview?: boolean;
}) {
  const router = useRouter();
  const [fields, setFields] = useState<Record<string, string>>({
    country: filters.country || "",
    department: filters.department || "",
    role: filters.role || "",
    currency: filters.currency || "",
  });
  const currency = fields.currency;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new URLSearchParams();
    for (const [key, value] of new FormData(event.currentTarget)) {
      if (typeof value === "string" && value) values.set(key, value);
    }
    if (!values.get("currency") && values.get("sort")?.startsWith("salary-"))
      values.set("sort", "name-asc");
    router.push(
      (overview ? "/overview" : "/employees") + "?" + values.toString(),
    );
  }
  const selectClass = "min-h-11 w-full rounded-lg border bg-card px-3 text-ui";
  return (
    <form
      onSubmit={submit}
      className="rounded-xl border bg-card p-4"
      key={JSON.stringify(filters)}
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="relative block">
          <span className="sr-only">Search employees</span>
          <Search className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={filters.q}
            maxLength={100}
            placeholder="Search name or employee number…"
            className="pl-9"
          />
        </label>
        <Button type="submit" variant="outline">
          <SlidersHorizontal />
          Apply filters
        </Button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            name: "country",
            label: "Country",
            options: catalog?.countries.map((c) => ({
              value: c.code,
              label: c.name,
            })),
          },
          {
            name: "department",
            label: "Department",
            options: catalog?.departments.map((c) => ({
              value: c.id,
              label: c.name,
            })),
          },
          {
            name: "role",
            label: "Role",
            options: catalog?.roles.map((c) => ({
              value: c.id,
              label: c.name,
            })),
          },
          {
            name: "currency",
            label: "Pay currency",
            options: catalog?.currencies.map((c) => ({
              value: c.code,
              label: c.code,
            })),
          },
        ].map(({ name, label, options }) => (
          <label
            key={name}
            className="space-y-1.5 text-meta font-medium text-foreground-2"
          >
            <span>{label}</span>
            <select
              name={name}
              onChange={(event) => {
                setFields((previous) => ({
                  ...previous,
                  [name]: event.target.value,
                }));
              }}
              className={selectClass}
              value={fields[name]}
              required={overview && name === "currency"}
              disabled={!catalog}
            >
              {!catalog && (
                <option value={fields[name]}>Loading options…</option>
              )}
              {catalog && !(overview && name === "currency") && (
                <option value="">
                  All{" "}
                  {
                    {
                      country: "countries",
                      department: "departments",
                      role: "roles",
                      currency: "currencies",
                    }[name]
                  }
                </option>
              )}
              {catalog &&
                fields[name] &&
                !options?.some((o) => o.value === fields[name]) && (
                  <option value={fields[name]}>
                    Unknown {label.toLowerCase()} ({fields[name]})
                  </option>
                )}
              {options?.map((o) => (
                <option value={o.value} key={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
        <p className="text-meta text-muted-foreground">
          Annual base salary ·{" "}
          {overview
            ? "One currency per analysis"
            : "Choose a currency to sort by salary"}
        </p>
        {overview ? (
          <label className="flex items-center gap-2 text-meta text-foreground-2">
            Group by
            <select
              name="groupBy"
              defaultValue={filters.groupBy}
              className={selectClass + " w-auto"}
            >
              <option value="department">Department</option>
              <option value="country">Country</option>
              <option value="role">Role</option>
            </select>
          </label>
        ) : (
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center gap-2 text-meta text-foreground-2">
              <span className="sr-only">Sort employees</span>
              <select
                name="sort"
                aria-label="Sort employees"
                defaultValue={filters.sort}
                className={selectClass + " w-auto"}
              >
                <option value="name-asc">Name A–Z</option>
                <option value="name-desc">Name Z–A</option>
                <option value="updated-desc">Recently updated</option>
                <option value="salary-asc" disabled={!currency}>
                  Salary low–high
                </option>
                <option value="salary-desc" disabled={!currency}>
                  Salary high–low
                </option>
              </select>
            </label>
            <label>
              <span className="sr-only">Records per page</span>
              <select
                name="pageSize"
                aria-label="Records per page"
                defaultValue={filters.pageSize}
                className={selectClass + " w-auto"}
              >
                {[25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n} per page
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={() =>
            router.push(overview ? "/overview?currency=INR" : "/employees")
          }
        >
          Clear filters
        </Button>
      </div>
    </form>
  );
}
