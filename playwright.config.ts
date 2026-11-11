import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: { baseURL: "http://localhost:3100", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev -- --port 3100",
    url: "http://localhost:3100/api/health",
    reuseExistingServer: !process.env.CI,
    env: { APP_ORIGIN: "http://localhost:3100" },
    timeout: 120000,
  },
});
