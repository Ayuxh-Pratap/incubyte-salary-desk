"use client";
import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "./ui/button";
const subscribe = () => () => {};
export function ThemeToggle() {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const { theme, setTheme } = useTheme();
  return (
    <div
      className="inline-flex rounded-xl border bg-card p-1"
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
          className="aria-pressed:bg-muted aria-pressed:text-foreground"
        >
          <Icon />
        </Button>
      ))}
    </div>
  );
}
