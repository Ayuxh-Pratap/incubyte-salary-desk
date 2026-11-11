import { it, expect } from "vitest";
import { barPercent, medianMinorTwice } from "./dashboard";
it("uses bounded display percentages without converting large salary amounts to Number", () => {
  expect(barPercent(0n, 0n)).toBe(0);
  expect(barPercent(1n, 4n)).toBe(25);
  expect(
    barPercent(9_000_000_000_000_000_000n, 18_000_000_000_000_000_000n),
  ).toBe(50);
  expect(barPercent(10n, 3n)).toBe(100);
  expect(() => barPercent(-1n, 3n)).toThrow();
});
it("compares odd and even medians on the same exact scale", () => {
  expect(medianMinorTwice({ numerator: "101", denominator: 1 })).toBe(202n);
  expect(medianMinorTwice({ numerator: "203", denominator: 2 })).toBe(203n);
  expect(medianMinorTwice(null)).toBe(0n);
});
