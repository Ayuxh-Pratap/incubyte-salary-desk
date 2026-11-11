import { test, expect } from "@playwright/test";
import {
  PRESENTATION_SECTIONS,
  presentationHref,
} from "../../src/lib/presentation";
async function signIn(page: import("@playwright/test").Page) {
  const origin = String(test.info().project.use.baseURL);
  expect(
    (
      await page.request.post("/api/session", {
        headers: { Origin: origin },
        data: { password: process.env.EVALUATOR_PASSWORD },
      })
    ).ok(),
  ).toBe(true);
}
test("all Presentation entry points retain evaluator access", async ({
  page,
}) => {
  for (const path of [
    "/presentation",
    "/presentation/architecture",
    "/presentation/source/money",
    "/presentation/artifacts/requirements",
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login$/);
  }
});
test("Presentation navigation renders canonical content and diagrams without salary reads or canvas initialization", async ({
  page,
}) => {
  await signIn(page);
  const reads: string[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).pathname.startsWith("/api/")) reads.push(r.url());
  });
  await page.goto("/presentation");
  for (const item of PRESENTATION_SECTIONS) {
    if (item.slug)
      await page
        .getByRole("navigation", { name: "Presentation sections" })
        .getByRole("link", { name: item.title, exact: true })
        .click();
    await expect(
      page.getByRole("heading", { name: item.title, exact: true }),
    ).toBeVisible();
    await expect(page).toHaveURL(new RegExp(presentationHref(item.slug) + "$"));
  }
  await expect(page.getByLabel("Current verification record")).toBeVisible();
  expect(reads).toEqual([]);
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.goto("/presentation/architecture");
  await expect(
    page.getByRole("figure", { name: "Salary-update sequence", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: /Inspect actual file/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/presentation\/source\/schema#L/);
  await expect(page.locator("pre")).toContainText("positive_bounded_salary");
  expect(reads).toEqual([]);
});
test("unknown sources and artifacts cannot expose arbitrary files", async ({
  page,
}) => {
  await signIn(page);
  for (const path of [
    "/presentation/source/env",
    "/presentation/artifacts/private",
    "/presentation/nonexistent",
  ]) {
    const response = await page.goto(path);
    // Next streamed notFound responses can already have sent a 200 header. No content is resolved.
    expect([200, 404]).toContain(response?.status());
    await expect(
      page.getByRole("heading", { name: "Page not found", exact: true }),
    ).toBeVisible();
    await expect(page.locator("pre")).toHaveCount(0);
  }
});
test("Presentation is readable across phone, tablet and desktop in both themes", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/presentation/architecture");
  for (const theme of ["dark", "light"])
    for (const width of [390, 768, 1366]) {
      await page.setViewportSize({ width, height: 900 });
      if (width < 1024) {
        await page
          .getByRole("button", { name: "Appearance", exact: true })
          .click();
        await page
          .getByRole("button", { name: theme + " theme", exact: true })
          .last()
          .click();
        await page.keyboard.press("Escape");
      } else
        await page
          .getByRole("button", { name: theme + " theme", exact: true })
          .click();
      await expect(page.locator("html")).toHaveClass(new RegExp(theme));
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `test-results/presentation-${theme}-${width}.png`,
      });
    }
});
