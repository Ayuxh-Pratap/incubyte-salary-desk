import "server-only";
import { cache } from "react";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ARTIFACTS, SOURCES } from "./catalog";
const read = cache((file: string) =>
  readFile(path.join(process.cwd(), file), "utf8"),
);
export const readPresentation = () => read("docs/PRESENTATION.md");
export const readArtifact = (key: keyof typeof ARTIFACTS) =>
  read(ARTIFACTS[key].file);
export const readSource = (key: keyof typeof SOURCES) =>
  read(SOURCES[key].file);
export function excerpt(content: string, focus: string) {
  const lines = content.split(/\r?\n/),
    index = lines.findIndex((line) => line.includes(focus));
  if (index < 0) throw new Error("Source excerpt anchor needs review");
  const start = Math.max(0, index - 3);
  return { start: start + 1, text: lines.slice(start, start + 11).join("\n") };
}
