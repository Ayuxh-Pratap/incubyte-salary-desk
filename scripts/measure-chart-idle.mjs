import { chromium, expect } from "@playwright/test";
import { config } from "dotenv";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
config({ path: ".env.local", quiet: true });
const phase = process.argv[2] || "before",
  b = await chromium.launch(),
  c = await b.newContext({
    baseURL: "http://localhost:3300",
    viewport: { width: 1366, height: 900 },
    reducedMotion: "no-preference",
  });
await c.addInitScript(() => {
  const original = HTMLCanvasElement.prototype.getContext,
    records = [];
  window.__canvasProbe = records;
  HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
    const ctx = original.call(this, kind, ...args);
    if (kind === "2d" && ctx) {
      let record = records.find((r) => r.canvas === this);
      if (!record) {
        record = { canvas: this, contexts: 0, clears: 0 };
        records.push(record);
        const clear = ctx.clearRect;
        ctx.clearRect = function (...args) {
          record.clears++;
          return clear.apply(this, args);
        };
      }
      record.contexts++;
    }
    return ctx;
  };
});
await c.request.post("/api/session", {
  headers: { Origin: "http://localhost:3300" },
  data: { password: process.env.EVALUATOR_PASSWORD },
});
const p = await c.newPage();
let requests = [];
const external = new Set();
p.on("request", (r) => {
  const url = new URL(r.url());
  if (url.origin !== "http://localhost:3300") external.add(url.origin);
  if (url.pathname.startsWith("/api/"))
    requests.push({
      at: Date.now(),
      method: r.method(),
      path: url.pathname + url.search,
    });
});
await p.goto("/dashboard?currency=USD");
await expect(p.locator("canvas")).toHaveCount(3, { timeout: 30000 });
await expect(p.locator('[aria-busy="true"]')).toHaveCount(0, {
  timeout: 30000,
});
await p.waitForTimeout(1000);
const observations = [];
async function observe(name) {
  const charts = await p.evaluate(() =>
    window.__canvasProbe.map((r) => ({
      label: r.canvas.getAttribute("aria-label"),
      connected: r.canvas.isConnected,
      contexts: r.contexts,
      clears: r.clears,
      width: r.canvas.width,
      height: r.canvas.height,
    })),
  );
  observations.push({ name, at: Date.now(), charts, requests: [...requests] });
  console.log(
    phase +
      " " +
      name +
      ": " +
      charts
        .filter((x) => x.connected)
        .map((x) => x.contexts)
        .join("/") +
      " contexts; " +
      requests.length +
      " API requests",
  );
}
await observe("initial");
const selector = await p
    .getByRole("combobox", { name: "Dashboard pay currency", exact: true })
    .boundingBox(),
  apply = await p
    .getByRole("button", { name: "Apply currency", exact: true })
    .boundingBox();
await p.evaluate(() =>
  document.documentElement.style.setProperty("--unrelated-probe", "1"),
);
await p.waitForTimeout(500);
await observe("unrelated-root-style");
await p.getByRole("button", { name: "dark theme", exact: true }).click();
await p.waitForTimeout(500);
await observe("theme-change");
await p.waitForTimeout(35000);
await observe("idle-first-expiry");
await p.waitForTimeout(35000);
await observe("idle-second-expiry");
await p.evaluate(() => {
  window.dispatchEvent(new Event("focus"));
  document.dispatchEvent(new Event("visibilitychange"));
});
await p.waitForTimeout(500);
await observe("fresh-focus-events");
await p.screenshot({
  path: "docs/review/final-pass/dashboard-" + phase + "-dark.png",
  animations: "disabled",
});
if (phase === "after") {
  await p.waitForTimeout(35000);
  await observe("idle-third-expiry");
  const beforeHidden = requests.length;
  await p.evaluate(() =>
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "hidden",
    }),
  );
  await p.waitForTimeout(35000);
  await observe("hidden-expiry");
  expect(requests.length).toBe(beforeHidden);
  await p.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "visible",
    });
    document.dispatchEvent(new Event("visibilitychange"));
    window.dispatchEvent(new Event("focus"));
  });
  await expect.poll(() => requests.length).toBe(beforeHidden + 1);
  await expect(p.locator('[aria-busy="true"]')).toHaveCount(0);
  await observe("visible-expired-resume");
  await p
    .getByRole("combobox", { name: "Dashboard pay currency", exact: true })
    .click();
  await p.getByRole("option", { name: "INR", exact: true }).click();
  await observe("currency-draft");
  await p.getByRole("button", { name: "Apply currency", exact: true }).click();
  await expect(p).toHaveURL(/currency=INR/);
  await expect
    .poll(
      () =>
        requests.filter((r) => r.path === "/api/dashboard?currency=INR").length,
    )
    .toBe(1);
  await expect(
    p.getByText("Employees paid in INR", { exact: true }),
  ).toBeVisible();
  await expect(p.locator('[aria-busy="true"]')).toHaveCount(0);
  await expect(p.locator("canvas")).toHaveCount(3);
  await observe("accepted-currency-change");
  await p
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Employees", exact: true })
    .click();
  await expect(
    p.getByRole("heading", { name: "Employees", exact: true }),
  ).toBeVisible();
  await p
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Dashboard", exact: true })
    .click();
  await expect(p.locator("canvas")).toHaveCount(3);
  await expect(p.locator('[aria-busy="true"]')).toHaveCount(0);
  await observe("navigation-return-new-canvases");
}
fs.writeFileSync(
  "docs/review/final-pass/chart-idle-" + phase + ".json",
  JSON.stringify(
    {
      source: execFileSync("git", ["rev-parse", "HEAD"], {
        encoding: "utf8",
      }).trim(),
      recordedAt: new Date().toISOString(),
      method:
        "Local production build; real idle observation (~72s baseline; ~145s plus actions after), normal motion; native Canvas 2D context acquisition and clearRect counters (not React render counters). Controlled unrelated root CSS mutation, theme change, two comparable real 30s TTL intervals and fresh focus/visibility events; after-only additional third interval, hidden expiry/resume, currency draft/application and navigation return. Context reacquisition is interpreted alongside the destroy/new source path; no app telemetry injected.",
      controlBounds: { selector, apply },
      externalOrigins: [...external],
      observations,
    },
    null,
    2,
  ) + "\n",
);
await b.close();
