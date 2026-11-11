"use client";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useReadCache } from "./remote-provider";
export function useRemote<T>(url: string) {
  const cache = useReadCache(),
    [previous, setPrevious] = useState<T | undefined>(undefined);
  const read = useCallback(() => cache.read(url), [cache, url]);
  const subscribe = useCallback(
    (listener: () => void) => cache.subscribe(url, listener),
    [cache, url],
  );
  const state = useSyncExternalStore(subscribe, read, read);
  const data = state.data as T | undefined;
  if (data !== undefined && data !== previous) setPrevious(data);
  useEffect(() => {
    void cache.load(url);
    const revalidate = () => {
      if (document.visibilityState === "visible") void cache.load(url);
    };
    window.addEventListener("focus", revalidate);
    document.addEventListener("visibilitychange", revalidate);
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (!state.error)
      timer = setTimeout(
        () => {
          if (document.visibilityState === "visible") void cache.load(url);
        },
        Math.max(100, cache.ttl(url) - (Date.now() - (state.at ?? 0)) + 10),
      );
    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", revalidate);
      document.removeEventListener("visibilitychange", revalidate);
    };
  }, [cache, url, state.at, state.error]);
  return {
    data,
    loading: state.loading,
    error: state.error,
    refreshing: state.refreshing,
    previousData: data ?? previous,
    reload: useCallback(() => {
      void cache.load(url, true);
    }, [cache, url]),
  };
}
