import { createHash, timingSafeEqual } from "node:crypto";
export function assertOrigin(
  origin: string | null,
  expected: string | readonly string[],
): void {
  const allowed = (typeof expected === "string" ? [expected] : expected).map(
    (value) => new URL(value).origin,
  );
  if (!origin || !allowed.includes(origin))
    throw new Error("Untrusted request origin.");
}
export function trustedAppOrigins(
  env: Record<string, string | undefined> = process.env,
): string[] {
  const origins: string[] = [];
  if (env.APP_ORIGIN) {
    const primary = new URL(env.APP_ORIGIN);
    if (
      !["http:", "https:"].includes(primary.protocol) ||
      primary.username ||
      primary.password ||
      primary.pathname !== "/" ||
      primary.search ||
      primary.hash
    )
      throw new Error("Configure an exact HTTP(S) application origin.");
    if (env.VERCEL === "1" && primary.protocol !== "https:")
      throw new Error("Deployed origins must use HTTPS.");
    origins.push(primary.origin);
  }
  if (env.VERCEL === "1")
    for (const host of [
      env.VERCEL_URL,
      env.VERCEL_BRANCH_URL,
      env.VERCEL_PROJECT_PRODUCTION_URL,
    ])
      if (host && /^[a-z0-9.-]+\.vercel\.app$/i.test(host))
        origins.push("https://" + host);
  if (!origins.length) throw new Error("Application origin is not configured.");
  return [...new Set(origins)];
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
