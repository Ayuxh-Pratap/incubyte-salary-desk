"use client";
import { useLinkStatus } from "next/link";
export function LinkPending() {
  const { pending } = useLinkStatus();
  return pending ? (
    <span
      data-pending
      aria-hidden
      className="pointer-events-none absolute inset-0 animate-pulse rounded-[inherit] bg-foreground/8"
    />
  ) : null;
}
