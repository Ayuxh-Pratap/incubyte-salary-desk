import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";
import { isolatedTestUrl } from "./scripts/test-database";
config({ path: ".env.local", quiet: true });
const live = process.env.E2E_LIVE_DATABASE === "true";
const testUrl = live ? isolatedTestUrl() : undefined;
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: { baseURL: "http://localhost:3100", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run start -- --port 3100",
    url: "http://localhost:3100/api/health",
    reuseExistingServer: false,
    env: {
      APP_ORIGIN: "http://localhost:3100",
      ...(live ? { DATABASE_URL: testUrl!, DATABASE_PURPOSE: "test" } : {}),
    },
    timeout: 120000,
  },
});
