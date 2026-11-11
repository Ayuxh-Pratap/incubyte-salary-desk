"use client";
import { Select } from "@animate-ui/react/primitives/base-ui/select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
export type SelectOption = { value: string; label: string; disabled?: boolean };
export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  disabled,
  className,
  name,
  form,
}: {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  className?: string;
  name?: string;
  form?: string;
}) {
  return (
    <Select.Root
      value={value}
      onValueChange={(v) => {
        if (v !== null) onChange(v);
      }}
      items={options}
      disabled={disabled}
      name={name}
      form={form}
    >
      <Select.Trigger
        id={id}
        aria-label={label}
        className={cn(
          "inline-flex min-h-11 min-w-0 items-center justify-between gap-3 rounded-md border border-input bg-card px-3 text-left text-ui text-card-foreground shadow-well transition-colors duration-fast disabled:opacity-50",
          className,
        )}
      >
        <Select.Value className="truncate" />
        <Select.Icon>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner
          sideOffset={6}
          alignItemWithTrigger={false}
          className="z-60 outline-none"
        >
          <Select.Popup className="max-h-(--available-height) min-w-(--anchor-width) max-w-[calc(100vw-24px)] origin-(--transform-origin) overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-popover">
            <Select.List className="scroll-lean max-h-[min(320px,var(--available-height))] overflow-y-auto">
              {options.map((o) => (
                <Select.Item
                  key={o.value}
                  value={o.value}
                  disabled={o.disabled}
                  className="relative flex min-h-11 cursor-default items-center gap-2 rounded-md py-2 pr-8 pl-3 text-ui transition-colors duration-fast data-highlighted:bg-muted data-disabled:opacity-40"
                >
                  <Select.ItemText>{o.label}</Select.ItemText>
                  <Select.ItemIndicator className="absolute right-2">
                    <Check className="size-4" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
