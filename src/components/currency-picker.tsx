"use client";
import { useState, type FormEvent } from "react";
import { CURRENCIES } from "@/domain/money";
import { SelectField } from "./ui/select";
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
        <SelectField
          name="currency"
          label="Dashboard pay currency"
          value={value}
          onChange={(next) =>
            setDraft((previous) => ({ ...previous, value: next }))
          }
          options={Object.keys(CURRENCIES).map((code) => ({
            value: code,
            label: code,
          }))}
        />
      </label>
      <Button type="submit" variant="outline" aria-busy={pending}>
        Apply currency
      </Button>
    </form>
  );
}
