import { assertEnvironment } from "../src/server/security";
import type { Pool } from "pg";
function identity(raw: string) {
  const url = new URL(raw);
  return url.hostname.replace("-pooler.", ".") + url.pathname;
}
export function isolatedTestUrl() {
  const test = process.env.TEST_DATABASE_URL;
  if (!test || process.env.TEST_DATABASE_PURPOSE !== "test")
    throw new Error(
      "Set an explicitly isolated TEST_DATABASE_URL and TEST_DATABASE_PURPOSE=test.",
    );
  for (const key of [
    "DATABASE_URL",
    "DATABASE_DIRECT_URL",
    "DEMO_DATABASE_URL",
    "PREVIEW_DATABASE_URL",
  ]) {
    const other = process.env[key];
    if (other && identity(test) === identity(other))
      throw new Error("Test database must differ from " + key + ".");
  }
  return test;
}
export async function verifyTestMarker(pool: Pool) {
  const { rows } = await pool.query(
    "select purpose from salary_desk_environment where id=1",
  );
  assertEnvironment({ purpose: "test" }, rows[0]?.purpose);
}
