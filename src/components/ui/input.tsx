"use client";
import { Input as Primitive } from "@base-ui/react/input";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <Primitive
      {...props}
      className={cn(
        "min-h-11 w-full min-w-0 rounded-lg border border-control-border bg-card shadow-well px-3 text-base text-foreground placeholder:text-muted-foreground disabled:opacity-50 aria-invalid:border-destructive md:text-ui",
        className,
      )}
    />
  );
}
