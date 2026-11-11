"use client";
import { useReadCache, publishCacheEvent } from "./remote-provider";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, type ReactNode } from "react";
import { motion, LayoutGroup, useReducedMotion } from "motion/react";
import {
  Users,
  ChartNoAxesColumn,
  Layers,
  LogOut,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Info,
  BookOpen,
} from "lucide-react";
import { LinkPending } from "./link-pending";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { PRESENTATION_SECTIONS, presentationHref } from "@/lib/presentation";
const workspace = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/overview", label: "Salary overview", icon: ChartNoAxesColumn },
];
const navigation = [
  ...workspace,
  ...PRESENTATION_SECTIONS.map((section) => ({
    href: presentationHref(section.slug),
    label: section.navLabel,
    icon: BookOpen,
  })),
];
export function Shell({
  children,
  initialCollapsed = false,
}: {
  children: ReactNode;
  initialCollapsed?: boolean;
}) {
  const cache = useReadCache();
  const pathname = usePathname(),
    router = useRouter(),
    reduced = useReducedMotion();
  const [collapsed, setCollapsed] = useState(initialCollapsed),
    [ending, setEnding] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    document.cookie =
      "salary-desk-sidebar=" +
      String(collapsed) +
      "; path=/; max-age=2592000; SameSite=Strict";
  }, [collapsed]);
  useEffect(() => {
    const toggle = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        setCollapsed((v) => !v);
      }
    };
    window.addEventListener("keydown", toggle);
    return () => window.removeEventListener("keydown", toggle);
  }, []);
  async function endSession() {
    setEnding(true);
    setError("");
    try {
      const response = await fetch("/api/session", { method: "DELETE" });
      if (!response.ok) throw new Error();
      cache.clear(true);
      publishCacheEvent(cache.scope, "logout");
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
          : "240px minmax(0,1fr)",
      }}
      transition={{ duration: reduced ? 0 : 0.24, ease: [0.2, 0, 0, 1] }}
      className="flex h-dvh flex-col overflow-hidden bg-canvas text-foreground transition-colors duration-200 lg:grid"
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
        <div className="flex min-h-14 items-center gap-1">
          <Link
            href="/dashboard"
            prefetch={!pathname.startsWith("/presentation")}
            aria-label="Salary Desk dashboard"
            aria-hidden={collapsed || undefined}
            tabIndex={collapsed ? -1 : undefined}
            className={cn(
              "flex min-h-11 min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-lg transition-opacity duration-200",
              collapsed && "invisible opacity-0",
            )}
            title="Salary Desk · Fictional ACME assessment"
          >
            <span
              aria-hidden
              className="ml-2 grid size-6 shrink-0 place-items-center rounded-[6px] bg-foreground shadow-button"
            >
              <span className="flex w-3 flex-col gap-[2px]">
                <span className="h-[2px] w-2 rounded-full bg-background/60" />
                <span className="h-[2px] w-2 rounded-full bg-background/60" />
                <span className="h-[2px] w-3 rounded-full bg-primary" />
              </span>
            </span>
            <motion.span
              aria-hidden
              animate={{
                opacity: collapsed ? 0 : 1,
                width: collapsed ? 0 : "auto",
              }}
              transition={{ duration: reduced ? 0 : 0.18 }}
              className="overflow-hidden text-ui font-medium whitespace-nowrap"
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
        <LayoutGroup id="desktop-navigation">
          <nav
            aria-label="Main navigation"
            className="mt-4 flex min-w-0 flex-col gap-1"
          >
            {navigation.map(({ href, label, icon: Icon }, i) => (
              <div key={href}>
                {(i === 0 || i === 3) && (
                  <p
                    className={cn(
                      "mt-5 mb-2 px-3 text-meta text-muted-foreground",
                      collapsed && "opacity-0",
                    )}
                  >
                    {i === 0 ? "Workspace" : "Presentation"}
                  </p>
                )}
                <Link
                  href={href}
                  prefetch={
                    !pathname.startsWith("/presentation") &&
                    !href.startsWith("/presentation")
                  }
                  aria-label={label}
                  aria-current={
                    pathname === href ||
                    (href !== "/presentation" &&
                      pathname.startsWith(href + "/"))
                      ? "page"
                      : undefined
                  }
                  title={collapsed ? label : undefined}
                  className={cn(
                    "relative isolate flex min-h-11 items-center gap-3 overflow-hidden rounded-lg px-4 text-ui font-medium text-foreground-2 transition-colors duration-fast hover:bg-inset hover:text-foreground",
                    (pathname === href ||
                      (href !== "/presentation" &&
                        pathname.startsWith(href + "/"))) &&
                      "text-foreground",
                  )}
                >
                  {(pathname === href ||
                    (href !== "/presentation" &&
                      pathname.startsWith(href + "/"))) && (
                    <motion.span
                      layoutId="active"
                      aria-hidden
                      className="absolute inset-0 -z-10 rounded-lg bg-sidebar-accent"
                      transition={{
                        duration: reduced ? 0 : 0.24,
                        ease: [0.2, 0, 0, 1],
                      }}
                    />
                  )}
                  <LinkPending />
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
        </LayoutGroup>
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
            className="inline-flex min-h-11 items-center gap-2 font-medium"
          >
            <Layers className="size-5 text-primary" aria-hidden />
            Salary Desk
            <span className="hidden text-meta font-normal text-muted-foreground sm:inline">
              ACME
            </span>
          </Link>
          <div className="flex shrink-0 items-center">
            <Link
              href="/presentation"
              prefetch={false}
              aria-label="Engineering presentation"
              className="grid size-11 place-items-center rounded-lg hover:bg-inset"
            >
              <BookOpen className="size-4" aria-hidden />
            </Link>
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
          {workspace.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              aria-current={
                pathname === href ||
                (href !== "/presentation" && pathname.startsWith(href + "/"))
                  ? "page"
                  : undefined
              }
              href={href}
              prefetch={!pathname.startsWith("/presentation")}
              className={cn(
                "flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg px-1 text-meta font-medium text-foreground-2",
                (pathname === href ||
                  (href !== "/presentation" &&
                    pathname.startsWith(href + "/"))) &&
                  "bg-inset text-foreground",
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
        className="scroll-lean flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-background transition-colors duration-200 lg:mt-3 lg:h-[calc(100dvh-12px)] lg:rounded-tl-2xl lg:border-t lg:border-l"
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
