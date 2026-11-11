import { chromium, expect } from "@playwright/test";
import { config } from "dotenv";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { salaryInput, formatMoney } from "../src/domain/money.ts";
config({ path: ".env.local", quiet: true });
const base = "http://localhost:3300",
  browser = await chromium.launch(),
  context = await browser.newContext({
    baseURL: base,
    viewport: { width: 1366, height: 900 },
  }),
  page = await context.newPage();
await context.request.post("/api/session", {
  headers: { Origin: base },
  data: { password: process.env.EVALUATOR_PASSWORD },
});
const source = await context.request.get("/api/employees/10000");
expect(source.headers()["x-salary-desk-environment"]).toBe("test");
const original = await source.json(),
  next = (BigInt(original.salaryMinor) + 1n).toString();
let phase = "setup";
const records = [],
  meta = new Map();
page.on("request", (r) => meta.set(r, { phase, at: Date.now() }));
page.on("response", (response) => {
  const m = meta.get(response.request());
  if (!m || !response.url().includes("/api/")) return;
  void response
    .body()
    .then((buffer) =>
      records.push({
        ...m,
        path: new URL(response.url()).pathname,
        method: response.request().method(),
        bytes: buffer.length,
        status: response.status(),
      }),
    );
});
try {
  await page.goto(
    "/overview?currency=" + original.currency + "&q=" + original.employeeNumber,
  );
  await expect(
    page.getByRole("button", {
      name: "Explain Median annual base",
      exact: true,
    }),
  ).toContainText(formatMoney(original.salaryMinor, original.currency), {
    timeout: 30000,
  });
  await page.getByRole("link", { name: "View employees", exact: true }).click();
  await page
    .getByRole("button", { name: "View " + original.name, exact: true })
    .click();
  await page
    .getByLabel("New annual salary (" + original.currency + ")")
    .fill(salaryInput(next, original.currency));
  phase = "save";
  let at = performance.now();
  await page.getByRole("button", { name: "Save salary", exact: true }).click();
  await expect(page.getByText(/^Salary saved\./)).toBeVisible({
    timeout: 20000,
  });
  const saveMs = Math.round(performance.now() - at);
  await page.keyboard.press("Escape");
  phase = "return-analysis";
  at = performance.now();
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
  const returnMs = Math.round(performance.now() - at);
  fs.writeFileSync(
    "docs/review/edit-cache-measurement.json",
    JSON.stringify(
      {
        source: execFileSync("git", ["rev-parse", "HEAD"], {
          encoding: "utf8",
        }).trim(),
        recordedAt: new Date().toISOString(),
        samples: 1,
        method:
          "Production localhost, same isolated Neon test environment; warm exact employee analysis, navigate/edit +1 minor unit, return through existing workspace link without reload; original salary restored in finally. After-only observation, not a baseline speed comparison. API records attributed to request initiation phase.",
        saveConfirmationMs: saveMs,
        returnToPreviouslyCachedAnalysisMs: returnMs,
        updatedAmountObserved: true,
        apiRequests: records.filter((r) => r.phase !== "setup"),
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    JSON.stringify({
      saveConfirmationMs: saveMs,
      returnAnalysisMs: returnMs,
      updatedAmountObserved: true,
    }),
  );
} finally {
  const current = await (
    await context.request.get("/api/employees/10000")
  ).json();
  if (current.salaryMinor !== original.salaryMinor)
    expect(
      (
        await context.request.patch("/api/employees/10000", {
          headers: { Origin: base },
          data: {
            amount: salaryInput(original.salaryMinor, original.currency),
            currency: original.currency,
            period: "annual",
            version: current.version,
          },
        })
      ).ok(),
    ).toBe(true);
  await browser.close();
}
