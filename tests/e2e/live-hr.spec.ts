import { test, expect } from "@playwright/test";
import { salaryInput, formatMoney } from "../../src/domain/money";
import type { Employee } from "../../src/domain/employee";
test("live HR workflow persists a salary and uses it in filtered analysis", async ({
  page,
}) => {
  test.setTimeout(90000);
  test.skip(
    process.env.E2E_LIVE_DATABASE !== "true",
    "Requires the isolated live test database; run npm run test:e2e:live.",
  );
  const login = await page.request.post("/api/session", {
    headers: { Origin: "http://localhost:3100" },
    data: { password: process.env.EVALUATOR_PASSWORD },
  });
  expect(login.ok()).toBe(true);
  const originalResponse = await page.request.get("/api/employees/10000");
  expect(originalResponse.ok()).toBe(true);
  expect(originalResponse.headers()["x-salary-desk-environment"]).toBe("test");
  const original: Employee = await originalResponse.json();
  const newMinor = (BigInt(original.salaryMinor) + 1n).toString();
  try {
    await page.goto(
      "/employees?q=" +
        original.employeeNumber +
        "&currency=" +
        original.currency,
    );
    await page
      .getByRole("button", { name: "View " + original.name, exact: true })
      .click();
    await expect(page.getByLabel("Pay currency")).toHaveAttribute(
      "data-value",
      original.currency,
    );
    const input = page.getByLabel(
      "New annual salary (" + original.currency + ")",
    );
    await input.fill("0");
    await expect(page.locator("#salary-validation")).toBeVisible();
    await input.fill(salaryInput(newMinor, original.currency));
    await page
      .getByRole("button", { name: "Save salary", exact: true })
      .click();
    await expect(page.getByText(/^Salary saved\./)).toBeVisible({
      timeout: 20000,
    });
    await page.keyboard.press("Escape");
    await page.reload();
    await page
      .getByRole("button", { name: "View " + original.name, exact: true })
      .click();
    await expect(input).toHaveValue(salaryInput(newMinor, original.currency));
    await page.keyboard.press("Escape");
    await page.goto(
      "/overview?currency=" +
        original.currency +
        "&q=" +
        original.employeeNumber,
    );
    await expect(
      page.getByRole("button", { name: "Explain Median annual base" }),
    ).toContainText(formatMoney(newMinor, original.currency), {
      timeout: 20000,
    });
    await page
      .getByRole("button", { name: "Explain Median annual base" })
      .click();
    await expect(page.getByRole("dialog")).toContainText("1 matching employee");
    await expect(page.getByRole("dialog")).toContainText(
      original.employeeNumber,
    );
    await page.screenshot({
      path: "test-results/live-metric-explanation.png",
      animations: "disabled",
    });
    const fresh: Employee = await (
      await page.request.get("/api/employees/10000")
    ).json();
    expect(fresh.salaryMinor).toBe(newMinor);
    expect(fresh.version).toBe(original.version + 1);
  } finally {
    const fresh: Employee = await (
      await page.request.get("/api/employees/10000")
    ).json();
    if (fresh.salaryMinor !== original.salaryMinor) {
      const restore = await page.request.patch("/api/employees/10000", {
        headers: { Origin: "http://localhost:3100" },
        data: {
          amount: salaryInput(original.salaryMinor, original.currency),
          currency: original.currency,
          period: "annual",
          version: fresh.version,
        },
      });
      expect(restore.ok()).toBe(true);
    }
  }
});
