import { chromium, expect } from "@playwright/test";
import { config } from "dotenv";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
config({ path: ".env.local", quiet: true });
const base = "http://localhost:3300",
  browser = await chromium.launch(),
  context = await browser.newContext({
    baseURL: base,
    viewport: { width: 1366, height: 900 },
  });
await context.request.post("/api/session", {
  headers: { Origin: base },
  data: { password: process.env.EVALUATOR_PASSWORD },
});
const page = await context.newPage(),
  external = new Set(),
  scripts = [];
page.on("request", (r) => {
  const url = new URL(r.url());
  if (url.origin !== base) external.add(url.origin);
});
page.on("response", (r) => {
  if (r.request().resourceType() === "script") scripts.push(r.url());
});
await page.goto("/dashboard?currency=USD");
await expect(page.locator("canvas")).toHaveCount(3);
await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
await page.evaluate(() => {
  const events = [];
  window.__feedback = events;
  document.addEventListener(
    "click",
    () => events.push({ kind: "click", at: performance.now() }),
    { capture: true, once: true },
  );
  new MutationObserver(() => {
    for (const [kind, visible] of [
      ["link-pending", !!document.querySelector("[data-pending]")],
      [
        "route-ready",
        document.querySelector("h1")?.textContent === "Employees",
      ],
      ["results-pending", !!document.querySelector('main [aria-busy="true"]')],
      [
        "data-ready",
        document.querySelector("h1")?.textContent === "Employees" &&
          !!document.querySelector("table tbody tr") &&
          !document.querySelector('main [aria-busy="true"]'),
      ],
    ])
      if (visible && !events.some((e) => e.kind === kind))
        events.push({ kind, at: performance.now() });
  }).observe(document.querySelector("main").parentElement, {
    subtree: true,
    childList: true,
    attributes: true,
  });
});
await page
  .getByRole("navigation", { name: "Main navigation" })
  .getByRole("link", { name: "Employees", exact: true })
  .click();
await expect(
  page.getByRole("heading", { name: "10,000 matching employees", exact: true }),
).toBeVisible();
const feedback = await page.evaluate(() => {
  const events = window.__feedback,
    start = events.find((e) => e.kind === "click").at;
  return events.map((e) => ({
    kind: e.kind,
    afterClickMs: Math.round((e.at - start) * 10) / 10,
  }));
});
await page.goto("/presentation/architecture");
await expect(
  page.getByRole("heading", { name: "Architecture and flows", exact: true }),
).toBeVisible();
const reads = [];
page.on("request", (r) => {
  if (new URL(r.url()).pathname.startsWith("/api/"))
    reads.push(new URL(r.url()).pathname);
});
await page
  .getByRole("navigation", { name: "Presentation sections" })
  .getByRole("link", { name: "Quality and evidence", exact: true })
  .click();
await expect(
  page.getByRole("heading", { name: "Quality and evidence", exact: true }),
).toBeVisible();
const chartChunks = fs
  .readdirSync(".next/static/chunks")
  .filter(
    (name) =>
      name.endsWith(".js") &&
      fs
        .readFileSync(".next/static/chunks/" + name, "utf8")
        .includes("doughnut"),
  );
const loadedPresentationScripts = await page.evaluate(() =>
  performance
    .getEntriesByType("resource")
    .filter((r) => r.initiatorType === "script")
    .map((r) => r.name),
);
// A fresh context isolates Presentation-only script loading from the previously opened Dashboard.
const clean = await context
  .browser()
  .newContext({ baseURL: base, storageState: await context.storageState() });
const doc = await clean.newPage();
const docReads = [];
doc.on("request", (r) => {
  if (new URL(r.url()).pathname.startsWith("/api/"))
    docReads.push(new URL(r.url()).pathname);
});
await doc.goto("/presentation/architecture");
await expect(
  doc.getByRole("heading", { name: "Architecture and flows", exact: true }),
).toBeVisible();
const resources = await doc.evaluate(() =>
  performance.getEntriesByType("resource").map((r) => ({
    name: new URL(r.name).pathname,
    decodedBytes: r.decodedBodySize,
    type: r.initiatorType,
  })),
);
const loadedChartChunks = resources.filter((r) =>
  chartChunks.some((c) => r.name.endsWith("/" + c)),
);
expect(loadedChartChunks).toEqual([]);
expect(docReads).toEqual([]);
await expect(doc.locator("canvas")).toHaveCount(0);
for (const theme of ["dark", "light"])
  for (const width of [390, 768, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/dashboard?currency=USD");
    await expect(page.locator("canvas")).toHaveCount(3);
    await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
    if (width < 1024) {
      await page
        .getByRole("button", { name: "Appearance", exact: true })
        .click();
      await page
        .getByRole("button", { name: theme + " theme", exact: true })
        .last()
        .click();
      await page.keyboard.press("Escape");
    } else
      await page
        .getByRole("button", { name: theme + " theme", exact: true })
        .click();
    await expect(page.locator("canvas").first()).toHaveAttribute(
      "data-theme",
      theme,
    );
    await page.screenshot({
      path: `docs/review/final-pass/dashboard-${theme}-${width}.png`,
    });
    await doc.setViewportSize({ width, height: 900 });
    await doc.goto("/presentation/architecture");
    await doc.evaluate((t) => {
      localStorage.setItem("salary-desk-theme", t);
    }, theme);
    if (width < 1024) {
      await doc
        .getByRole("button", { name: "Appearance", exact: true })
        .click();
      await doc
        .getByRole("button", { name: theme + " theme", exact: true })
        .last()
        .click();
      await doc.keyboard.press("Escape");
    } else
      await doc
        .getByRole("button", { name: theme + " theme", exact: true })
        .click();
    await doc.screenshot({
      path: `docs/review/final-pass/presentation-${theme}-${width}.png`,
    });
  }
await page.setViewportSize({ width: 390, height: 900 });
await page.evaluate(() => (document.documentElement.style.fontSize = "200%"));
const select = page.getByRole("combobox", {
    name: "Dashboard pay currency",
    exact: true,
  }),
  button = page.getByRole("button", { name: "Apply currency", exact: true });
await expect(select).toBeVisible();
await expect(button).toBeVisible();
expect(
  await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
).toBe(true);
const enlarged = {
  selector: await select.boundingBox(),
  button: await button.boundingBox(),
  horizontalOverflow: false,
};
await page.screenshot({
  path: "docs/review/final-pass/dashboard-enlarged-text.png",
});
fs.writeFileSync(
  "docs/review/final-pass/ui-runtime.json",
  JSON.stringify(
    {
      source: execFileSync("git", ["rev-parse", "HEAD"], {
        encoding: "utf8",
      }).trim(),
      recordedAt: new Date().toISOString(),
      method:
        "One warm production navigation; native click and DOM mutation timestamps, not an SLA. Presentation asset check uses a fresh authenticated browser context; decoded resource bytes. Six Dashboard and six Presentation screenshots plus a 200%-root-font probe.",
      feedback,
      presentation: { apiReads: docReads, loadedChartChunks, resources },
      enlargedText: enlarged,
      externalOrigins: [...external],
    },
    null,
    2,
  ) + "\n",
);
console.log(
  JSON.stringify({
    feedback,
    presentationApiReads: docReads.length,
    presentationChartChunks: loadedChartChunks.length,
    enlargedText: enlarged,
    externalOrigins: [...external],
  }),
);
await browser.close();
