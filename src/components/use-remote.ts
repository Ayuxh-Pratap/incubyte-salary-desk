"use client";
import { useCallback, useEffect, useState } from "react";
export function useRemote<T>(url: string) {
  const [state, setState] = useState<{
      key?: string;
      data?: T;
      error?: string;
      loading: boolean;
    }>({ loading: true }),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setState({ key: url, loading: true });
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          cache: "no-store",
        });
        const body = await response.json();
        if (!response.ok)
          throw new Error(
            response.status === 401
              ? "Your evaluator session has expired. Sign in again."
              : body.error || "Request failed.",
          );
        if (!controller.signal.aborted)
          setState({ key: url, data: body, loading: false });
      } catch (error) {
        if (!controller.signal.aborted)
          setState({
            key: url,
            error:
              error instanceof Error ? error.message : "Connection failed.",
            loading: false,
          });
      }
    }
    void load();
    return () => controller.abort();
  }, [url, revision]);
  return {
    ...(state.key === url ? state : { loading: true }),
    reload: useCallback(() => setRevision((x) => x + 1), []),
  };
}
