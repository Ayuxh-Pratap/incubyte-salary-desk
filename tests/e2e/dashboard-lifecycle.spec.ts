import { test, expect } from "@playwright/test";
const snapshot = {
  population: {
    headcount: 10,
    countries: [
      { key: "IN", count: 6 },
      { key: "US", count: 4 },
    ],
    departments: [{ key: "engineering", count: 10 }],
    currencies: [{ key: "USD", count: 10 }],
  },
  compensation: {
    currency: "USD",
    period: "annual",
    summary: {
      count: 10,
      total: "1000000",
      min: "100000",
      max: "100000",
      median: { numerator: "100000", denominator: 1 },
    },
    groups: [
      {
        key: "engineering",
        summary: {
          count: 10,
          total: "1000000",
          min: "100000",
          max: "100000",
          median: { numerator: "100000", denominator: 1 },
        },
      },
    ],
    filters: {
      currency: "USD",
      q: "",
      sort: "name-asc",
      page: 1,
      pageSize: 25,
      groupBy: "department",
    },
  },
  distribution: [{ lower: "100000", upper: "100000", count: 10 }],
};
async function prepare(page: import("@playwright/test").Page) {
  const base = String(test.info().project.use.baseURL);
  expect(
    (
      await page.request.post("/api/session", {
        headers: { Origin: base },
        data: { password: process.env.EVALUATOR_PASSWORD },
      })
    ).ok(),
  ).toBe(true);
  await page.addInitScript(() => {
    const records: { canvas: HTMLCanvasElement; contexts: number }[] = [];
    (window as unknown as { chartContexts: typeof records }).chartContexts =
      records;
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args: Parameters<typeof original>
    ) {
      const context = original.apply(this, args);
      if (args[0] === "2d") {
        let entry = records.find((r) => r.canvas === this);
        if (!entry) {
          entry = { canvas: this, contexts: 0 };
          records.push(entry);
        }
        entry.contexts++;
      }
      return context;
    } as typeof original;
  });
  await page.route("**/api/catalog", (r) =>
    r.fulfill({
      json: {
        countries: [
          { code: "IN", name: "India" },
          { code: "US", name: "United States" },
        ],
        departments: [{ id: "engineering", name: "Engineering" }],
        roles: [{ id: "engineer", name: "Engineer" }],
        currencies: [{ code: "USD", precision: 2 }],
      },
    }),
  );
  let reads = 0;
  const current = structuredClone(snapshot);
  await page.route("**/api/dashboard?*", (r) => {
    reads++;
    return r.fulfill({ json: structuredClone(current) });
  });
  await page.goto("/dashboard?currency=USD");
  await expect(page.locator("canvas")).toHaveCount(3);
  await expect(page.locator("canvas").first()).toHaveAttribute(
    "data-theme",
    /light|dark/,
  );
  return Object.assign(() => reads, {
    changeCounts() {
      current.population.countries[0].count++;
      current.population.countries[1].count--;
    },
  });
}
const contexts = (page: import("@playwright/test").Page) =>
  page.evaluate(() =>
    (
      window as unknown as {
        chartContexts: { canvas: HTMLCanvasElement; contexts: number }[];
      }
    ).chartContexts
      .filter((r) => r.canvas.isConnected)
      .map((r) => r.contexts),
  );
test("unchanged refreshes and unrelated root styles retain live charts", async ({
  page,
}) => {
  const reads = await prepare(page),
    before = await contexts(page),
    initialReads = reads();
  await page
    .getByRole("button", { name: "Refresh Dashboard", exact: true })
    .click();
  await expect.poll(reads).toBe(initialReads + 1);
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
  await expect.poll(() => contexts(page)).toEqual(before);
  await page.evaluate(() =>
    document.documentElement.style.setProperty("--unrelated-probe", "1"),
  );
  await expect.poll(() => contexts(page)).toEqual(before);
});
test("currency controls share geometry and doughnut has vertical breathing room", async ({
  page,
}) => {
  await prepare(page);
  for (const width of [390, 768, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    const select = await page
        .getByRole("combobox", { name: "Dashboard pay currency", exact: true })
        .boundingBox(),
      button = await page
        .getByRole("button", { name: "Apply currency", exact: true })
        .boundingBox();
    expect(Math.abs(select!.height - button!.height)).toBeLessThan(1);
    expect(Math.abs(select!.y - button!.y)).toBeLessThan(1);
  }
  const country = page.getByRole("region", {
      name: "Headcount by country",
      exact: true,
    }),
    department = page.getByRole("region", {
      name: "Headcount by department",
      exact: true,
    });
  expect(
    (await country.locator("canvas").boundingBox())!.height,
  ).toBeLessThanOrEqual(220);
  expect((await department.locator("canvas").boundingBox())!.height).toBe(256);
});

test("real population changes and theme changes update the existing canvas instances", async ({
  page,
}) => {
  const read = await prepare(page),
    before = await contexts(page),
    initial = read();
  read.changeCounts();
  await page
    .getByRole("button", { name: "Refresh Dashboard", exact: true })
    .click();
  await expect.poll(read).toBe(initial + 1);
  await expect(page.locator("canvas").first()).toHaveAttribute(
    "data-values",
    "[7,3]",
  );
  expect(await contexts(page)).toEqual(before);
  await page.getByRole("button", { name: "dark theme", exact: true }).click();
  await expect(page.locator("canvas").first()).toHaveAttribute(
    "data-theme",
    "dark",
  );
  await expect(page.locator("canvas").first()).toHaveAttribute(
    "data-axis-color",
    "#c9c9d1",
  );
  expect(await contexts(page)).toEqual(before);
  await page.getByRole("button", { name: "light theme", exact: true }).click();
  await expect(page.locator("canvas").first()).toHaveAttribute(
    "data-axis-color",
    "#57534e",
  );
  expect(await contexts(page)).toEqual(before);
});

test("hidden tabs defer expired reads and resume once when visible or focused", async ({
  page,
}) => {
  await page.clock.install();
  const read = await prepare(page),
    initial = read();
  await page.evaluate(() =>
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "hidden",
    }),
  );
  await page.clock.fastForward(31000);
  expect(read()).toBe(initial);
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => "visible",
    });
    document.dispatchEvent(new Event("visibilitychange"));
    window.dispatchEvent(new Event("focus"));
  });
  await expect.poll(read).toBe(initial + 1);
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
  await page.evaluate(() => {
    document.dispatchEvent(new Event("visibilitychange"));
    window.dispatchEvent(new Event("focus"));
  });
  expect(read()).toBe(initial + 1);
});
