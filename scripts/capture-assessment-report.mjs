import { chromium, expect } from "@playwright/test";
import { config } from "dotenv";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
config({ path: ".env.local", quiet: true });
const base = process.argv[2] || "http://localhost:3300",
  directory = process.argv[3] || "docs/review/assessment-report";
fs.mkdirSync(directory, { recursive: true });
const browser = await chromium.launch(),
  context = await browser.newContext({
    baseURL: base,
    viewport: { width: 1366, height: 1000 },
  });
expect(
  (
    await context.request.post("/api/session", {
      headers: { Origin: base },
      data: { password: process.env.EVALUATOR_PASSWORD },
    })
  ).ok(),
).toBe(true);
const page = await context.newPage(),
  reads = [],
  errors = [];
page.on("request", (r) => {
  if (new URL(r.url()).pathname.startsWith("/api/"))
    reads.push(new URL(r.url()).pathname);
});
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("/presentation");
await expect(
  page.getByRole("heading", { name: "Assessment overview", exact: true }),
).toBeVisible();
const records = [];
for (const width of [390, 768, 1366, 1920])
  for (const theme of ["light", "dark"]) {
    await page.setViewportSize({ width, height: 1000 });
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
    await expect(page.locator("html")).toHaveClass(new RegExp(theme));
    await page.waitForTimeout(300);
    await page.goto("/presentation");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Assessment overview",
        exact: true,
      }),
    ).toBeVisible();
    await page.locator("main").evaluate((el) => (el.scrollTop = 0));
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({ path: `${directory}/hero-${theme}-${width}.png` });
    await page.goto("/presentation/architecture");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Architecture and implementation",
        exact: true,
      }),
    ).toBeVisible();
    const diagram = page.getByRole("figure", {
      name: "Salary-update sequence",
      exact: true,
    });
    await diagram.scrollIntoViewIfNeeded();
    await diagram.getByRole("region").evaluate((el) => (el.scrollLeft = 0));
    await diagram.screenshot({
      path: `${directory}/salary-flow-${theme}-${width}.png`,
    });
    const scroll = diagram.getByRole("region");
    await scroll.focus();
    await page.keyboard.press("ArrowRight");
    const needsScroll = await scroll.evaluate(
      (el) => el.scrollWidth > el.clientWidth,
    );
    if (needsScroll)
      await expect
        .poll(() => scroll.evaluate((el) => el.scrollLeft))
        .toBeGreaterThan(0);
    const text = diagram.getByText("Read this flow in text", { exact: true });
    if (!(await diagram.locator("details").getAttribute("open")))
      await text.click();
    await expect(
      diagram.getByText("409 conflict:", { exact: false }),
    ).toBeVisible();
    await text.click();
    const geometry = await page
      .locator("article[data-case-study]")
      .evaluate((el) => ({
        width: el.getBoundingClientRect().width,
        parent: el.parentElement.getBoundingClientRect().width,
        padding:
          parseFloat(getComputedStyle(el.parentElement).paddingLeft) +
          parseFloat(getComputedStyle(el.parentElement).paddingRight),
      }));
    expect(
      Math.abs(geometry.width - (geometry.parent - geometry.padding)),
    ).toBeLessThan(2);
    records.push({
      width,
      theme,
      fullWidth: true,
      noDocumentOverflow: true,
      diagramKeyboardScroll: needsScroll ? "verified" : "not needed",
    });
  }
await page.setViewportSize({ width: 1366, height: 1000 });
await page.goto("/presentation/architecture");
await page.screenshot({ path: directory + "/architecture-dark.png" });
await expect(page.locator("canvas")).toHaveCount(0);
expect(reads).toEqual([]);
expect(errors).toEqual([]);
const chartFiles = fs
  .readdirSync(".next/static/chunks")
  .filter(
    (name) =>
      name.endsWith(".js") &&
      fs
        .readFileSync(".next/static/chunks/" + name, "utf8")
        .includes("doughnut"),
  );
const resources = await page.evaluate(() =>
  performance
    .getEntriesByType("resource")
    .map((r) => ({ name: new URL(r.name).pathname, bytes: r.decodedBodySize })),
);
const loadedChartFiles = resources.filter((r) =>
  chartFiles.some((file) => r.name.endsWith("/" + file)),
);
expect(loadedChartFiles).toEqual([]);
fs.writeFileSync(
  directory + "/visual-verification.json",
  JSON.stringify(
    {
      source: execFileSync("git", ["rev-parse", "HEAD"], {
        encoding: "utf8",
      }).trim(),
      recordedAt: new Date().toISOString(),
      environment: base.includes("3300")
        ? "Local production build"
        : "Development preview; not performance evidence",
      records,
      apiReads: reads,
      pageErrors: errors,
      loadedChartFiles,
      decodedResources: resources,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "Assessment report visual checks: " +
    records.length +
    " theme/viewport combinations; no salary reads, canvas or chart chunk.",
);
await browser.close();
