"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Users,
  ChartNoAxesColumn,
  Layers,
  ArrowUpRight,
  LogOut,
} from "lucide-react";
import type { ReactNode } from "react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
const navigation = [
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/overview", label: "Salary overview", icon: ChartNoAxesColumn },
];
export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname(),
    router = useRouter();
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[228px_1fr]">
      <a
        href="#main"
        className="sr-only fixed z-50 rounded bg-primary p-3 text-primary-foreground focus:not-sr-only"
      >
        Skip to content
      </a>
      <aside className="flex flex-col border-b bg-background p-4 lg:sticky lg:top-0 lg:h-dvh lg:border-0 lg:p-5">
        <Link
          href="/employees"
          className="flex min-h-11 items-center gap-3 font-semibold tracking-tight"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Layers className="size-5" />
          </span>
          <span>
            Salary Desk
            <span className="block text-meta font-normal tracking-normal text-muted-foreground">
              ACME workspace
            </span>
          </span>
        </Link>
        <div className="mt-7 hidden text-meta font-medium uppercase tracking-wider text-muted-foreground lg:block">
          Workspace
        </div>
        <nav
          aria-label="Main navigation"
          className="mt-4 flex gap-2 lg:mt-2 lg:flex-col"
        >
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className={cn(
                "flex min-h-11 flex-1 items-center gap-2 rounded-lg px-3 text-ui font-medium text-foreground-2 hover:bg-muted lg:flex-none",
                pathname === href && "bg-muted text-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto hidden pt-8 lg:block">
          <div className="mb-4 rounded-xl border bg-card p-3 text-meta text-muted-foreground">
            <span className="mb-1 flex items-center gap-1 font-medium text-foreground">
              A clearer view of pay <ArrowUpRight className="size-3" />
            </span>
            Annual base salary.
            <br />
            Synthetic people. Real calculations.
          </div>
          <ThemeToggle />
          <Button
            aria-label="End evaluator session"
            variant="ghost"
            className="mt-3 w-full justify-start"
            onClick={async () => {
              await fetch("/api/session", { method: "DELETE" });
              router.push("/login");
              router.refresh();
            }}
          >
            <LogOut />
            End session
          </Button>
          <p className="mt-4 text-meta text-muted-foreground">
            Independent assessment concept.
            <br />
            Not an Incubyte internal system.
          </p>
        </div>
      </aside>
      <div className="min-w-0 lg:p-2 lg:pl-0">
        <main
          id="main"
          className="min-h-[calc(100dvh-120px)] bg-muted lg:min-h-[calc(100dvh-16px)] lg:rounded-2xl lg:border"
        >
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t p-4 text-meta text-muted-foreground lg:hidden">
            <span>Fictional ACME · Assessment concept</span>
            <ThemeToggle />
            <Button
              aria-label="End evaluator session"
              variant="ghost"
              onClick={async () => {
                await fetch("/api/session", { method: "DELETE" });
                router.push("/login");
                router.refresh();
              }}
            >
              End session
            </Button>
          </footer>
        </main>
      </div>
    </div>
  );
}
