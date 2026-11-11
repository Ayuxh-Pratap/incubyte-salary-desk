import { chromium, expect } from "@playwright/test";
import { config } from "dotenv";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
config({ path: ".env.local", quiet: true });
const phase = process.argv[2] || "before",
  browser = await chromium.launch(),
  base = "http://localhost:3300",
  observations = [];
for (let sample = 0; sample < 3; sample++) {
  const context = await browser.newContext({
    baseURL: base,
    viewport: { width: 1366, height: 900 },
  });
  const auth = await context.request.post("/api/session", {
    headers: { Origin: base },
    data: { password: process.env.EVALUATOR_PASSWORD },
  });
  expect(auth.ok()).toBe(true);
  const page = await context.newPage();
  let requests = [],
    jobs = [];
  page.on("response", (response) => {
    const req = response.request();
    if (!response.url().startsWith(base) || req.resourceType() === "image")
      return;
    const job = (async () => {
      try {
        const buffer = await response.body();
        const url = new URL(response.url());
        const data = url.pathname.startsWith("/api/")
          ? JSON.parse(buffer.toString())
          : undefined;
        requests.push({
          path: url.pathname + url.search.replace(/&_rsc=[^&]+/g, ""),
          type: req.resourceType(),
          rsc: !!req.headers()["rsc"],
          bytes: buffer.length,
          status: response.status(),
          rows: data?.employees?.length,
          summaryCount:
            data?.compensation?.summary?.count ?? data?.summary?.count,
        });
      } catch {}
    })();
    jobs.push(job);
  });
  async function settled() {
    await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, {
      timeout: 30000,
    });
    await expect(page.locator("main")).toBeVisible();
  }
  async function journey(name, action) {
    requests = [];
    jobs = [];
    const at = Date.now(),
      start = performance.now();
    await action();
    await settled();
    await Promise.all(jobs);
    const ms = Math.round(performance.now() - start);
    const db = fs
      .readFileSync(".vercel/perf-server.log", "utf8")
      .split("\n")
      .filter((l) => l.startsWith("[perf-db]"))
      .map((l) => JSON.parse(l.slice(9)))
      .filter((r) => r.at >= at);
    observations.push({ sample, name, ms, requests, db });
    console.log(
      `${phase} ${sample + 1} ${name}: ${ms}ms, ${requests.filter((r) => r.path.startsWith("/api/")).length} API, ${db.length} SQL`,
    );
  }
  const nav = async (name) => {
    await page
      .getByRole("navigation", { name: "Main navigation", exact: true })
      .getByRole("link", { name, exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: name === "Salary overview" ? "Salary overview" : name,
        exact: true,
      }),
    ).toBeVisible();
  };
  await journey("first-dashboard", async () => {
    await page.goto("/dashboard?currency=USD");
    await expect(page.getByTestId("global-headcount")).toContainText("10,000", {
      timeout: 30000,
    });
    if (phase === "after")
      await expect(page.locator("canvas")).toHaveCount(3, { timeout: 30000 });
  });
  await journey("dashboard-employees", () => nav("Employees"));
  await journey("employees-overview", () => nav("Salary overview"));
  await journey("return-employees", () => nav("Employees"));
  await journey("browser-back", async () => {
    await page.goBack();
    await expect(
      page.getByRole("heading", { name: "Salary overview", exact: true }),
    ).toBeVisible();
  });
  await journey("browser-forward", async () => {
    await page.goForward();
    await expect(
      page.getByRole("heading", { name: "Employees", exact: true }),
    ).toBeVisible();
  });
  await journey("apply-filter", async () => {
    const response = page.waitForResponse(
      (r) =>
        r.url().includes("/api/employees?") &&
        new URL(r.url()).searchParams.get("q") === "Aarav",
    );
    await page.getByLabel("Search employees", { exact: true }).fill("Aarav");
    await page
      .getByRole("button", { name: "Apply filters", exact: true })
      .click();
    await response;
  });
  await journey("next-page", async () => {
    await page.getByRole("button", { name: "Next page", exact: true }).click();
    await expect(page.getByTestId("pagination")).toContainText("Page 2");
  });
  await journey("employee-detail", async () => {
    await page
      .getByRole("button", { name: /^View / })
      .first()
      .click();
    await expect(
      page.getByRole("button", { name: "Save salary", exact: true }),
    ).toBeVisible({ timeout: 30000 });
  });
  if (sample === 0)
    await page.screenshot({
      path: `artifacts/review/${phase}-performance-employees.png`,
    });
  await context.close();
}
await browser.close();
fs.writeFileSync(
  process.argv[3]
    ? `${process.argv[3]}/performance-${phase}.json`
    : `docs/review/performance-${phase}.json`,
  JSON.stringify(
    {
      phase,
      source: execFileSync("git", ["rev-parse", "HEAD"], {
        encoding: "utf8",
      }).trim(),
      recordedAt: new Date().toISOString(),
      environment:
        "Node 24 / Windows / Chromium / localhost production build; isolated hosted Neon US East test DB, client India; three fresh browser contexts, same process/pool; first-process request not guaranteed cold Neon",
      method:
        "click/goto to no aria-busy, all resulting response bodies read; decoded bytes, sequential journeys; probe counts include transaction control statements; SQL arguments never logged",
      observations,
    },
    null,
    2,
  ) + "\n",
);
