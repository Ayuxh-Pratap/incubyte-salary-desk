import { chromium, expect } from "@playwright/test";
import fs from "node:fs";
import { salaryInput, currencyPrecision } from "../src/domain/money";
import type { Employee } from "../src/domain/employee";
const sessionFile = process.argv[2] || ".vercel/deployed-session.json";
const auth = JSON.parse(fs.readFileSync(sessionFile, "utf8")) as {
  base: string;
  cookieHeader: string;
};
const base = new URL(auth.base).origin;
fs.mkdirSync("artifacts", { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: {
    dir: "artifacts/raw-video",
    size: { width: 1440, height: 900 },
  },
  reducedMotion: "reduce",
});
await context.addCookies(
  auth.cookieHeader.split("; ").map((pair) => {
    const index = pair.indexOf("=");
    return {
      name: pair.slice(0, index),
      value: pair.slice(index + 1),
      url: base,
      httpOnly: true,
      secure: base.startsWith("https:"),
      sameSite: "Strict" as const,
    };
  }),
);
const page = await context.newPage();
let original: Employee | undefined,
  changed = false;
const pause = (ms = 3000) => new Promise((resolve) => setTimeout(resolve, ms));
async function caption(text: string) {
  await page.evaluate((text) => {
    let box = document.querySelector<HTMLElement>("[data-demo-caption]");
    if (!box) {
      box = document.createElement("div");
      box.dataset.demoCaption = "true";
      Object.assign(box.style, {
        position: "fixed",
        bottom: "16px",
        left: "244px",
        right: "24px",
        padding: "12px 16px",
        background: "var(--primary)",
        color: "var(--primary-foreground)",
        borderRadius: "10px",
        zIndex: "1000",
        pointerEvents: "none",
        boxShadow:
          "0 2px 8px color-mix(in srgb,var(--foreground) 15%,transparent)",
      });
      document.body.appendChild(box);
    }
    box.replaceChildren();
    const title = document.createElement("div");
    title.textContent = text;
    title.style.fontWeight = "600";
    const note = document.createElement("div");
    note.textContent =
      "AI-recorded silent reference · Candidate narration and final review pending";
    note.style.fontSize = "12px";
    note.style.marginTop = "4px";
    box.append(title, note);
  }, text);
}
try {
  const response = await context.request.get(base + "/api/employees/1");
  if (!response.ok())
    throw new Error("Authenticated demo session is unavailable.");
  original = await response.json();
  const next = (
    BigInt(original!.salaryMinor) +
    500n * 10n ** BigInt(currencyPrecision(original!.currency))
  ).toString();
  await page.goto(base + "/employees");
  await expect(
    page.getByRole("heading", { name: "10,000 matching employees" }),
  ).toBeVisible({ timeout: 20000 });
  await caption(
    "ACME has 10,000 fictional employees. Find the right person without loading the whole directory.",
  );
  await pause(4000);
  await page
    .getByRole("textbox", { name: "Search employees" })
    .fill(original!.employeeNumber);
  await page.getByLabel("Pay currency").selectOption(original!.currency);
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(
    page.getByRole("button", { name: "View " + original!.name, exact: true }),
  ).toBeVisible();
  await caption(
    "Define the population: employee number and an explicit pay currency.",
  );
  await pause();
  await page
    .getByRole("button", { name: "View " + original!.name, exact: true })
    .click();
  const input = page.getByLabel(
    "New annual salary (" + original!.currency + ")",
  );
  await expect(input).toBeVisible();
  await input.fill("0");
  await expect(page.locator("#salary-validation")).toBeVisible();
  await caption(
    "Invalid amounts are rejected. Salary means current annual base pay.",
  );
  await pause();
  await input.fill(salaryInput(next, original!.currency));
  await caption(
    "Review the old amount, proposed amount and exact change before saving.",
  );
  await pause(4500);
  await page.getByRole("button", { name: "Save salary", exact: true }).click();
  await expect(page.getByText(/^Salary saved\./)).toBeVisible({
    timeout: 20000,
  });
  changed = true;
  await caption(
    "A confirmed, version-checked write. Failures preserve the proposed amount.",
  );
  await pause();
  await page.keyboard.press("Escape");
  await page.reload();
  await page
    .getByRole("button", { name: "View " + original!.name, exact: true })
    .click();
  await expect(input).toHaveValue(salaryInput(next, original!.currency));
  await caption("Reload confirms persistent PostgreSQL storage.");
  await pause();
  await page.keyboard.press("Escape");
  await page.goto(base + "/overview?currency=USD&groupBy=country");
  await expect(
    page.getByRole("button", { name: "Explain Median annual base" }),
  ).toBeVisible({ timeout: 20000 });
  await caption(
    "Compare a defined USD population across countries. No foreign-exchange conversion is implied.",
  );
  await pause(4000);
  await page.screenshot({
    path: "artifacts/salary-overview-desktop.png",
    animations: "disabled",
  });
  await page
    .getByRole("button", { name: "Explain Median annual base" })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "Before display rounding",
  );
  await caption(
    "Explain a number: definition, full population, active filters and exact median before rounding.",
  );
  await pause(5000);
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "Explore India", exact: true }).click();
  await expect(page).toHaveURL(/\/employees\?.*country=IN/);
  await expect(page.locator('select[name="country"]')).toHaveValue("IN");
  await expect(page.getByLabel("Pay currency")).toHaveValue("USD");
  await caption(
    "Drill into matching employees with the same currency and population filters.",
  );
  await pause(4500);
  await page.goto(base + "/overview?currency=USD&groupBy=department");
  await expect(
    page.getByRole("button", { name: "Explain Median annual base" }),
  ).toBeVisible({ timeout: 20000 });
  await caption(
    "Focused scope, exact money, shared filters and evidence from real PostgreSQL tests.",
  );
  await pause(4000);
} finally {
  if (changed && original) {
    const latest = (await (
      await context.request.get(base + "/api/employees/" + original.id)
    ).json()) as Employee;
    const restored = await context.request.patch(
      base + "/api/employees/" + original.id,
      {
        headers: { Origin: base },
        data: {
          amount: salaryInput(original.salaryMinor, original.currency),
          currency: original.currency,
          period: "annual",
          version: latest.version,
        },
      },
    );
    if (!restored.ok())
      throw new Error("Demo cleanup could not restore the synthetic amount.");
  }
  await context.close();
  await page.video()?.saveAs("artifacts/salary-desk-silent-walkthrough.webm");
  await browser.close();
}
console.log(
  "Recorded artifacts/salary-desk-silent-walkthrough.webm. This is silent reference footage; candidate narration remains pending.",
);
