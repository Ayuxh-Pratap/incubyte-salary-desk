import { test, expect } from "@playwright/test";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
// Opt-in live visual evidence. Normal CI stays fast; this never writes employee data.
test("capture the HR visual review matrix", async ({ page, browser }) => {
  test.skip(
    process.env.CAPTURE_UI_REVIEW !== "true" ||
      process.env.E2E_LIVE_DATABASE !== "true",
    "Run npm run ui:capture with the isolated test database configured.",
  );
  test.setTimeout(180000);
  const base = String(test.info().project.use.baseURL);
  fs.mkdirSync("artifacts/review", { recursive: true });
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  expect(
    (
      await page.request.post("/api/session", {
        headers: { Origin: base },
        data: { password: process.env.EVALUATOR_PASSWORD },
      })
    ).ok(),
  ).toBe(true);
  const environment = await page.request.get("/api/employees?pageSize=25");
  expect(environment.headers()["x-salary-desk-environment"]).toBe("test");
  expect((await environment.json()).total).toBe(10000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const records: Array<Record<string, string | number | boolean>> = [];
  for (const [width, height] of [
    [320, 740],
    [390, 844],
    [768, 1024],
    [1366, 900],
    [1920, 1080],
  ])
    for (const route of ["dashboard", "employees", "overview"]) {
      await page.setViewportSize({ width, height });
      await page.goto("/" + route + "?currency=USD");
      if (route === "dashboard") {
        await expect(page.getByTestId("global-headcount")).toContainText(
          "10,000",
          { timeout: 30000 },
        );
        await expect(
          page.getByRole("link", {
            name: "Explore country India",
            exact: true,
          }),
        ).toBeVisible({ timeout: 30000 });
      } else {
        await expect(
          page.locator('select[name="country"]').first(),
        ).toBeEnabled({ timeout: 30000 });
        if (route === "employees")
          await expect(
            page.getByRole("heading", { name: /matching employees/ }),
          ).toBeVisible({ timeout: 30000 });
        else
          await expect(
            page.getByRole("button", { name: "Explain Median annual base" }),
          ).toBeVisible({ timeout: 30000 });
      }
      for (const theme of ["light", "dark"]) {
        if (
          !(await page
            .getByRole("button", { name: theme + " theme", exact: true })
            .count())
        )
          await page
            .getByRole("button", { name: "Appearance", exact: true })
            .click();
        await page
          .getByRole("button", { name: theme + " theme", exact: true })
          .click();
        if (width < 1024) {
          await page.keyboard.press("Escape");
          await expect(
            page.getByRole("group", { name: "Color theme", exact: true }),
          ).toHaveCount(0);
        }
        await page.locator("main#main").evaluate((el) => {
          el.scrollTop = 0;
        });
        const layout = await page.evaluate(() => {
          const main = document.querySelector<HTMLElement>("main#main")!,
            header = document.querySelector<HTMLElement>(
              'header[class*="lg:hidden"]',
            );
          const r = main.getBoundingClientRect();
          return {
            bodyOverflow: document.documentElement.scrollWidth > innerWidth,
            mainOverflow: main.scrollWidth > main.clientWidth,
            headerOverflow: header
              ? header.scrollWidth > header.clientWidth
              : false,
            mainRight: Math.round(r.right),
            mainLeft: Math.round(r.left),
            canvas: getComputedStyle(document.documentElement)
              .getPropertyValue("--background")
              .trim(),
          };
        });
        expect(layout.bodyOverflow).toBe(false);
        expect(layout.mainOverflow).toBe(false);
        expect(layout.headerOverflow).toBe(false);
        expect(layout.mainRight).toBe(width);
        const file = `after-${route}-${theme}-${width}.png`;
        await page.screenshot({
          path: "artifacts/review/" + file,
          animations: "disabled",
        });
        records.push({ route, theme, width, height, ...layout, file });
      }
    }
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/employees");
  await expect(
    page.getByRole("heading", {
      name: "10,000 matching employees",
      exact: true,
    }),
  ).toBeVisible({ timeout: 30000 });
  await expect(page.locator('select[name="country"]').first()).toBeEnabled({
    timeout: 30000,
  });
  for (const theme of ["light", "dark"]) {
    await page
      .getByRole("button", { name: theme + " theme", exact: true })
      .click();
    await page.locator("main#main").evaluate((el) => {
      el.scrollTop = 0;
    });
    await page.screenshot({
      path: `artifacts/review/after-employees-all-${theme}-1920.png`,
      animations: "disabled",
    });
  }
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto("/dashboard?currency=USD");
  const comparison = page.getByRole("region", {
    name: "Department median comparison",
    exact: true,
  });
  await expect(comparison).toHaveAttribute("aria-busy", "false", {
    timeout: 30000,
  });
  await comparison.evaluate((el) => {
    const main = document.querySelector<HTMLElement>("main#main")!;
    main.scrollTop +=
      el.getBoundingClientRect().top - main.getBoundingClientRect().top - 24;
  });
  await page.screenshot({
    path: "artifacts/review/after-dashboard-medians-dark-1366.png",
    animations: "disabled",
  });
  await page.goto("/employees?currency=USD");
  await expect(
    page.getByRole("heading", { name: /matching employees/ }),
  ).toBeVisible({ timeout: 30000 });
  const row = page.locator("tbody tr").first();
  const tableHeader = await page
      .locator("thead")
      .evaluate((el) => getComputedStyle(el).backgroundColor),
    normalRow = await row.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
  await row.hover();
  await expect
    .poll(() => row.evaluate((el) => getComputedStyle(el).backgroundColor))
    .not.toBe(normalRow);
  const hoverRow = await row.evaluate(
    (el) => getComputedStyle(el).backgroundColor,
  );
  expect(hoverRow).not.toBe(tableHeader);
  await row.locator('button[aria-label^="View "]').click();
  await expect(
    page.getByRole("dialog", { name: "Employee compensation", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Save salary", exact: true }),
  ).toBeVisible({ timeout: 30000 });
  const activeRow = await row.evaluate(
    (el) => getComputedStyle(el).backgroundColor,
  );
  expect(activeRow).not.toBe(hoverRow);
  await page.screenshot({
    path: "artifacts/review/after-employee-detail-dark-1366.png",
    animations: "disabled",
  });
  await page.keyboard.press("Escape");
  expect(errors).toEqual([]);
  fs.writeFileSync(
    "artifacts/review/table-state-checks.json",
    JSON.stringify(
      {
        tableHeader,
        normalRow,
        hoverRow,
        activeRow,
        headerAndHoverDistinct: true,
        activeAndHoverDistinct: true,
      },
      null,
      2,
    ) + "\n",
  );
  fs.writeFileSync(
    "artifacts/review/viewport-checks.json",
    JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], {
          encoding: "utf8",
        }).trim(),
        browser: browser.version(),
        databasePurpose: "test",
        population: 10000,
        anonymousDashboardRedirectsToLogin: true,
        pageErrors: errors,
        viewports: records,
      },
      null,
      2,
    ) + "\n",
  );
});
