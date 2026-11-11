import { createHash, timingSafeEqual } from "node:crypto";
export function assertOrigin(origin: string | null, expected: string): void {
  if (!origin || origin !== new URL(expected).origin)
    throw new Error("Untrusted request origin.");
}
export function validCredential(input: string, expected: string): boolean {
  if (!expected) return false;
  return timingSafeEqual(
    createHash("sha256").update(input).digest(),
    createHash("sha256").update(expected).digest(),
  );
}
export function assertEnvironment(
  config: { purpose: string | undefined; vercelEnv?: string },
  marker: string,
): void {
  if (
    !config.purpose ||
    !["development", "test", "demo", "preview"].includes(config.purpose) ||
    config.purpose !== marker
  )
    throw new Error("Database environment mismatch.");
  if (config.vercelEnv === "preview" && config.purpose !== "preview")
    throw new Error("Preview requires an isolated preview database.");
  if (config.vercelEnv === "production" && config.purpose !== "demo")
    throw new Error("Production requires the synthetic demo database.");
}
