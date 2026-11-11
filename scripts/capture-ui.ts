import { spawnSync } from "node:child_process";
import { config } from "dotenv";
import { isolatedTestUrl } from "./test-database";
config({ path: ".env.local", quiet: true });
isolatedTestUrl();
const result = spawnSync(
  process.execPath,
  [
    "node_modules/@playwright/test/cli.js",
    "test",
    "tests/e2e/visual-matrix.spec.ts",
  ],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      E2E_LIVE_DATABASE: "true",
      CAPTURE_UI_REVIEW: "true",
    },
  },
);
process.exitCode = result.status ?? 1;
