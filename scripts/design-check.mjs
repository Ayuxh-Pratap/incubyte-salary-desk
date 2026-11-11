import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
const doc = fs.readFileSync("DESIGN.md", "utf8"),
  css = fs.readFileSync("src/app/globals.css", "utf8");
const palette = Object.fromEntries(
  [...doc.matchAll(/^  ([a-z0-9-]+): "(#[0-9a-f]{6})"/gm)].map((x) => [
    x[1],
    x[2],
  ]),
);
const mapping = {
  foreground: "ink",
  success: "success-base",
  warning: "warning-base",
  danger: "danger-base",
};
for (const [key, value] of Object.entries(palette)) {
  const name = mapping[key] || key;
  assert(
    new RegExp("--" + name + ":\\s*" + value).test(css),
    key + " differs between DESIGN.md and CSS",
  );
}
for (const value of css.match(/#[0-9a-fA-F]{6}/g) || [])
  assert(
    Object.values(palette).includes(value.toLowerCase()),
    "Undocumented CSS color " + value,
  );
function luminance(hex) {
  const values = hex
    .slice(1)
    .match(/../g)
    .map((x) => parseInt(x, 16) / 255)
    .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
}
function contrast(a, b) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
const baseBlock = css.match(/:root\s*\{([\s\S]*?)\}/)?.[1],
  darkBlock = css.match(/\.dark\s*\{([\s\S]*?)\}/)?.[1];
assert(baseBlock && darkBlock, "Both themes are required");
const properties = (block) =>
  Object.fromEntries(
    [...block.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)].map((match) => [
      match[1],
      match[2].trim(),
    ]),
  );
const root = properties(baseBlock),
  dark = { ...root, ...properties(darkBlock) };
function resolve(name, theme, seen = new Set()) {
  assert(!seen.has(name), "Cyclic token " + name);
  seen.add(name);
  const raw = theme[name];
  assert(raw, "Missing token " + name);
  const ref = raw.match(/^var\(--([a-z0-9-]+)\)$/);
  return ref ? resolve(ref[1], theme, seen) : raw;
}
const pairs = [
  ["primary-foreground", "primary"],
  ["foreground", "background"],
  ["foreground-2", "card"],
  ["muted-foreground", "muted"],
  ["success", "card"],
  ["warning", "card"],
  ["destructive", "card"],
  ["muted-foreground", "card"],
  ["muted-foreground", "table-head"],
  ["muted-foreground", "row-hover"],
  ["muted-foreground", "row-selected"],
  ["foreground-2", "inset"],
];
for (const [name, theme] of [
  ["light", root],
  ["dark", dark],
]) {
  for (const [foreground, background] of pairs) {
    const ratio = contrast(
      resolve(foreground, theme),
      resolve(background, theme),
    );
    assert(
      ratio >= 4.5,
      name +
        " " +
        foreground +
        "/" +
        background +
        " contrast " +
        ratio.toFixed(2) +
        " below 4.5",
    );
  }
  for (const surface of [
    "background",
    "card",
    "muted",
    "inset",
    "table-head",
    "row-selected",
  ])
    assert(
      contrast(resolve("ring", theme), resolve(surface, theme)) >= 3,
      name + " focus ring contrast below 3",
    );
  for (const surface of ["card", "inset"])
    assert(
      contrast(resolve("control-border", theme), resolve(surface, theme)) >= 3,
      name + " field boundary contrast below 3",
    );
}
assert(
  !/--(shadow-[a-z-]+):\s*var\(--\1\)/.test(css),
  "Self-referencing elevation token",
);
function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, item.name);
    if (item.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(p) && !p.endsWith(".test.ts")) {
      const body = fs.readFileSync(p, "utf8");
      assert(!/#[0-9a-fA-F]{3,8}\b/.test(body), "Raw palette literal in " + p);
      assert(
        !/\b(?:bg|text|border)-(?:red|green|orange|slate|gray|white|black)-?\d*\b/.test(
          body,
        ),
        "Use semantic color roles in " + p,
      );
    }
  }
}
walk("src");
console.log(
  "Design tokens, " +
    pairs.length * 2 +
    " light/dark contrast pairs and semantic source colors passed.",
);
