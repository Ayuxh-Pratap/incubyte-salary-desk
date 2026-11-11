"use client";
import type { Employee } from "@/domain/employee";
import { useRemote } from "./use-remote";
import { SalaryEditor } from "./salary-editor";
import { Button } from "./ui/button";
export function EmployeeDetail({
  id,
  onSaved,
  onDirtyChange,
}: {
  id: number;
  onSaved: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const current = useRemote<Employee>("/api/employees/" + id);
  if (current.loading)
    return (
      <div role="status" className="space-y-3">
        <p>Loading current compensation…</p>
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  if (current.error)
    return (
      <div role="alert">
        <p>{current.error}</p>
        <Button variant="outline" className="mt-4" onClick={current.reload}>
          Try again
        </Button>
      </div>
    );
  return current.data ? (
    <SalaryEditor
      key={id}
      employee={current.data}
      onSaved={onSaved}
      onDirtyChange={onDirtyChange}
    />
  ) : null;
}
