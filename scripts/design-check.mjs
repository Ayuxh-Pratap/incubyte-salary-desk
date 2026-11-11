import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
const css = fs.readFileSync("src/app/globals.css", "utf8"),
  manifest = JSON.parse(fs.readFileSync("docs/design-foundation.json", "utf8"));
const props = (b) =>
  Object.fromEntries(
    [...b.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)].map((m) => [
      m[1],
      m[2].trim(),
    ]),
  );
const roots = [...css.matchAll(/:root\s*\{([\s\S]*?)\}/g)].map((m) =>
  props(m[1]),
);
const light = Object.assign({}, ...roots),
  dark = Object.assign(
    {},
    light,
    ...[...css.matchAll(/\.dark\s*\{([\s\S]*?)\}/g)].map((m) => props(m[1])),
  ),
  theme = Object.assign(
    {},
    ...[...css.matchAll(/@theme inline\s*\{([\s\S]*?)\}/g)].map((m) =>
      props(m[1]),
    ),
  );
let matched = 0;
for (const [section, actual] of [
  ["light", light],
  ["dark", dark],
  ["theme", theme],
])
  for (const [key, value] of Object.entries(manifest[section])) {
    assert.equal(
      actual[key].replace(/\s+/g, " "),
      value.replace(/\s+/g, " "),
      section + " --" + key + " differs from vendored Job Desk",
    );
    matched++;
  }
assert(
  !/brand-lime|brand-green|#d3fe73|#014d43/i.test(css),
  "Obsolete branding",
);
assert(!/--(shadow-[a-z-]+):\s*var\(--\1\)/.test(css), "Cyclic shadow");
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(p) && !p.endsWith(".test.ts")) {
      const s = fs.readFileSync(p, "utf8");
      assert(!/#[0-9a-f]{3,8}\b/i.test(s), "Palette literal " + p);
      assert(!/<select\b/.test(s), "Native selector " + p);
    }
  }
}
walk("src");

function resolve(name, values) {
  const raw = values[name];
  assert(raw, "Missing " + name);
  const ref = raw.match(/^var\(--([a-z0-9-]+)\)$/);
  return ref ? resolve(ref[1], values) : raw;
}
function luminance(hex) {
  assert(/^#[a-f0-9]{6}$/i.test(hex), "Expected resolved opaque swatch " + hex);
  const c = hex
    .slice(1)
    .match(/../g)
    .map((v) => parseInt(v, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
}
const contrasts = [];
for (const [name, values] of [
  ["light", light],
  ["dark", dark],
])
  for (const [fg, bg, min] of [
    ["foreground", "background", 4.5],
    ["foreground-2", "background", 4.5],
    ["card-foreground", "card", 4.5],
    ["muted-foreground", "card", 4.5],
    ["primary-foreground", "action-fill", 4.5],
    ["ring", "background", 3],
    ["ring", "card", 3],
    ["ring", "muted", 3],
  ]) {
    const a = luminance(resolve(fg, values)),
      b = luminance(resolve(bg, values)),
      ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    contrasts.push({
      theme: name,
      foreground: fg,
      background: bg,
      ratio: Math.round(ratio * 100) / 100,
      minimum: min,
    });
    assert(ratio >= min, name + " " + fg + "/" + bg + " contrast " + ratio);
  }
fs.writeFileSync(
  "docs/review/contrast-fidelity.json",
  JSON.stringify(contrasts, null, 2) + "\n",
);
console.log(
  `${matched} vendored Job Desk values/mappings match; semantic source colors, branding removal and custom selectors passed.`,
);
