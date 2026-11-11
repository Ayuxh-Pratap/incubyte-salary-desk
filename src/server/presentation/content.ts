import "server-only";
import { cache } from "react";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ARTIFACTS, SOURCES } from "./catalog";
// Literal file paths keep deployment tracing as narrow as the reviewed catalogs.
export const readPresentation = cache(() =>
  readFile(path.join(process.cwd(), "docs/PRESENTATION.md"), "utf8"),
);
const artifactLoaders = {
  requirements: cache(() =>
    readFile(path.join(process.cwd(), "REQUIREMENTS.md"), "utf8"),
  ),
  engineering: cache(() =>
    readFile(path.join(process.cwd(), "docs/ENGINEERING.md"), "utf8"),
  ),
  "ai-record": cache(() =>
    readFile(path.join(process.cwd(), "docs/AI_COLLABORATION.md"), "utf8"),
  ),
  delivery: cache(() =>
    readFile(path.join(process.cwd(), "docs/DELIVERY.md"), "utf8"),
  ),
  "current-verification": cache(() =>
    readFile(
      path.join(process.cwd(), "docs/review/final-pass/verification.json"),
      "utf8",
    ),
  ),
  "idle-before": cache(() =>
    readFile(
      path.join(process.cwd(), "docs/review/final-pass/chart-idle-before.json"),
      "utf8",
    ),
  ),
  "idle-after": cache(() =>
    readFile(
      path.join(process.cwd(), "docs/review/final-pass/chart-idle-after.json"),
      "utf8",
    ),
  ),
  "performance-before": cache(() =>
    readFile(
      path.join(
        process.cwd(),
        "docs/review/final-pass/performance-before.json",
      ),
      "utf8",
    ),
  ),
  "performance-after": cache(() =>
    readFile(
      path.join(process.cwd(), "docs/review/final-pass/performance-after.json"),
      "utf8",
    ),
  ),
  "previous-review": cache(() =>
    readFile(path.join(process.cwd(), "docs/FIDELITY_PERFORMANCE.md"), "utf8"),
  ),
};
const sourceLoaders = {
  money: cache(() =>
    readFile(path.join(process.cwd(), "src/domain/money.ts"), "utf8"),
  ),
  queries: cache(() =>
    readFile(
      path.join(process.cwd(), "src/server/employees/queries.ts"),
      "utf8",
    ),
  ),
  salary: cache(() =>
    readFile(
      path.join(process.cwd(), "src/server/employees/salary-repository.ts"),
      "utf8",
    ),
  ),
  chart: cache(() =>
    readFile(
      path.join(process.cwd(), "src/components/dashboard-plot.tsx"),
      "utf8",
    ),
  ),
  cache: cache(() =>
    readFile(path.join(process.cwd(), "src/lib/read-cache.ts"), "utf8"),
  ),
  freshness: cache(() =>
    readFile(path.join(process.cwd(), "src/components/use-remote.ts"), "utf8"),
  ),
  schema: cache(() =>
    readFile(path.join(process.cwd(), "src/server/db/schema.ts"), "utf8"),
  ),
};
export const readArtifact = (key: keyof typeof ARTIFACTS) =>
  artifactLoaders[key]();
export const readSource = (key: keyof typeof SOURCES) => sourceLoaders[key]();
export function excerpt(content: string, focus: string) {
  const lines = content.split(/\r?\n/),
    index = lines.findIndex((line) => line.includes(focus));
  if (index < 0) throw new Error("Source excerpt anchor needs review");
  const start = Math.max(0, index - 3);
  return { start: start + 1, text: lines.slice(start, start + 11).join("\n") };
}
