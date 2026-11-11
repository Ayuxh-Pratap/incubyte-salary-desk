import { config } from "dotenv";
import { spawnSync } from "node:child_process";
import { Pool } from "pg";
import { isolatedTestUrl, verifyTestMarker } from "./test-database";
config({ path: ".env.local", quiet: true });
const url = isolatedTestUrl();
const pool = new Pool({ connectionString: url, max: 1 });
try {
  await verifyTestMarker(pool);
} finally {
  await pool.end();
}
const result = spawnSync(
  process.execPath,
  ["node_modules/@playwright/test/cli.js", "test", "live-hr.spec.ts"],
  { stdio: "inherit", env: { ...process.env, E2E_LIVE_DATABASE: "true" } },
);
process.exitCode = result.status ?? 1;
