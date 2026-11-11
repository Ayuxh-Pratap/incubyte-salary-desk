"use client";
import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Popover } from "@base-ui/react/popover";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "./ui/button";
const subscribe = () => () => {};
export function ThemeToggle({
  compact = false,
  side = "right",
}: {
  compact?: boolean;
  side?: "right" | "bottom";
}) {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const { theme, setTheme } = useTheme();
  const Icon =
    mounted && theme === "dark"
      ? Moon
      : mounted && theme === "light"
        ? Sun
        : Monitor;
  const controls = (
    <div
      role="group"
      className="inline-flex rounded-lg bg-inset p-0.5 shadow-well"
      aria-label="Color theme"
    >
      {(
        [
          { value: "light", Icon: Sun },
          { value: "dark", Icon: Moon },
          { value: "system", Icon: Monitor },
        ] as const
      ).map(({ value, Icon }) => (
        <Button
          key={value}
          variant="ghost"
          size="icon"
          aria-label={value + " theme"}
          aria-pressed={mounted && theme === value}
          onClick={() => setTheme(value)}
          className="rounded-md aria-pressed:bg-card aria-pressed:text-foreground aria-pressed:shadow-panel"
        >
          <Icon aria-hidden />
        </Button>
      ))}
    </div>
  );
  if (!compact) return controls;
  return (
    <Popover.Root>
      <Popover.Trigger
        render={<Button variant="ghost" size="icon" aria-label="Appearance" />}
      >
        <Icon aria-hidden />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side={side} sideOffset={12} className="z-50">
          <Popover.Popup className="rounded-xl border bg-card p-2 text-foreground shadow-panel">
            <Popover.Title className="px-2 pt-1 pb-2 text-meta font-medium">
              Appearance
            </Popover.Title>
            {controls}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
