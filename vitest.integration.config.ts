import { defineConfig } from "vitest/config";
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
export default defineConfig({
  test: {
    include: ["tests/integration/**/*.test.ts"],
    environment: "node",
    fileParallelism: false,
    testTimeout: 60000,
    hookTimeout: 120000,
  },
});
