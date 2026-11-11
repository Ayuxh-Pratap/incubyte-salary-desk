import { spawnSync } from "node:child_process";
console.log(
  "Verifying a production build without runtime database/session credentials.",
);
const result = spawnSync(
  process.execPath,
  ["node_modules/next/dist/bin/next", "build"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: "",
      DATABASE_DIRECT_URL: "",
      SESSION_SECRET: "",
      EVALUATOR_PASSWORD: "",
    },
  },
);
process.exitCode = result.status ?? 1;
