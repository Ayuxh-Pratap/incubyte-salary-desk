import { describe, it, expect } from "vitest";
import fs from "node:fs";
import {
  PRESENTATION_SECTIONS,
  markdownSection,
  presentationSection,
} from "./presentation";
import {
  SOURCES,
  ARTIFACTS,
  sourceKey,
  artifactKey,
} from "../server/presentation/catalog";
describe("curated Presentation content", () => {
  it("only resolves explicitly reviewed source/artifact keys", () => {
    for (const unsafe of [
      "../.env.local",
      "__proto__",
      "constructor",
      "../../docs/private",
      "%2e%2e",
    ]) {
      expect(sourceKey(unsafe)).toBeUndefined();
      expect(artifactKey(unsafe)).toBeUndefined();
    }
    expect(sourceKey("money")).toBe("money");
    expect(artifactKey("requirements")).toBe("requirements");
  });
  it("extracts exactly the selected canonical section and fails closed when missing", () => {
    const content = fs.readFileSync("docs/PRESENTATION.md", "utf8");
    for (const section of PRESENTATION_SECTIONS) {
      const selected = markdownSection(content, section.title);
      expect(selected.length).toBeGreaterThan(100);
      expect(selected).not.toMatch(/^## /m);
    }
    expect(() => markdownSection(content, "missing")).toThrow();
    expect(presentationSection("../private")).toBeUndefined();
  });
  it("keeps source excerpt anchors and reviewed artifact paths valid", () => {
    for (const source of Object.values(SOURCES))
      expect(fs.readFileSync(source.file, "utf8")).toContain(source.focus);
    for (const artifact of Object.values(ARTIFACTS)) {
      expect(artifact.file).not.toMatch(/env|vercel|resume|\.eml/);
    }
  });
});
