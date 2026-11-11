import { describe, it, expect } from "vitest";
import {
  parseSalary,
  formatMoney,
  summarize,
  formatRational,
  changePreview,
  assertCompatible,
  MAX_MINOR,
} from "./money";
describe("salary parsing in exact minor units", () => {
  it("respects 0, 2 and 3 decimal currencies", () => {
    expect(parseSalary("1250", "JPY")).toBe(1250n);
    expect(parseSalary("1234.50", "INR")).toBe(123450n);
    expect(parseSalary("12.345", "KWD")).toBe(12345n);
  });
  it("never rounds input or accepts ambiguous notation", () => {
    for (const x of [
      "",
      "0",
      "-1",
      "1e4",
      "1,000",
      " 1",
      "1 ",
      "NaN",
      ".50",
      "1.",
      "+1",
      "1.001",
    ])
      expect(() => parseSalary(x, "USD")).toThrow();
    expect(() => parseSalary("1.0", "JPY")).toThrow();
  });
  it("rejects unsupported units and values beyond the PostgreSQL-safe ceiling", () => {
    expect(() => parseSalary("1", "XXX")).toThrow();
    expect(() => parseSalary((MAX_MINOR + 1n).toString(), "JPY")).toThrow();
    expect(parseSalary(MAX_MINOR.toString(), "JPY")).toBe(MAX_MINOR);
  });
  it("keeps values beyond Number.MAX_SAFE_INTEGER exact", () => {
    expect(parseSalary("90071992547409.93", "USD")).toBe(9007199254740993n);
    expect(formatMoney("9007199254740993", "USD")).toBe(
      "USD 90,071,992,547,409.93",
    );
  });
});
describe("full-population exact statistics", () => {
  it("defines empty and singleton populations", () => {
    expect(summarize([])).toEqual({
      count: 0,
      total: "0",
      min: null,
      max: null,
      median: null,
    });
    expect(summarize(["17"])).toEqual({
      count: 1,
      total: "17",
      min: "17",
      max: "17",
      median: { numerator: "17", denominator: 1 },
    });
  });
  it("does not mutate input and retains an even median half-unit", () => {
    const amounts = ["104", "101", "102", "100"];
    expect(summarize(amounts)).toEqual({
      count: 4,
      total: "407",
      min: "100",
      max: "104",
      median: { numerator: "203", denominator: 2 },
    });
    expect(amounts[0]).toBe("104");
    expect(formatRational({ numerator: "203", denominator: 2 }, "USD")).toBe(
      "USD 1.02",
    );
  });
  it("handles odd medians and tied values", () => {
    expect(summarize(["50", "20", "20"]).median).toEqual({
      numerator: "20",
      denominator: 1,
    });
    expect(summarize(["9007199254740993", "9007199254740993"]).total).toBe(
      "18014398509481986",
    );
  });
  it("rejects incompatible currency or period before comparison", () => {
    expect(() =>
      assertCompatible(
        { currency: "INR", period: "annual" },
        { currency: "USD", period: "annual" },
      ),
    ).toThrow();
    expect(() =>
      assertCompatible(
        { currency: "INR", period: "annual" },
        { currency: "INR", period: "monthly" },
      ),
    ).toThrow();
  });
});
describe("salary change preview", () => {
  it("calculates exact signed amounts and half-up percentages", () => {
    expect(changePreview("300", "301", "USD")).toEqual({
      absolute: "USD 0.01",
      percentage: "+0.33%",
      direction: "increase",
    });
    expect(changePreview("20000", "19999", "USD").percentage).toBe("-0.01%");
    expect(changePreview("100", "100", "USD").direction).toBe("unchanged");
  });
  it("rejects zero and invalid denominators", () => {
    expect(() => changePreview("0", "100", "USD")).toThrow();
  });
});
