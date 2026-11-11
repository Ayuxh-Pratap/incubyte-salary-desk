"use client";
import { useState, type FormEvent } from "react";
import { CURRENCIES } from "@/domain/money";
import { Button } from "./ui/button";
export function CurrencyPicker({
  currency,
  pending,
  onApply,
}: {
  currency: string;
  pending: boolean;
  onApply: (currency: string) => void;
}) {
  const [draft, setDraft] = useState<{
    source: string;
    value: string;
    submitted?: string;
  }>({ source: currency, value: currency });
  let value = draft.value;
  if (draft.source !== currency) {
    value =
      draft.submitted === currency && draft.value !== draft.submitted
        ? draft.value
        : currency;
    setDraft({ source: currency, value });
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDraft({ source: currency, value, submitted: value });
    onApply(value);
  }
  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
      <label className="space-y-1 text-meta text-foreground-2">
        <span className="block">Pay currency</span>
        <select
          name="currency"
          aria-label="Dashboard pay currency"
          value={value}
          onChange={(e) =>
            setDraft((previous) => ({ ...previous, value: e.target.value }))
          }
          className="min-h-11 rounded-lg border border-control-border bg-card px-3 text-ui shadow-well"
        >
          {Object.keys(CURRENCIES).map((code) => (
            <option key={code}>{code}</option>
          ))}
        </select>
      </label>
      <Button type="submit" variant="outline" aria-busy={pending}>
        Apply currency
      </Button>
    </form>
  );
}
