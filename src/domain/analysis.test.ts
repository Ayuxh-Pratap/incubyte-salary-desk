import { it, expect } from "vitest";
import { parseFilters } from "./filters";
import {
  analysisFilters,
  drilldownFilters,
  exactMedian,
  METRICS,
} from "./analysis";
it("requires an explicit compatible analysis currency", () => {
  expect(() => analysisFilters({})).toThrow();
  expect(analysisFilters({ currency: "INR" }).currency).toBe("INR");
});
it("preserves population semantics in a group drilldown and resets the page", () => {
  const filters = parseFilters({
    q: "Zoë",
    currency: "USD",
    country: "IN",
    department: "engineering",
    page: "4",
  });
  expect(drilldownFilters(filters, "role", "engineer")).toMatchObject({
    q: "Zoë",
    currency: "USD",
    country: "IN",
    department: "engineering",
    role: "engineer",
    page: 1,
  });
  expect(() => drilldownFilters(filters, "country", "XXX")).toThrow();
});
it("explains even medians without hiding half a minor unit", () => {
  expect(exactMedian({ numerator: "203", denominator: 2 }, "USD")).toBe(
    "USD 1.015",
  );
  expect(exactMedian({ numerator: "3", denominator: 2 }, "JPY")).toBe(
    "JPY 1.5",
  );
  expect(exactMedian({ numerator: "4", denominator: 2 }, "KWD")).toBe(
    "KWD 0.002",
  );
  expect(METRICS.median.definition).toContain("middle");
});

it("never labels an active population filter as All when lookup options fail", async () => {
  const { describePopulation } = await import("./analysis");
  const labels = Object.fromEntries(
    describePopulation(
      parseFilters({
        currency: "USD",
        country: "IN",
        department: "engineering",
        role: "engineer",
      }),
    ),
  );
  expect(labels).toMatchObject({
    Country: "IN",
    Department: "engineering",
    Role: "engineer",
    Currency: "USD",
  });
});
