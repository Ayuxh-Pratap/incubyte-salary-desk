"use client";
import { ArrowRight, ArrowDown, ArrowUp } from "lucide-react";
import type { EmployeeSummary as Employee } from "@/domain/employee";
import type { Filters } from "@/domain/filters";
import { formatMoney } from "@/domain/money";
import { Button } from "./ui/button";
import { EmployeeRowsSkeleton, EmployeeCardsSkeleton } from "./skeletons";
import { cn } from "@/lib/utils";
export function EmployeeTable({
  employees = [],
  loading,
  rows,
  selectedId,
  onSelect,
  sort,
}: {
  employees?: Employee[];
  loading: boolean;
  rows: number;
  selectedId?: number;
  onSelect: (employee: Employee) => void;
  sort: Filters["sort"];
}) {
  return (
    <>
      <div
        className="relative hidden overflow-x-auto rounded-t-xl md:block"
        role="region"
        aria-label="Employee table, scroll horizontally if needed"
        tabIndex={0}
      >
        <table className="w-full min-w-[760px] table-fixed text-left">
          <colgroup>
            <col className="w-[27%]" />
            <col className="w-[25%]" />
            <col className="w-[17%]" />
            <col className="w-[25%]" />
            <col className="w-[6%]" />
          </colgroup>
          <thead className="bg-table-head text-meta text-foreground-2">
            <tr className="h-12">
              <th
                scope="col"
                className="px-4 font-medium"
                aria-sort={
                  sort === "name-asc"
                    ? "ascending"
                    : sort === "name-desc"
                      ? "descending"
                      : "none"
                }
              >
                <span className="flex items-center gap-2">
                  Employee
                  {sort.startsWith("name-") &&
                    (sort === "name-asc" ? (
                      <ArrowDown className="size-3.5" aria-hidden />
                    ) : (
                      <ArrowUp className="size-3.5" aria-hidden />
                    ))}
                </span>
              </th>
              <th scope="col" className="px-4 font-medium">
                Department / role
              </th>
              <th scope="col" className="px-4 font-medium">
                Country
              </th>
              <th
                scope="col"
                className="px-4 text-right font-medium"
                aria-sort={
                  sort === "salary-asc"
                    ? "ascending"
                    : sort === "salary-desc"
                      ? "descending"
                      : "none"
                }
              >
                <span className="flex items-center justify-end gap-2">
                  Annual base salary
                  {sort.startsWith("salary-") &&
                    (sort === "salary-asc" ? (
                      <ArrowUp className="size-3.5" aria-hidden />
                    ) : (
                      <ArrowDown className="size-3.5" aria-hidden />
                    ))}
                </span>
              </th>
              <th scope="col">
                <span className="sr-only">View employee</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <EmployeeRowsSkeleton rows={rows} />
            ) : (
              employees.map((employee) => (
                <tr
                  key={employee.id}
                  data-active={selectedId === employee.id || undefined}
                  className={cn(
                    "h-[68px] transition-colors focus-within:bg-row-hover",
                    selectedId === employee.id
                      ? "bg-row-selected"
                      : "hover:bg-row-hover",
                  )}
                >
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      className="min-h-11 w-full rounded text-left font-medium break-words hover:underline"
                      onClick={() => onSelect(employee)}
                      aria-label={"View " + employee.name}
                    >
                      {employee.name}
                      <span className="mt-0.5 block text-meta font-normal text-muted-foreground">
                        {employee.employeeNumber}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    <span className="block break-words">
                      {employee.departmentName}
                    </span>
                    <span className="mt-0.5 block text-meta break-words text-muted-foreground">
                      {employee.roleName}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-foreground-2">
                    {employee.countryName}
                  </td>
                  <td className="px-4 py-2 text-right font-medium whitespace-nowrap tabular-nums">
                    {formatMoney(employee.salaryMinor, employee.currency)}
                  </td>
                  <td className="py-2 pr-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={"Open " + employee.employeeNumber}
                      onClick={() => onSelect(employee)}
                    >
                      <ArrowRight aria-hidden />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="md:hidden">
        {loading ? (
          <EmployeeCardsSkeleton rows={rows} />
        ) : (
          <ul className="divide-y">
            {employees.map((employee) => (
              <li key={employee.id}>
                <button
                  type="button"
                  data-active={selectedId === employee.id || undefined}
                  className="flex min-h-40 w-full items-center justify-between gap-3 px-4 py-4 text-left hover:bg-row-hover data-active:bg-row-selected"
                  onClick={() => onSelect(employee)}
                  aria-label={"View " + employee.name}
                >
                  <span className="min-w-0">
                    <span className="block font-medium break-words">
                      {employee.name}
                    </span>
                    <span className="mt-1 block text-meta text-muted-foreground">
                      {employee.employeeNumber} · {employee.departmentName}
                    </span>
                    <span className="block text-meta text-muted-foreground">
                      {employee.countryName} · {employee.roleName}
                    </span>
                    <span className="mt-3 block font-medium break-words tabular-nums">
                      {formatMoney(employee.salaryMinor, employee.currency)}{" "}
                      <span className="text-meta font-normal text-muted-foreground">
                        / year
                      </span>
                    </span>
                  </span>
                  <ArrowRight className="size-4 shrink-0" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
