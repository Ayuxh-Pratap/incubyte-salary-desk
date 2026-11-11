import { salaryInput, formatMoney } from "../../src/domain/money";
import { test, expect } from "@playwright/test";
import { choose } from "./select-helper";
async function signIn(page: import("@playwright/test").Page) {
  const base = String(test.info().project.use.baseURL);
  expect(
    (
      await page.request.post("/api/session", {
        headers: { Origin: base },
        data: { password: process.env.EVALUATOR_PASSWORD },
      })
    ).ok(),
  ).toBe(true);
}
test("custom dropdown supports keyboard/typeahead and never applies a draft by itself", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/employees");
  const country = page.getByRole("combobox", { name: "Country", exact: true });
  await expect(country).toBeEnabled({ timeout: 20000 });
  let reads = 0;
  page.on("request", (r) => {
    if (r.url().includes("/api/employees?")) reads++;
  });
  await country.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.type("Japan");
  await page.keyboard.press("Enter");
  await expect(country).toHaveAttribute("data-value", "JP");
  await expect(country).toBeFocused();
  expect(reads).toBe(0);
  await country.press("Space");
  await page.keyboard.press("Escape");
  await expect(country).toBeFocused();
  await choose(
    page.getByRole("combobox", { name: "Pay currency", exact: true }),
    "USD",
  );
  await page
    .getByRole("button", { name: "Apply filters", exact: true })
    .click();
  await expect(page).toHaveURL(/country=JP.*currency=USD/);
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, {
    timeout: 20000,
  });
  await expect.poll(() => reads).toBe(1);
});
test("fresh return views, detail reopen and history reuse data; refresh is explicit and protected reads remain no-store", async ({
  page,
}) => {
  test.skip(
    process.env.E2E_LIVE_DATABASE !== "true",
    "isolated live data required",
  );
  await signIn(page);
  const reads: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/")) reads.push(new URL(r.url()).pathname);
  });
  await page.goto("/employees");
  await expect(
    page.getByRole("heading", {
      name: "10,000 matching employees",
      exact: true,
    }),
  ).toBeVisible({ timeout: 20000 });
  const first = page.getByRole("button", { name: /^View / }).first();
  await first.click();
  await expect(
    page.getByRole("button", { name: "Save salary", exact: true }),
  ).toBeVisible({ timeout: 20000 });
  await page.keyboard.press("Escape");
  const detailReads = reads.filter((p) =>
    /^\/api\/employees\/\d+$/.test(p),
  ).length;
  await first.click();
  await expect(
    page.getByRole("button", { name: "Save salary", exact: true }),
  ).toBeVisible();
  expect(reads.filter((p) => /^\/api\/employees\/\d+$/.test(p))).toHaveLength(
    detailReads,
  );
  await page.keyboard.press("Escape");
  const nav = page.getByRole("navigation", {
    name: "Main navigation",
    exact: true,
  });
  await nav.getByRole("link", { name: "Salary overview", exact: true }).click();
  await expect(
    page.getByRole("button", {
      name: "Explain Median annual base",
      exact: true,
    }),
  ).toBeVisible({ timeout: 20000 });
  const before = reads.length;
  await nav.getByRole("link", { name: "Employees", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "10,000 matching employees",
      exact: true,
    }),
  ).toBeVisible();
  expect(reads).toHaveLength(before);
  await page.getByRole("button", { name: "Next page", exact: true }).click();
  await expect(page.getByTestId("pagination")).toContainText("Page 2 of 400", {
    timeout: 20000,
  });
  const pageTwo = reads.length;
  await page.goBack();
  await expect(page.getByTestId("pagination")).toContainText("Page 1 of 400");
  expect(reads).toHaveLength(pageTwo);
  await page.goForward();
  await expect(page.getByTestId("pagination")).toContainText("Page 2 of 400");
  expect(reads).toHaveLength(pageTwo);
  await page
    .getByRole("button", { name: "Refresh employee results", exact: true })
    .click();
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0, {
    timeout: 20000,
  });
  expect(reads.length).toBe(pageTwo + 1);
  const response = await page.request.get("/api/employees?pageSize=25");
  expect(response.headers()["cache-control"]).toBe("private, no-store");
  expect((await response.json()).employees).toHaveLength(25);
});
test("Dashboard renders bounded interactive charts, exact accessible bands and reduced-motion layouts", async ({
  page,
}) => {
  test.skip(
    process.env.E2E_LIVE_DATABASE !== "true",
    "isolated live data required",
  );
  await signIn(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/dashboard?currency=KWD");
  await expect(page.locator("canvas")).toHaveCount(3, { timeout: 20000 });
  await page.getByRole("button", { name: "dark theme", exact: true }).click();
  await expect(page.locator("canvas").nth(1)).toHaveAttribute(
    "data-theme",
    "dark",
  );
  await expect(page.locator("canvas").nth(1)).toHaveAttribute(
    "data-axis-color",
    "#c9c9d1",
  );
  await page.getByRole("button", { name: "light theme", exact: true }).click();
  await expect(page.locator("canvas").nth(1)).toHaveAttribute(
    "data-theme",
    "light",
  );
  await expect(page.locator("canvas").nth(1)).toHaveAttribute(
    "data-axis-color",
    "#57534e",
  );
  const response = await page.request.get("/api/dashboard?currency=KWD"),
    data = await response.json();
  expect(data.distribution.length).toBeLessThanOrEqual(8);
  expect(
    data.distribution.reduce(
      (n: number, b: { count: number }) => n + b.count,
      0,
    ),
  ).toBe(data.compensation.summary.count);
  await page
    .getByText("View exact salary bands and counts", { exact: true })
    .click();
  await expect(
    page.getByRole("table", { name: /KWD annual-base salary distribution/ }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);

  await expect(
    page.getByRole("region", {
      name: "Annual salary distribution",
      exact: true,
    }),
  ).toContainText("KWD");
});

test("salary save invalidates a previously visited analysis in the same session", async ({
  page,
}) => {
  test.skip(
    process.env.E2E_LIVE_DATABASE !== "true",
    "isolated write required",
  );
  test.setTimeout(60000);
  await signIn(page);
  const base = String(test.info().project.use.baseURL),
    response = await page.request.get("/api/employees/10000");
  expect(response.headers()["x-salary-desk-environment"]).toBe("test");
  const original = await response.json(),
    next = (BigInt(original.salaryMinor) + 1n).toString();
  let analysisReads = 0;
  page.on("request", (r) => {
    if (r.url().includes("/api/analysis?")) analysisReads++;
  });
  try {
    await page.goto(
      "/overview?currency=" +
        original.currency +
        "&q=" +
        original.employeeNumber,
    );
    await expect(
      page.getByRole("button", {
        name: "Explain Median annual base",
        exact: true,
      }),
    ).toContainText(formatMoney(original.salaryMinor, original.currency), {
      timeout: 20000,
    });
    await page
      .getByRole("link", { name: "View employees", exact: true })
      .click();
    await page
      .getByRole("button", { name: "View " + original.name, exact: true })
      .click();
    await page
      .getByLabel("New annual salary (" + original.currency + ")")
      .fill(salaryInput(next, original.currency));
    await page
      .getByRole("button", { name: "Save salary", exact: true })
      .click();
    await expect(page.getByText(/^Salary saved\./)).toBeVisible({
      timeout: 20000,
    });
    await page.keyboard.press("Escape");
    const before = analysisReads;
    await page
      .locator("main header")
      .getByRole("link", { name: "Salary overview", exact: true })
      .click();
    await expect(
      page.getByRole("button", {
        name: "Explain Median annual base",
        exact: true,
      }),
    ).toContainText(formatMoney(next, original.currency), { timeout: 20000 });
    expect(analysisReads).toBe(before + 1);
  } finally {
    const current = await (
      await page.request.get("/api/employees/10000")
    ).json();
    if (current.salaryMinor !== original.salaryMinor) {
      const restored = await page.request.patch("/api/employees/10000", {
        headers: { Origin: base },
        data: {
          amount: salaryInput(original.salaryMinor, original.currency),
          currency: original.currency,
          period: "annual",
          version: current.version,
        },
      });
      expect(restored.ok()).toBe(true);
    }
  }
});
test("signout clears protected browser data across tabs sharing the session", async ({
  page,
  context,
}) => {
  test.skip(
    process.env.E2E_LIVE_DATABASE !== "true",
    "isolated live reads required",
  );
  await signIn(page);
  await page.goto("/employees");
  await expect(
    page.getByRole("heading", {
      name: "10,000 matching employees",
      exact: true,
    }),
  ).toBeVisible({ timeout: 20000 });
  const second = await context.newPage();
  await second.goto("/employees");
  await expect(
    second.getByRole("heading", {
      name: "10,000 matching employees",
      exact: true,
    }),
  ).toBeVisible({ timeout: 20000 });
  await page
    .getByRole("button", { name: "End evaluator session", exact: true })
    .click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(second).toHaveURL(/\/login$/);
  expect((await page.request.get("/api/employees")).status()).toBe(401);
  await second.close();
});
