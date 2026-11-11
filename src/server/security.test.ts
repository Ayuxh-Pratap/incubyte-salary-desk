import { it, expect } from "vitest";
import { assertOrigin, assertEnvironment, validCredential } from "./security";
it("rejects absent or foreign mutation origins", () => {
  for (const origin of [
    null,
    "https://evil.example",
    "null",
    "https://salary.example.evil",
  ])
    expect(() => assertOrigin(origin, "https://salary.example")).toThrow();
  expect(() =>
    assertOrigin("https://salary.example", "https://salary.example"),
  ).not.toThrow();
});
it("fails closed when preview could write demo data or environment is unmarked", () => {
  expect(() =>
    assertEnvironment({ purpose: "demo", vercelEnv: "preview" }, "demo"),
  ).toThrow();
  expect(() => assertEnvironment({ purpose: "test" }, "demo")).toThrow();
  expect(() =>
    assertEnvironment({ purpose: undefined }, "development"),
  ).toThrow();
  expect(() =>
    assertEnvironment({ purpose: "development" }, "development"),
  ).not.toThrow();
});
it("compares credentials without accepting prefixes or missing configuration", () => {
  expect(validCredential("correct", "correct")).toBe(true);
  expect(validCredential("correctx", "correct")).toBe(false);
  expect(validCredential("", "")).toBe(false);
});
