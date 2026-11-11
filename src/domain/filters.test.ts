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
