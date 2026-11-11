import { expect, it } from "vitest";
import { parseFilters } from "./filters";
it("bounds responses and uses a stable allowlisted sort", () => {
  expect(parseFilters({}).pageSize).toBe(25);
  expect(() => parseFilters({ pageSize: "10000" })).toThrow();
  expect(() => parseFilters({ sort: "salary;drop table employees" })).toThrow();
  expect(() => parseFilters({ page: "0" })).toThrow();
  expect(() => parseFilters({ currency: "XXX" })).toThrow();
});
it("normalizes search while preserving literal wildcard characters", () => {
  expect(
    parseFilters({ q: "  José %_  ", country: "IN", currency: "INR" }),
  ).toMatchObject({ q: "José %_", country: "IN", currency: "INR" });
  expect(() => parseFilters({ q: "a".repeat(101) })).toThrow();
});

it("requires a currency for monetary ordering", () => {
  expect(() => parseFilters({ sort: "salary-desc" })).toThrow();
  expect(parseFilters({ sort: "salary-desc", currency: "JPY" }).sort).toBe(
    "salary-desc",
  );
});
import { applyFilterDraft } from "./filters";
it("applies filter drafts atomically, resets the page and removes incompatible salary sorting", () => {
  const current = parseFilters({
    currency: "USD",
    sort: "salary-desc",
    page: 7,
    pageSize: 50,
  });
  expect(
    applyFilterDraft(current, {
      q: "  Zoë  ",
      country: "US",
      department: "",
      role: "",
      currency: "",
      sort: "salary-desc",
      pageSize: "100",
      groupBy: "department",
    }),
  ).toMatchObject({
    q: "Zoë",
    country: "US",
    sort: "name-asc",
    page: 1,
    pageSize: 100,
  });
  expect(
    applyFilterDraft(current, { currency: "", sort: "salary-desc" }).currency,
  ).toBeUndefined();
  expect(current.page).toBe(7);
});
