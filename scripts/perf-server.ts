import { config } from "dotenv";
import { spawn } from "node:child_process";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { isolatedTestUrl } from "./test-database";
config({ path: ".env.local", quiet: true });
const output = fs.openSync(".vercel/perf-server.log", "w");
const child = spawn(
  process.execPath,
  [
    "--import",
    pathToFileURL(path.resolve("scripts/perf-db-probe.mjs")).href,
    "node_modules/next/dist/bin/next",
    "start",
    "--port",
    "3300",
  ],
  {
    stdio: ["ignore", output, output],
    env: {
      ...process.env,
      DATABASE_URL: isolatedTestUrl(),
      DATABASE_PURPOSE: "test",
      APP_ORIGIN: "http://localhost:3300",
    },
  },
);
console.log(
  "Isolated production measurement server on port 3300; PID " + child.pid,
);
child.on("exit", (code) => process.exit(code ?? 1));
