"use client";
import { useId, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
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
  const groupId = useId(),
    reduced = useReducedMotion();
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
    <LayoutGroup id={groupId}>
      <div
        role="group"
        className="inline-flex gap-0.5 rounded-md bg-inset p-0.5 shadow-well"
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
            className="relative isolate size-7 min-h-7 rounded-[5px] p-0 aria-pressed:text-foreground [&_svg]:size-3.5"
          >
            {mounted && theme === value && (
              <motion.span
                layoutId="selected-theme"
                aria-hidden
                className="absolute inset-0 -z-10 rounded-md bg-card shadow-panel"
                transition={{
                  duration: reduced ? 0 : 0.24,
                  ease: [0.2, 0, 0, 1],
                }}
              />
            )}
            <Icon aria-hidden />
          </Button>
        ))}
      </div>
    </LayoutGroup>
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
          <Popover.Popup className="rounded-xl bg-card p-2 text-foreground shadow-panel">
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
