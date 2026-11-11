"use client";
import type { Employee } from "@/domain/employee";
import { useRemote } from "./use-remote";
import { SalaryEditor } from "./salary-editor";
import { DetailSkeleton } from "./skeletons";
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
      <div role="status" aria-busy="true">
        <span className="sr-only">Loading current compensation…</span>
        <DetailSkeleton />
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
