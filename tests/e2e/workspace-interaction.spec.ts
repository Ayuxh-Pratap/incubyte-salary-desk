import { test, expect, type Page, type Route } from "@playwright/test";
import type { Employee } from "../../src/domain/employee";
function gate() {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release: () => release() };
}
async function signIn(page: Page) {
  const login = await page.request.post("/api/session", {
    headers: { Origin: String(test.info().project.use.baseURL) },
    data: { password: process.env.EVALUATOR_PASSWORD },
  });
  expect(login.ok()).toBe(true);
}
const employee: Employee = {
  id: 1,
  employeeNumber: "ACME-00001",
  name: "Initial employee 1",
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
async function catalog(page: Page) {
  await page.route("**/api/catalog", (route) =>
    route.fulfill({
      json: {
        countries: [
          { code: "US", name: "United States" },
          { code: "IN", name: "India" },
        ],
        departments: [{ id: "engineering", name: "Engineering" }],
        roles: [{ id: "engineer", name: "Software Engineer" }],
        currencies: [
          { code: "USD", precision: 2 },
          { code: "INR", precision: 2 },
        ],
      },
    }),
  );
}
function payload(url: string) {
  const p = new URL(url).searchParams,
    page = Number(p.get("page") || 1),
    pageSize = Number(p.get("pageSize") || 25),
    q = p.get("q") || "Initial",
    total = q === "none" ? 0 : 101;
  const count = Math.max(0, Math.min(pageSize, total - (page - 1) * pageSize));
  return {
    employees: Array.from({ length: count }, (_, i) => ({
      ...employee,
      id: (page - 1) * pageSize + i + 1,
      employeeNumber:
        "ACME-" + String((page - 1) * pageSize + i + 1).padStart(5, "0"),
      name: q + " employee " + ((page - 1) * pageSize + i + 1),
    })),
    total,
    page,
    pageSize,
    pages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
// Transport fixtures protect interaction timing; PostgreSQL tests protect actual query semantics.
test("draft filters apply together; pending tables and pagination stay stable; history and final/empty pages work", async ({
  page,
}) => {
  await signIn(page);
  await catalog(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  const alpha = gate(),
    second = gate();
  const calls: string[] = [];
  await page.route(/\/api\/employees\?/, async (route) => {
    const url = route.request().url();
    calls.push(url);
    const p = new URL(url).searchParams;
    if (p.get("q") === "Alpha")
      await (p.get("page") === "2" ? second.promise : alpha.promise);
    await route.fulfill({ json: payload(url) });
  });
  try {
    await page.goto("/employees?currency=USD");
    await expect(
      page.getByRole("button", {
        name: "View Initial employee 1",
        exact: true,
      }),
    ).toBeVisible();
    const initial = calls.length;
    await page.getByLabel("Country", { exact: true }).selectOption("US");
    await page.getByLabel("Sort employees").selectOption("salary-desc");
    await page.getByLabel("Records per page").selectOption("50");
    await page.getByLabel("Search employees").fill("Alpha");
    await expect(
      page.getByText("Draft changes · Apply to update results"),
    ).toBeVisible();
    expect(calls.length).toBe(initial);
    const header = await page
      .getByRole("columnheader", { name: "Annual base salary", exact: true })
      .boundingBox();
    await page
      .getByRole("button", { name: "Apply filters", exact: true })
      .click();
    const results = page.getByRole("region", {
      name: "Employee results",
      exact: true,
    });
    await expect(results).toHaveAttribute("aria-busy", "true", {
      timeout: 1000,
    });
    await expect(
      page.getByRole("button", {
        name: "View Initial employee 1",
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("columnheader", {
        name: "Annual base salary",
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.getByLabel("Search employees")).toBeEnabled();
    await expect(
      page.getByRole("button", { name: "Next page", exact: true }),
    ).toBeDisabled();
    const pendingHeader = await page
      .getByRole("columnheader", { name: "Annual base salary", exact: true })
      .boundingBox();
    expect(Math.abs(pendingHeader!.x - header!.x)).toBeLessThan(1);
    expect(Math.abs(pendingHeader!.width - header!.width)).toBeLessThan(1);
    await page.screenshot({
      path: "test-results/pending-employees.png",
      animations: "disabled",
    });
    alpha.release();
    await expect(
      page.getByRole("button", { name: "View Alpha employee 1", exact: true }),
    ).toBeVisible();
    await expect(page).toHaveURL(/pageSize=50/);
    const footer = page.getByTestId("pagination"),
      footerBefore = await footer.boundingBox();
    await page.getByRole("button", { name: "Next page", exact: true }).click();
    await expect(results).toHaveAttribute("aria-busy", "true", {
      timeout: 1000,
    });
    const footerPending = await footer.boundingBox();
    expect(Math.abs(footerPending!.height - footerBefore!.height)).toBeLessThan(
      1,
    );
    await expect(
      page.getByRole("button", { name: "Next page", exact: true }),
    ).toBeDisabled();
    second.release();
    await expect(
      page.getByRole("button", { name: "View Alpha employee 51", exact: true }),
    ).toBeVisible();
    await page.goBack();
    await expect(
      page.getByRole("button", { name: "View Alpha employee 1", exact: true }),
    ).toBeVisible();
    await expect(page.getByLabel("Sort employees")).toHaveValue("salary-desc");
    await expect(page.getByLabel("Records per page")).toHaveValue("50");
    await expect(page.getByLabel("Country", { exact: true })).toHaveValue("US");
    await page.goForward();
    await expect(
      page.getByRole("button", { name: "View Alpha employee 51", exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Next page", exact: true }).click();
    await expect(
      page.getByRole("button", {
        name: "View Alpha employee 101",
        exact: true,
      }),
    ).toBeVisible();
    await expect(footer).toContainText("Page 3 of 3");
    await expect(
      page.getByRole("button", { name: "Next page", exact: true }),
    ).toBeDisabled();
    await page.getByLabel("Search employees").fill("none");
    await page
      .getByRole("button", { name: "Apply filters", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "No employees match these filters" }),
    ).toBeVisible();
    await expect(footer).toContainText("0 employees");
    await expect(footer).toContainText("Page 1 of 1");
  } finally {
    alpha.release();
    second.release();
  }
});
test("newer accepted filters win over delayed responses and errors retain a retryable workspace", async ({
  page,
}) => {
  await signIn(page);
  await catalog(page);
  const first = gate(),
    started = gate(),
    finished = gate();
  let failure = true;
  await page.route(/\/api\/employees\?/, async (route: Route) => {
    const url = route.request().url(),
      q = new URL(url).searchParams.get("q");
    if (q === "First") {
      started.release();
      await first.promise;
      try {
        await route.fulfill({ json: payload(url) });
      } finally {
        finished.release();
      }
      return;
    }
    if (q === "error" && failure) {
      failure = false;
      await route.fulfill({
        status: 503,
        json: { error: "Temporary data failure" },
      });
      return;
    }
    await route.fulfill({ json: payload(url) });
  });
  try {
    await page.goto("/employees?currency=USD");
    await expect(
      page.getByRole("button", {
        name: "View Initial employee 1",
        exact: true,
      }),
    ).toBeVisible();
    await page.getByLabel("Search employees").fill("First");
    await page
      .getByRole("button", { name: "Apply filters", exact: true })
      .click();
    await started.promise;
    await page.getByLabel("Search employees").fill("Newest");
    await page
      .getByRole("button", { name: "Apply filters", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "View Newest employee 1", exact: true }),
    ).toBeVisible();
    first.release();
    await finished.promise;
    await expect(
      page.getByRole("button", { name: "View First employee 1", exact: true }),
    ).toHaveCount(0);
    await expect(page.getByLabel("Search employees")).toHaveValue("Newest");
    await page.getByLabel("Search employees").fill("error");
    await page
      .getByRole("button", { name: "Apply filters", exact: true })
      .click();
    await expect(
      page.getByRole("alert").filter({ hasText: "Temporary data failure" }),
    ).toBeVisible();
    await expect(page.getByLabel("Search employees")).toHaveValue("error");
    await expect(
      page.getByRole("button", { name: "View Newest employee 1", exact: true }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "Try again", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "View error employee 1", exact: true }),
    ).toBeVisible();
  } finally {
    first.release();
  }
});
test("compact filters preserve controls, focus is adjacent, and desktop rails remain reachable", async ({
  page,
}) => {
  await signIn(page);
  await catalog(page);
  await page.route(/\/api\/employees\?/, (route) =>
    route.fulfill({ json: payload(route.request().url()) }),
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/employees?currency=USD");
  await expect(
    page.getByRole("button", { name: "View Initial employee 1", exact: true }),
  ).toBeVisible();
  const trigger = page.getByRole("button", {
    name: "Open filters, 1 active",
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Employee filters" });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Country", { exact: true }).selectOption("US");
  await dialog.getByLabel("Role", { exact: true }).selectOption("engineer");
  await dialog
    .getByRole("button", { name: "Apply filters", exact: true })
    .click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/country=US/);
  await expect(page).toHaveURL(/role=engineer/);
  await expect(
    page.getByRole("button", { name: "Open filters, 3 active", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Open filters, 3 active", exact: true })
    .click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open filters, 3 active", exact: true }),
  ).toBeFocused();
  const input = page.getByLabel("Search employees"),
    before = await input.boundingBox();
  await input.focus();
  await input.press("ArrowLeft");
  await expect(input).toBeFocused();
  await expect
    .poll(() => input.evaluate((el) => getComputedStyle(el).outlineWidth))
    .toBe("2px");
  const styles = await input.evaluate((el) => ({
    offset: getComputedStyle(el).outlineOffset,
    width: getComputedStyle(el).outlineWidth,
    style: getComputedStyle(el).outlineStyle,
  }));
  expect(styles).toEqual({ offset: "0px", width: "2px", style: "solid" });
  const after = await input.boundingBox();
  expect(after!.width).toBe(before!.width);
  expect(after!.height).toBe(before!.height);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.setViewportSize({ width: 768, height: 1024 });
  const table = page.getByRole("region", {
    name: "Employee table, scroll horizontally if needed",
  });
  await expect(table).toBeVisible();
  expect(await table.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(
    true,
  );
  await table.focus();
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(() => table.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(0);
  await page.setViewportSize({ width: 1440, height: 600 });
  const rail = page.getByRole("complementary", {
    name: "Employee filters",
    exact: true,
  });
  await expect(rail).toBeVisible();
  await page.locator("main#main").evaluate((el) => {
    el.scrollTop = 500;
  });
  const railBox = await rail.boundingBox(),
    mainBox = await page.locator("main#main").boundingBox();
  expect(railBox!.y).toBeGreaterThanOrEqual(mainBox!.y);
  expect(railBox!.y).toBeLessThan(mainBox!.y + 40);
  await rail
    .getByRole("button", { name: "Clear filters", exact: true })
    .focus();
  const reset = await rail
    .getByRole("button", { name: "Clear filters", exact: true })
    .boundingBox();
  expect(reset!.y + reset!.height).toBeLessThanOrEqual(600);
  const primary = page.getByRole("button", {
    name: "Apply filters",
    exact: true,
  });
  const raised = await primary.evaluate((el) => getComputedStyle(el).boxShadow);
  expect(raised).toContain("inset");
  await primary.hover();
  await expect
    .poll(() => primary.evaluate((el) => getComputedStyle(el).boxShadow))
    .not.toBe(raised);
  await page.mouse.down();
  try {
    await expect
      .poll(() => primary.evaluate((el) => getComputedStyle(el).translate))
      .toContain("1px");
  } finally {
    await page.mouse.up();
  }
  expect(
    await page
      .getByRole("button", { name: "Open ACME-00001", exact: true })
      .evaluate((el) => getComputedStyle(el).boxShadow),
  ).toBe("none");
  await page.screenshot({
    path: "test-results/compact-filter-rail.png",
    animations: "disabled",
  });
});
test("edits made while an accepted filter navigation is pending are not overwritten by its response", async ({
  page,
}) => {
  await signIn(page);
  await catalog(page);
  await page.route(/\/api\/employees\?/, (route) =>
    route.fulfill({ json: payload(route.request().url()) }),
  );
  await page.goto("/employees?currency=USD");
  await expect(
    page.getByRole("button", { name: "View Initial employee 1", exact: true }),
  ).toBeVisible();
  const rsc = gate(),
    started = gate();
  await page.route(/\/employees\?/, async (route) => {
    if (
      route.request().headers().rsc === "1" &&
      new URL(route.request().url()).searchParams.get("q") === "First"
    ) {
      started.release();
      await rsc.promise;
      await route.continue();
    } else await route.fallback();
  });
  try {
    await page.getByLabel("Search employees").fill("First");
    await page
      .getByRole("button", { name: "Apply filters", exact: true })
      .click();
    await started.promise;
    await expect(
      page.getByRole("region", { name: "Employee results", exact: true }),
    ).toHaveAttribute("aria-busy", "true");
    await page.getByLabel("Search employees").fill("New draft");
    rsc.release();
    await expect(page).toHaveURL(/q=First/);
    await expect(
      page.getByRole("button", { name: "View First employee 1", exact: true }),
    ).toBeVisible();
    await expect(page.getByLabel("Search employees")).toHaveValue("New draft");
    await expect(
      page.getByText("Draft changes · Apply to update results"),
    ).toBeVisible();
  } finally {
    rsc.release();
  }
});
function analysisPayload(currency: string, q = "") {
  const summary =
    q === "none"
      ? { count: 0, total: "0", min: null, max: null, median: null }
      : {
          count: 2,
          total: "30000000",
          min: "10000000",
          max: "20000000",
          median: { numerator: "30000000", denominator: 2 },
        };
  return {
    currency,
    period: "annual",
    summary,
    groups: summary.count ? [{ key: "engineering", summary }] : [],
    filters: {
      q,
      currency,
      sort: "name-asc",
      page: 1,
      pageSize: 25,
      groupBy: "department",
    },
  };
}
test("analysis keeps metric/table geometry while pending and labels empty values explicitly", async ({
  page,
}) => {
  await signIn(page);
  await catalog(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  const held = gate();
  await page.route(/\/api\/analysis\?/, async (route) => {
    const p = new URL(route.request().url()).searchParams;
    if (p.get("currency") === "INR" && !p.get("q")) await held.promise;
    await route.fulfill({
      json: analysisPayload(p.get("currency") || "USD", p.get("q") || ""),
    });
  });
  try {
    await page.goto("/overview?currency=USD");
    const metrics = page.getByRole("region", {
      name: "Salary metrics",
      exact: true,
    });
    await expect(
      page.getByRole("button", { name: "Explain Median annual base" }),
    ).toContainText("USD");
    const before = await metrics.boundingBox();
    await page.getByLabel("Pay currency", { exact: true }).selectOption("INR");
    await page
      .getByRole("button", { name: "Apply filters", exact: true })
      .click();
    await expect(
      page.getByRole("region", {
        name: "Salary analysis results",
        exact: true,
      }),
    ).toHaveAttribute("aria-busy", "true", { timeout: 1000 });
    await expect(
      page.getByRole("button", { name: "Explain Median annual base" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("columnheader", {
        name: "Median annual base",
        exact: true,
      }),
    ).toBeVisible();
    const during = await metrics.boundingBox();
    expect(Math.abs(during!.height - before!.height)).toBeLessThan(1);
    await page.screenshot({
      path: "test-results/pending-analysis.png",
      animations: "disabled",
    });
    held.release();
    await expect(
      page.getByRole("button", { name: "Explain Median annual base" }),
    ).toContainText("INR");
    await page.getByLabel("Search employees").fill("none");
    await page
      .getByRole("button", { name: "Apply filters", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "No matching salaries", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Explain Median annual base" }),
    ).toContainText("—");
  } finally {
    held.release();
  }
});
test("Dashboard preserves a newer currency draft while an accepted snapshot is loading", async ({
  page,
}) => {
  await signIn(page);
  await catalog(page);
  await page.route(/\/api\/dashboard\?/, (route) => {
    const currency =
      new URL(route.request().url()).searchParams.get("currency") || "INR";
    return route.fulfill({
      json: {
        population: {
          headcount: 10000,
          countries: [{ key: "US", count: 10000 }],
          departments: [{ key: "engineering", count: 10000 }],
          currencies: [
            { key: "USD", count: 2 },
            { key: "INR", count: 9998 },
          ],
        },
        compensation: analysisPayload(currency),
      },
    });
  });
  await page.goto("/dashboard");
  await expect(page.getByTestId("global-headcount")).toContainText("10,000");
  const held = gate(),
    started = gate();
  await page.route(/\/dashboard\?/, async (route) => {
    if (
      route.request().headers().rsc === "1" &&
      new URL(route.request().url()).searchParams.get("currency") === "USD"
    ) {
      started.release();
      await held.promise;
      await route.continue();
    } else await route.fallback();
  });
  try {
    await page.getByLabel("Dashboard pay currency").selectOption("USD");
    await page
      .getByRole("button", { name: "Apply currency", exact: true })
      .click();
    await started.promise;
    await page.getByLabel("Dashboard pay currency").selectOption("JPY");
    await expect(page.getByTestId("global-headcount")).toContainText("10,000");
    held.release();
    await expect(page).toHaveURL(/currency=USD/);
    await expect(
      page.getByText("Median annual base · USD", { exact: true }),
    ).toBeVisible();
    await expect(page.getByLabel("Dashboard pay currency")).toHaveValue("JPY");
    await page
      .getByRole("button", { name: "Apply currency", exact: true })
      .click();
    await expect(page).toHaveURL(/currency=JPY/);
    await expect(
      page.getByText("Median annual base · JPY", { exact: true }),
    ).toBeVisible();
  } finally {
    held.release();
  }
});
test("an initial Dashboard failure exposes a nearby retry instead of permanent loading cards", async ({
  page,
}) => {
  await signIn(page);
  await catalog(page);
  let failure = true;
  await page.route(/\/api\/dashboard\?/, (route) => {
    if (failure) {
      return route.fulfill({
        status: 503,
        json: { error: "Temporary snapshot failure" },
      });
    }
    return route.fulfill({
      json: {
        population: {
          headcount: 10000,
          countries: [{ key: "US", count: 10000 }],
          departments: [{ key: "engineering", count: 10000 }],
          currencies: [{ key: "USD", count: 10000 }],
        },
        compensation: analysisPayload("USD"),
      },
    });
  });
  await page.goto("/dashboard?currency=USD");
  await expect(
    page.getByRole("heading", {
      name: "We couldn’t load the organization snapshot",
      exact: true,
    }),
  ).toBeVisible({ timeout: 1500 });
  failure = false;
  await page
    .getByRole("button", { name: "Retry Dashboard", exact: true })
    .click();
  await expect(page.getByTestId("global-headcount")).toContainText("10,000");
});
