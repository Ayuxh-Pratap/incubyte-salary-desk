import { choose } from "./select-helper";
import { test, expect } from "@playwright/test";
async function signIn(page: import("@playwright/test").Page) {
  const base = String(test.info().project.use.baseURL);
  const response = await page.request.post("/api/session", {
    headers: { Origin: base },
    data: { password: process.env.EVALUATOR_PASSWORD },
  });
  expect(response.ok()).toBe(true);
}
test("review shell uses full width, collapses accessibly and reports logout failure", async ({
  page,
}) => {
  await signIn(page);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/employees");
  const main = page.locator("main#main");
  await expect(main).toBeVisible();
  const bounds = await main.boundingBox();
  expect(Math.round(bounds!.x + bounds!.width)).toBe(1920);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const icon = page
    .getByRole("link", { name: "Employees", exact: true })
    .locator("svg");
  const initialIcon = await icon.boundingBox();
  await page
    .getByRole("button", { name: "Collapse navigation", exact: true })
    .click();
  const iconPositions = await icon.evaluate(async (element) => {
    const positions = [];
    for (let frame = 0; frame < 22; frame++) {
      await new Promise(requestAnimationFrame);
      const { x, y } = element.getBoundingClientRect();
      positions.push({ x, y });
    }
    return positions;
  });
  for (const position of iconPositions) {
    expect(Math.abs(position.x - initialIcon!.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(position.y - initialIcon!.y)).toBeLessThanOrEqual(1);
  }
  await expect(
    page.getByRole("button", { name: "Expand navigation", exact: true }),
  ).toHaveAttribute("aria-expanded", "false");
  await expect(
    page.getByRole("link", { name: "Employees", exact: true }),
  ).toBeVisible();
  await page.route("**/api/session", async (route) => {
    if (route.request().method() === "DELETE")
      await route.fulfill({
        status: 503,
        json: { error: "Service unavailable" },
      });
    else await route.continue();
  });
  await page
    .getByRole("button", { name: "End evaluator session", exact: true })
    .click();
  await expect(
    page.getByRole("alert").filter({ hasText: "could not end" }),
  ).toContainText("could not end");
  await expect(page).toHaveURL(/\/employees/);
});
test("Dashboard is the default and separates global headcounts from single-currency compensation", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(
    page.getByRole("heading", { name: "Dashboard", exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId("global-headcount")).toContainText("10,000", {
    timeout: 20000,
  });
  await choose(page.getByLabel("Dashboard pay currency"), "USD");
  await expect(page).toHaveURL(/\/dashboard$/);
  await page
    .getByRole("button", { name: "Apply currency", exact: true })
    .click();
  await expect(page).toHaveURL(/currency=USD/);
  await expect(page.getByTestId("currency-compensation")).toContainText("USD");
  await expect(page.getByTestId("currency-compensation")).toContainText(
    "Annual base",
  );
  await expect(page.getByTestId("global-headcount")).toContainText("10,000");
  const response = await page.request.get("/api/dashboard?currency=USD");
  expect(response.ok()).toBe(true);
  const body = await response.json();
  expect(body.population.headcount).toBe(10000);
  expect(body.population).not.toHaveProperty("total");
  expect(body.compensation.currency).toBe("USD");
  await page
    .getByRole("link", { name: "Explore country India", exact: true })
    .click();
  await expect(page).toHaveURL(/\/employees\?.*country=IN/);
});

test("compact chart pair, theme switch and four salary cards retain clear data hierarchy", async ({
  page,
}) => {
  await signIn(page);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/dashboard");
  const country = page.getByRole("region", {
      name: "Headcount by country",
      exact: true,
    }),
    department = page.getByRole("region", {
      name: "Headcount by department",
      exact: true,
    });
  await expect(page.locator("canvas")).toHaveCount(3, { timeout: 20000 });
  expect(
    Math.abs(
      (await country.boundingBox())!.height -
        (await department.boundingBox())!.height,
    ),
  ).toBeLessThan(1);
  await expect(
    page.getByText("View data and matching employees", { exact: true }),
  ).toHaveCount(0);
  const plot = await country.locator("canvas").boundingBox(),
    legend = await country
      .getByRole("list", { name: "Country legend" })
      .boundingBox();
  expect(legend!.x).toBeGreaterThanOrEqual(plot!.x + plot!.width);
  const toggle = await page
    .getByRole("group", { name: "Color theme", exact: true })
    .boundingBox();
  expect(toggle!.height).toBeLessThanOrEqual(36);
  await page
    .getByRole("navigation", { name: "Main navigation", exact: true })
    .getByRole("link", { name: "Salary overview", exact: true })
    .click();
  const metrics = page.getByRole("region", {
    name: "Salary metrics",
    exact: true,
  });
  await expect(metrics.getByRole("button")).toHaveCount(4, { timeout: 20000 });
  await expect(
    metrics.getByRole("button", { name: "Explain Employees", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("navigation", { name: "Main navigation", exact: true })
    .getByRole("link", { name: "Employees", exact: true })
    .click();
  const scroll = page.getByRole("region", {
    name: "Employee table, scroll horizontally if needed",
    exact: true,
  });
  await expect(scroll).toBeVisible();
  expect(
    await scroll.evaluate((el) => getComputedStyle(el).borderTopLeftRadius),
  ).toBe("0px");
});
