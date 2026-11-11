"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Users,
  ChartNoAxesColumn,
  Layers,
  LogOut,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Info,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/overview", label: "Salary overview", icon: ChartNoAxesColumn },
];
export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname(),
    router = useRouter(),
    reduced = useReducedMotion();
  const [collapsed, setCollapsed] = useState(false),
    [ending, setEnding] = useState(false),
    [error, setError] = useState("");
  async function endSession() {
    setEnding(true);
    setError("");
    try {
      const response = await fetch("/api/session", { method: "DELETE" });
      if (!response.ok) throw new Error();
      router.push("/login");
      router.refresh();
    } catch {
      setError("We could not end your session. Please try again.");
    } finally {
      setEnding(false);
    }
  }
  const logout = (compact = false) => (
    <Button
      variant="ghost"
      size={compact ? "icon" : "default"}
      aria-label="End evaluator session"
      title="End session"
      loading={ending}
      onClick={endSession}
    >
      <LogOut aria-hidden />
      {!compact && <span>End session</span>}
    </Button>
  );
  return (
    <motion.div
      animate={{
        gridTemplateColumns: collapsed
          ? "64px minmax(0,1fr)"
          : "224px minmax(0,1fr)",
      }}
      transition={{ duration: reduced ? 0 : 0.24, ease: [0.2, 0, 0, 1] }}
      className="flex h-dvh flex-col overflow-hidden bg-background text-foreground transition-colors duration-200 lg:grid"
    >
      <a
        href="#main"
        className="sr-only fixed z-50 rounded bg-primary p-3 text-primary-foreground focus:not-sr-only"
      >
        Skip to content
      </a>
      <aside
        aria-label="Desktop navigation"
        className="hidden min-h-0 flex-col overflow-y-auto p-2 transition-colors duration-200 lg:flex"
      >
        <div
          className={cn(
            "flex min-h-14 items-center gap-1",
            collapsed ? "flex-col py-2" : "px-2",
          )}
        >
          <Link
            href="/dashboard"
            aria-label="Salary Desk dashboard"
            className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-lg"
            title="Salary Desk · Fictional ACME assessment"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Layers className="size-4" aria-hidden />
            </span>
            <motion.span
              aria-hidden
              animate={{
                opacity: collapsed ? 0 : 1,
                width: collapsed ? 0 : "auto",
              }}
              transition={{ duration: reduced ? 0 : 0.18 }}
              className="overflow-hidden text-ui font-semibold whitespace-nowrap"
            >
              Salary Desk
            </motion.span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? (
              <PanelLeftOpen aria-hidden />
            ) : (
              <PanelLeftClose aria-hidden />
            )}
          </Button>
        </div>
        <nav
          aria-label="Main navigation"
          className="mt-4 flex min-w-0 flex-col gap-1"
        >
          {navigation.map(({ href, label, icon: Icon }, i) => (
            <div key={href}>
              {i === 1 && (
                <p
                  className={cn(
                    "mt-5 mb-2 px-3 text-meta text-muted-foreground",
                    collapsed && "sr-only",
                  )}
                >
                  Workspace
                </p>
              )}
              <Link
                href={href}
                aria-label={label}
                aria-current={pathname === href ? "page" : undefined}
                title={collapsed ? label : undefined}
                className={cn(
                  "flex min-h-11 items-center rounded-lg px-3 text-ui font-medium text-foreground-2 transition-colors duration-200 hover:bg-inset hover:text-foreground",
                  collapsed ? "justify-center" : "gap-3",
                  pathname === href && "bg-inset text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <motion.span
                  aria-hidden
                  animate={{
                    opacity: collapsed ? 0 : 1,
                    width: collapsed ? 0 : "auto",
                  }}
                  transition={{ duration: reduced ? 0 : 0.18 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  {label}
                </motion.span>
              </Link>
            </div>
          ))}
        </nav>
        <div
          className={cn(
            "mt-auto pt-6",
            collapsed ? "flex flex-col items-center gap-1" : "px-1",
          )}
        >
          <div
            className={cn(
              "flex items-center",
              collapsed ? "flex-col" : "justify-between gap-1",
            )}
          >
            <ThemeToggle compact={collapsed} />
            {logout(true)}
          </div>
          {error && (
            <p role="alert" className="mt-2 px-1 text-meta text-destructive">
              {error}
            </p>
          )}
          <p
            className={cn(
              "px-1 py-3 text-meta leading-relaxed text-muted-foreground",
              collapsed && "text-center",
            )}
            title="Fictional ACME. Independent assessment concept, not an Incubyte internal system."
          >
            {collapsed ? (
              <>
                <Info className="mx-auto size-4" aria-hidden />
                <span className="sr-only">
                  Fictional ACME. Independent assessment concept, not an
                  Incubyte internal system.
                </span>
              </>
            ) : (
              <>
                Fictional ACME · Assessment
                <br />
                <span>Not an Incubyte system.</span>
              </>
            )}
          </p>
        </div>
      </aside>
      <header className="shrink-0 border-b px-4 pt-3 lg:hidden">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/dashboard"
            className="inline-flex min-h-11 items-center gap-2 font-semibold"
          >
            <Layers className="size-5 text-primary" aria-hidden />
            Salary Desk
            <span className="text-meta font-normal text-muted-foreground">
              ACME
            </span>
          </Link>
          <div className="flex shrink-0 items-center">
            <ThemeToggle compact side="bottom" />
            {logout(true)}
          </div>
        </div>
        {error && (
          <p role="alert" className="pb-2 text-meta text-destructive">
            {error}
          </p>
        )}
        <nav aria-label="Main navigation" className="mt-1 flex gap-1 pb-2">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              aria-current={pathname === href ? "page" : undefined}
              href={href}
              className={cn(
                "flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg px-1 text-meta font-medium text-foreground-2",
                pathname === href && "bg-inset text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <main
        id="main"
        tabIndex={-1}
        className="scroll-lean flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-muted transition-colors duration-200 lg:mt-3 lg:h-[calc(100dvh-12px)] lg:rounded-tl-2xl lg:border-t lg:border-l"
      >
        <div className="w-full min-w-0 flex-1 p-4 md:p-6">{children}</div>
        <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t p-4 text-meta text-muted-foreground lg:hidden">
          <span className="w-full">
            Fictional ACME · Independent assessment concept
          </span>
        </footer>
      </main>
    </motion.div>
  );
}
