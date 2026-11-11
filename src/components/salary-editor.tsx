"use client";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Check, TriangleAlert } from "lucide-react";
import type { Employee } from "@/domain/employee";
import {
  changePreview,
  parseSalary,
  salaryInput,
  formatMoney,
} from "@/domain/money";
import { EmployeeProfile } from "./employee-profile";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
export function SalaryEditor({
  employee,
  onSaved,
  onDirtyChange,
}: {
  employee: Employee;
  onSaved: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [current, setCurrent] = useState(employee),
    [amount, setAmount] = useState(
      salaryInput(employee.salaryMinor, employee.currency),
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [notice, setNotice] = useState(""),
    [conflict, setConflict] = useState<Employee | null>(null),
    [touched, setTouched] = useState(false);
  let minor: bigint | undefined,
    validation = "";
  try {
    minor = parseSalary(amount, current.currency);
  } catch (error) {
    validation = error instanceof Error ? error.message : "Invalid amount.";
  }
  const changed = minor?.toString() !== current.salaryMinor,
    dirty = amount !== salaryInput(current.salaryMinor, current.currency);
  const preview = minor
    ? changePreview(current.salaryMinor, minor.toString(), current.currency)
    : null;
  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    setSuccess("");
    setNotice("");
    if (validation || !minor || !changed || conflict) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/employees/" + current.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency: current.currency,
          period: current.period,
          version: current.version,
        }),
      });
      const body = await response.json();
      if (!response.ok) {
        setError(
          body.error || "Save could not be confirmed. Your input is preserved.",
        );
        if (response.status === 409 && body.details?.current)
          setConflict(body.details.current);
        return;
      }
      const updated = body as Employee;
      setCurrent(updated);
      setAmount(salaryInput(updated.salaryMinor, updated.currency));
      setTouched(false);
      setSuccess(
        "Salary saved. Current annual base salary is " +
          formatMoney(updated.salaryMinor, updated.currency) +
          ".",
      );
      onSaved();
    } catch {
      setError(
        "Save could not be confirmed. Your input is preserved. Check the latest value before retrying.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <EmployeeProfile employee={current} />
      <form onSubmit={submit} className="mt-7 border-t pt-6">
        <h3 className="font-semibold">Update annual base salary</h3>
        <p className="mt-1 text-meta text-muted-foreground">
          Change the current value. No payroll payment or scheduled change is
          created.
        </p>
        <label
          htmlFor="salary-amount"
          className="mt-5 block text-ui font-medium"
        >
          New annual salary ({current.currency})
        </label>
        <Input
          id="salary-amount"
          className="mt-2 font-mono tabular-nums"
          inputMode="decimal"
          autoComplete="off"
          value={amount}
          maxLength={24}
          disabled={busy}
          onChange={(event) => {
            setAmount(event.target.value);
            setTouched(true);
            setError("");
            setSuccess("");
            setNotice("");
          }}
          aria-invalid={touched && !!validation}
          aria-describedby={
            touched && validation ? "salary-validation" : "salary-help"
          }
        />
        <p id="salary-help" className="mt-2 text-meta text-muted-foreground">
          Positive decimal amount, without commas. Currency and annual period
          stay fixed.
        </p>
        {touched && validation && (
          <p
            id="salary-validation"
            role="alert"
            className="mt-2 text-destructive"
          >
            {validation}
          </p>
        )}
        {preview && changed && (
          <section
            aria-label="Salary change preview"
            className="mt-5 rounded-xl border bg-muted p-4"
          >
            <p className="text-meta font-medium uppercase tracking-wider text-muted-foreground">
              Change preview · {current.currency} / year
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-2 tabular-nums">
              <span>{formatMoney(current.salaryMinor, current.currency)}</span>
              <ArrowRight className="size-4" />
              <span className="font-semibold">
                {formatMoney(minor!.toString(), current.currency)}
              </span>
            </p>
            <p className="mt-2 text-ui font-medium">
              {preview.absolute} · {preview.percentage}{" "}
              <span className="font-normal text-muted-foreground">
                ({preview.direction})
              </span>
            </p>
            <p className="mt-2 text-meta text-muted-foreground">
              Percentage = change ÷ current salary × 100; rounded half up to 2
              decimals.
            </p>
          </section>
        )}
        {error && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-destructive p-3 text-destructive"
          >
            <p className="flex items-start gap-2">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
            {conflict && (
              <>
                <p className="mt-2 text-ui">
                  Latest salary:{" "}
                  {formatMoney(conflict.salaryMinor, conflict.currency)} ·
                  Version {conflict.version}. Your proposed amount remains in
                  the field.
                </p>
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={() => {
                    setCurrent(conflict);
                    setConflict(null);
                    setError("");
                    setNotice(
                      "Latest value loaded. Review your retained proposal and the updated preview before saving.",
                    );
                  }}
                >
                  Review against latest
                </Button>
              </>
            )}
          </div>
        )}
        {notice && (
          <p role="status" className="mt-4 text-foreground-2">
            {notice}
          </p>
        )}
        {success && (
          <p role="status" className="mt-4 flex items-start gap-2 text-success">
            <Check className="mt-0.5 size-4 shrink-0" />
            {success}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            type="submit"
            loading={busy}
            disabled={!!validation || !changed || !!conflict}
          >
            Save salary
          </Button>
          <Button
            variant="outline"
            disabled={busy || !dirty}
            onClick={() => {
              setAmount(salaryInput(current.salaryMinor, current.currency));
              setTouched(false);
              setError("");
              setSuccess("");
              setNotice("");
            }}
          >
            Discard changes
          </Button>
        </div>
        <p className="mt-4 text-meta text-muted-foreground">
          This save is checked against version {current.version}. Concurrent
          updates are rejected for review.
        </p>
      </form>
    </>
  );
}
