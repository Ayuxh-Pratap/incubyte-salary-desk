import { it, expect } from "vitest";
import { ReadCache } from "./read-cache";
it("deduplicates concurrent reads and reuses fresh results only in one access scope", async () => {
  let calls = 0;
  let now = 100;
  const fetcher = async () => {
    calls++;
    return { employees: [1] };
  };
  const a = new ReadCache("a", fetcher, () => now),
    b = new ReadCache("b", fetcher, () => now);
  await Promise.all([
    a.load("/api/employees?page=1"),
    a.load("/api/employees?page=1"),
  ]);
  await a.load("/api/employees?page=1");
  expect(calls).toBe(1);
  await b.load("/api/employees?page=1");
  expect(calls).toBe(2);
  await a.load("/api/employees?page=2");
  expect(calls).toBe(3);
  now += 31000;
  await a.load("/api/employees?page=1");
  expect(calls).toBe(4);
});
it("does not let an obsolete response repopulate invalidated salary views", async () => {
  let resolve!: (v: unknown) => void;
  const cache = new ReadCache(
    "a",
    () =>
      new Promise((r) => {
        resolve = r;
      }),
  );
  const pending = cache.load("/api/analysis?currency=USD");
  cache.invalidateSalary();
  resolve({ total: "old" });
  await pending;
  expect(cache.read("/api/analysis?currency=USD").data).toBeUndefined();
});
it("keeps lookups on salary invalidation, drops detail and analysis, and clears everything on signout", async () => {
  const cache = new ReadCache("a", async (url) => ({ url }));
  for (const u of [
    "/api/catalog",
    "/api/dashboard?currency=USD",
    "/api/employees/1",
  ])
    await cache.load(u);
  cache.invalidateSalary();
  expect(cache.read("/api/catalog").data).toBeDefined();
  expect(cache.read("/api/employees/1").data).toBeUndefined();
  expect(cache.read("/api/dashboard?currency=USD").data).toBeUndefined();
  cache.clear();
  expect(cache.read("/api/catalog").data).toBeUndefined();
});
it("bounds query combinations and expires old data while allowing a short stale revalidation window", async () => {
  let now = 1;
  const cache = new ReadCache(
    "a",
    async () => ({ count: 1 }),
    () => now,
  );
  await cache.load("/api/employees/1");
  now += 16000;
  expect(cache.read("/api/employees/1").data).toBeDefined();
  now += 120001;
  expect(cache.read("/api/employees/1").data).toBeUndefined();
  for (let i = 0; i < 40; i++) await cache.load("/api/employees?page=" + i);
  expect(cache.size).toBeLessThanOrEqual(24);
});

it("denies cached data and new reads after session expiry, until a fresh scope is created", async () => {
  let calls = 0;
  const cache = new ReadCache("expired", async () => {
    calls++;
    return { salary: "100" };
  });
  await cache.load("/api/employees/1");
  cache.clear(true);
  expect(cache.read("/api/employees/1").data).toBeUndefined();
  expect(cache.read("/api/employees/1").error).toMatch(/expired/);
  await cache.load("/api/employees/1", true);
  expect(calls).toBe(1);
});

it("notifies only subscribers to the changed query, while invalidation reaches affected active views", async () => {
  const cache = new ReadCache("scope", async () => ({ value: 1 }));
  let dashboard = 0,
    catalog = 0;
  const remove = cache.subscribe(
    "/api/dashboard?currency=USD",
    () => dashboard++,
  );
  cache.subscribe("/api/catalog", () => catalog++);
  await cache.load("/api/catalog");
  expect(catalog).toBe(2);
  expect(dashboard).toBe(0);
  await cache.load("/api/dashboard?currency=USD");
  expect(dashboard).toBe(2);
  cache.invalidateSalary();
  expect(dashboard).toBe(3);
  remove();
  await cache.load("/api/dashboard?currency=USD", true);
  expect(dashboard).toBe(3);
});
