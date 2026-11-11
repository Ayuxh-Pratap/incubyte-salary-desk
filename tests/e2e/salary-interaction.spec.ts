import { test, expect } from "@playwright/test";
import type { Employee } from "../../src/domain/employee";
// Transport fixtures verify UI behavior; the separate live HR test verifies PostgreSQL persistence.
test("failed saves preserve input, conflicts require review, and unsaved changes are protected", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  let current: Employee = {
    id: 1,
    employeeNumber: "ACME-00001",
    name: "Zoë García",
    country: "US",
    countryName: "United States",
    department: "engineering",
    departmentName: "Engineering",
    role: "engineer",
    roleName: "Software Engineer",
    currency: "USD",
    period: "annual",
    salaryMinor: "10000000",
    version: 1,
    updatedAt: "2026-01-01T00:00:00.000Z",
    updatedBy: "Synthetic seed",
  };
  let saves = 0;
  const versions: number[] = [];
  await page.route(/\/api\/employees\?/, (route) =>
    route.fulfill({
      json: { employees: [current], total: 1, page: 1, pages: 1, pageSize: 25 },
    }),
  );
  await page.route("**/api/catalog", (route) =>
    route.fulfill({
      json: {
        countries: [{ code: "US", name: "United States" }],
        departments: [{ id: "engineering", name: "Engineering" }],
        roles: [{ id: "engineer", name: "Software Engineer" }],
        currencies: [{ code: "USD", precision: 2 }],
      },
    }),
  );
  await page.route("**/api/employees/1", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ json: current });
      return;
    }
    saves++;
    const body = route.request().postDataJSON();
    versions.push(body.version);
    if (saves === 1) {
      await route.fulfill({
        status: 503,
        json: {
          error: "Save could not be confirmed. Your input is preserved.",
        },
      });
      return;
    }
    if (saves === 2) {
      current = { ...current, salaryMinor: "10000050", version: 2 };
      await route.fulfill({
        status: 409,
        json: { error: "Another update won the race.", details: { current } },
      });
      return;
    }
    current = {
      ...current,
      salaryMinor: "10000125",
      version: 3,
      updatedBy: "Evaluator",
    };
    await route.fulfill({ json: current });
  });
  const login = await page.request.post("/api/session", {
    headers: { Origin: "http://localhost:3100" },
    data: { password: process.env.EVALUATOR_PASSWORD },
  });
  expect(login.ok()).toBe(true);
  await page.goto("/employees?currency=USD");
  await page
    .getByRole("button", { name: "View Zoë García", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const amount = page.getByLabel("New annual salary (USD)");
  await amount.fill("1.001");
  await expect(page.locator("#salary-validation")).toContainText(
    "2 decimal places",
  );
  await expect(
    page.getByRole("button", { name: "Save salary", exact: true }),
  ).toBeDisabled();
  await amount.fill("100001.25");
  await expect(
    page.getByRole("region", { name: "Salary change preview" }),
  ).toContainText("USD 1.25");
  await page.getByRole("button", { name: "Save salary", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Save could not be confirmed" }),
  ).toBeVisible();
  await expect(amount).toHaveValue("100001.25");
  await expect(page.getByText(/^Salary saved\./)).toHaveCount(0);
  await page.getByRole("button", { name: "Save salary", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Review against latest" }),
  ).toBeVisible();
  await expect(amount).toHaveValue("100001.25");
  await expect(
    page.getByRole("button", { name: "Save salary", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Review against latest" }).click();
  await expect(
    page.getByRole("region", { name: "Salary change preview" }),
  ).toContainText("USD 0.75");
  await page.getByRole("button", { name: "Save salary", exact: true }).click();
  await expect(page.getByText(/^Salary saved\./)).toBeVisible();
  expect(versions).toEqual([1, 1, 2]);
  await page.screenshot({
    path: "test-results/salary-desktop.png",
    animations: "disabled",
  });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.setViewportSize({ width: 375, height: 812 });
  await page
    .getByRole("button", { name: "View Zoë García", exact: true })
    .click();
  await amount.fill("100010.00");
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(amount).toHaveValue("100010.00");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.getByRole("dialog")).toHaveCSS("filter", "none");
  await page.screenshot({
    path: "test-results/salary-mobile.png",
    animations: "disabled",
  });
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Close employee panel" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(saves).toBe(3);
  expect(errors).toEqual([]);
});
