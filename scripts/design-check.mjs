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
      actual[key],
      value,
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
console.log(
  `${matched} vendored Job Desk values/mappings match; semantic source colors, branding removal and custom selectors passed.`,
);
