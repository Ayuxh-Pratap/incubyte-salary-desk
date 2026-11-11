import { test, expect } from "@playwright/test";
test("evaluator access, themes and narrow-screen shell", async ({
  page,
  request,
}) => {
  await page.goto("/employees");
  await expect(page).toHaveURL(/\/login$/);
  const foreign = await request.post("/api/session", {
    headers: { Origin: "https://evil.example" },
    data: { password: process.env.EVALUATOR_PASSWORD },
  });
  expect(foreign.status()).toBe(400);
  await page.getByLabel("Evaluator access code").fill("incorrect-code");
  await page.getByRole("button", { name: "Open workspace" }).click();
  await expect(page.locator("#login-error")).toHaveText(
    "That access code is not correct.",
  );
  const password = process.env.EVALUATOR_PASSWORD;
  if (!password)
    throw new Error("Configure evaluator credentials for authenticated E2E.");
  await page.getByLabel("Evaluator access code").fill(password);
  await page.getByRole("button", { name: "Open workspace" }).click();
  await expect(page).toHaveURL(/\/employees$/);
  await expect(
    page.getByRole("heading", { name: "Employees", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "dark theme", exact: true })
    .first()
    .click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.setViewportSize({ width: 320, height: 740 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/foundation-mobile-dark.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "light theme", exact: true })
    .last()
    .click();
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.screenshot({
    path: "test-results/foundation-desktop-light.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "End evaluator session" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/employees");
  await expect(page).toHaveURL(/\/login$/);
});

test("employee data endpoints reject anonymous callers", async ({
  request,
}) => {
  for (const url of ["/api/employees", "/api/catalog"]) {
    const response = await request.get(url);
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({
      error: "Evaluator session required.",
    });
  }
});

test("employee detail and writes require a session", async ({ request }) => {
  expect((await request.get("/api/employees/1")).status()).toBe(401);
  expect(
    (
      await request.patch("/api/employees/1", {
        headers: { Origin: "http://localhost:3100" },
        data: { amount: "100", currency: "INR", period: "annual", version: 1 },
      })
    ).status(),
  ).toBe(401);
});
