"use client";
import type { Filters } from "@/domain/filters";
import { filterQuery } from "@/domain/analysis";
export function useWorkspaceNavigation(
  path: string,
  filters: Filters,
  reload: () => void,
) {
  function navigate(next: Filters) {
    const query = filterQuery(next);
    if (query === filterQuery(filters)) {
      reload();
      return;
    }
    window.history.pushState(null, "", path + "?" + query);
  }
  return { pending: false, navigate };
}
