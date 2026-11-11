"use client";
import {
  createContext,
  useContext,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";
import { ReadCache } from "@/lib/read-cache";
const clientId = globalThis.crypto.randomUUID();
const Context = createContext<ReadCache | null>(null);
export function RemoteProvider({
  scope,
  children,
}: {
  scope: string;
  children: ReactNode;
}) {
  const cache = useMemo(
    () =>
      new ReadCache(scope, async (url, signal) => {
        const response = await fetch(url, {
          signal,
          cache: "no-store",
          credentials: "same-origin",
        });
        const body = await response.json().catch(() => {
          throw new Error(
            "The server returned an unreadable response. Please retry.",
          );
        });
        if (!response.ok) {
          if (response.status === 401) cache.clear(true);
          throw new Error(
            response.status === 401
              ? "Your evaluator session has expired. Sign in again."
              : body.error || "Request failed.",
          );
        }
        return body;
      }),
    [scope],
  );
  useEffect(() => {
    const channel = new BroadcastChannel("salary-desk-" + scope);
    channel.onmessage = (e) => {
      if (e.data.source === clientId) return;
      if (e.data.type === "salary") cache.invalidateSalary();
      if (e.data.type === "logout") {
        cache.clear();
        window.location.replace("/login");
      }
    };
    return () => {
      channel.close();
      cache.clear();
    };
  }, [cache, scope]);
  return <Context.Provider value={cache}>{children}</Context.Provider>;
}
export function useReadCache() {
  const cache = useContext(Context);
  if (!cache)
    throw new Error("Protected reads require a workspace cache scope");
  return cache;
}
export function publishCacheEvent(scope: string, event: "salary" | "logout") {
  const channel = new BroadcastChannel("salary-desk-" + scope);
  channel.postMessage({ type: event, source: clientId });
  channel.close();
}
