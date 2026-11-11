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

it("accepts only configured and platform-issued preview origins", async () => {
  const { trustedAppOrigins } = await import("./security");
  expect(trustedAppOrigins({ APP_ORIGIN: "http://localhost:3000" })).toEqual([
    "http://localhost:3000",
  ]);
  expect(
    trustedAppOrigins({
      APP_ORIGIN: "https://salary.example",
      VERCEL: "1",
      VERCEL_URL: "salary-abc.vercel.app",
      VERCEL_BRANCH_URL: "salary-feature.vercel.app",
    }),
  ).toEqual([
    "https://salary.example",
    "https://salary-abc.vercel.app",
    "https://salary-feature.vercel.app",
  ]);
  expect(() =>
    assertOrigin(
      "https://evil.example",
      trustedAppOrigins({ APP_ORIGIN: "https://salary.example" }),
    ),
  ).toThrow();
  expect(() =>
    trustedAppOrigins({ APP_ORIGIN: "http://salary.example", VERCEL: "1" }),
  ).toThrow();
});

it("can use a verified platform deployment URL before a canonical domain exists", async () => {
  const { trustedAppOrigins } = await import("./security");
  expect(
    trustedAppOrigins({ VERCEL: "1", VERCEL_URL: "salary-review.vercel.app" }),
  ).toEqual(["https://salary-review.vercel.app"]);
  expect(() =>
    trustedAppOrigins({ VERCEL: "1", VERCEL_URL: "evil.example" }),
  ).toThrow();
});
