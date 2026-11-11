"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Filters } from "@/domain/filters";
import { filterQuery } from "@/domain/analysis";
export function useWorkspaceNavigation(
  path: string,
  filters: Filters,
  reload: () => void,
) {
  const router = useRouter(),
    [pending, startTransition] = useTransition();
  function navigate(next: Filters) {
    const query = filterQuery(next);
    if (query === filterQuery(filters)) {
      reload();
      return;
    }
    startTransition(() => router.push(path + "?" + query, { scroll: false }));
  }
  return { pending, navigate };
}
