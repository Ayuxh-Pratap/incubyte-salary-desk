import { config } from "dotenv";
import { spawnSync } from "node:child_process";
import { isolatedTestUrl } from "./test-database";
config({ path: ".env.local", quiet: true });
const [purpose, command, ...args] = process.argv.slice(2);
const sources: Record<string, [string | undefined, string | undefined]> = {
  development: [process.env.DATABASE_URL, process.env.DATABASE_DIRECT_URL],
  test: [process.env.TEST_DATABASE_URL, process.env.TEST_DATABASE_URL],
  demo: [process.env.DEMO_DATABASE_URL, process.env.DEMO_DATABASE_DIRECT_URL],
  preview: [
    process.env.PREVIEW_DATABASE_URL,
    process.env.PREVIEW_DATABASE_DIRECT_URL,
  ],
};
if (
  !Object.hasOwn(sources, purpose) ||
  !["migrate", "seed", "reset"].includes(command)
)
  throw new Error(
    "Usage: npm run db:environment -- <development|test|demo|preview> <migrate|seed|reset> [reset confirmation]",
  );
if (purpose === "test") isolatedTestUrl();
const [url, direct] = sources[purpose];
if (!url || !direct)
  throw new Error("Configure both connection URLs for " + purpose + ".");
const child = spawnSync(
  process.execPath,
  ["node_modules/tsx/dist/cli.mjs", "scripts/" + command + ".ts", ...args],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: url,
      DATABASE_DIRECT_URL: direct,
      DATABASE_PURPOSE: purpose,
    },
  },
);
process.exitCode = child.status ?? 1;
