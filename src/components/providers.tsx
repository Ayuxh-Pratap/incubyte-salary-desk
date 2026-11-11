"use client";
import { ThemeProvider } from "next-themes";
import { AnimateUIProvider } from "@animate-ui/react/provider";
import type { ReactNode } from "react";
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AnimateUIProvider reducedMotion="user">{children}</AnimateUIProvider>
    </ThemeProvider>
  );
}
