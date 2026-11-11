"use client";
import type { Employee } from "@/domain/employee";
import { formatMoney } from "@/domain/money";
export function EmployeeProfile({ employee }: { employee: Employee }) {
  return (
    <>
      <div className="flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl border bg-muted font-medium">
          {employee.name
            .split(" ")
            .slice(0, 2)
            .map((n) => n[0])
            .join("")}
        </span>
        <div>
          <h3 className="text-heading font-medium">{employee.name}</h3>
          <p className="text-meta text-muted-foreground">
            {employee.employeeNumber} · {employee.roleName}
          </p>
        </div>
      </div>
      <dl className="mt-6 grid grid-cols-2 gap-5 border-y py-5">
        {[
          ["Country", employee.countryName],
          ["Department", employee.departmentName],
          ["Pay currency", employee.currency],
          ["Pay period", "Annual"],
        ].map(([key, value]) => (
          <div key={key}>
            <dt className="text-meta text-muted-foreground">{key}</dt>
            <dd className="mt-1 font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6">
        <p className="text-meta text-muted-foreground">
          Current annual base salary
        </p>
        <p className="mt-1 break-words text-2xl font-medium tabular-nums">
          {formatMoney(employee.salaryMinor, employee.currency)}
        </p>
      </div>
      <p className="mt-4 text-meta text-muted-foreground">
        Updated{" "}
        {new Intl.DateTimeFormat("en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "UTC",
        }).format(new Date(employee.updatedAt))}{" "}
        UTC by {employee.updatedBy} · Version {employee.version}
      </p>
    </>
  );
}
