"use client";
import { useId, useState, type FormEvent } from "react";
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
  const id = useId();
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
    <form
      onSubmit={submit}
      className="flex max-w-full min-w-0 flex-wrap items-end gap-2"
    >
      <div className="grid min-w-0 gap-1 text-meta text-foreground-2">
        <label htmlFor={id}>Pay currency</label>
        <SelectField
          id={id}
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
      </div>
      <Button
        type="submit"
        variant="outline"
        className="max-w-full whitespace-normal"
        aria-busy={pending}
      >
        Apply currency
      </Button>
    </form>
  );
}
