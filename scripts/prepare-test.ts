import { config } from "dotenv";
import { spawnSync } from "node:child_process";
import { isolatedTestUrl } from "./test-database";
config({ path: ".env.local", quiet: true });
const url = isolatedTestUrl();
const result = spawnSync(
  process.execPath,
  ["node_modules/tsx/dist/cli.mjs", "scripts/migrate.ts"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: url,
      DATABASE_DIRECT_URL: url,
      DATABASE_PURPOSE: "test",
    },
  },
);
process.exitCode = result.status ?? 1;
