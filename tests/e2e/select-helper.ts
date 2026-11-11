import { expect, type Locator } from "@playwright/test";
export async function choose(control: Locator, value: string) {
  await control.click();
  await control
    .page()
    .locator('[role="option"][data-value=' + JSON.stringify(value) + "]")
    .click();
  await expect(control.page().getByRole("listbox")).toHaveCount(0);
}
