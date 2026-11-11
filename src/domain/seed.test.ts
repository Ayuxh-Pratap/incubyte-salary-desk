import { it, expect } from "vitest";
import { syntheticEmployees } from "./seed";
import { CURRENCIES, MAX_MINOR } from "./money";
it("reproduces exactly 10000 unique fictional employees with precision and small-group cases", () => {
  const first = syntheticEmployees(),
    second = syntheticEmployees();
  expect(first).toEqual(second);
  expect(first).toHaveLength(10000);
  expect(new Set(first.map((e) => e.id)).size).toBe(10000);
  expect(new Set(first.map((e) => e.employeeNumber)).size).toBe(10000);
  expect(new Set(first.map((e) => e.currency))).toEqual(
    new Set(Object.keys(CURRENCIES)),
  );
  expect(first.filter((e) => e.department === "leadership")).toHaveLength(3);
  expect(
    first.every(
      (e) =>
        e.salaryMinor > 0n &&
        e.salaryMinor <= MAX_MINOR &&
        e.period === "annual",
    ),
  ).toBe(true);
  expect(
    first.some((e) => e.currency === "KWD" && e.salaryMinor % 1000n !== 0n),
  ).toBe(true);
  expect(first.some((e) => e.name.includes("é"))).toBe(true);
});
