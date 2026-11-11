"use client";
import { useCallback, useEffect, useState } from "react";
type Remote<T> = {
  key?: string;
  data?: T;
  previous?: T;
  error?: string;
  loading: boolean;
};
export function useRemote<T>(url: string) {
  const [state, setState] = useState<Remote<T>>({ loading: true }),
    [revision, setRevision] = useState(0);
  const key = url + "#" + revision;
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setState((previous) => ({
        key,
        loading: true,
        previous: previous.data ?? previous.previous,
      }));
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          cache: "no-store",
        });
        const body = await response.json().catch(() => {
          throw new Error(
            "The server returned an unreadable response. Please retry.",
          );
        });
        if (!response.ok)
          throw new Error(
            response.status === 401
              ? "Your evaluator session has expired. Sign in again."
              : body.error || "Request failed.",
          );
        if (!controller.signal.aborted)
          setState({ key, data: body, loading: false });
      } catch (error) {
        if (!controller.signal.aborted)
          setState((previous) => ({
            key,
            previous: previous.data ?? previous.previous,
            error:
              error instanceof Error ? error.message : "Connection failed.",
            loading: false,
          }));
      }
    }
    void load();
    return () => controller.abort();
  }, [url, key]);
  return {
    ...(state.key === key ? state : { loading: true }),
    previousData: state.data ?? state.previous,
    reload: useCallback(() => setRevision((x) => x + 1), []),
  };
}
