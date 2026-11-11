---
name: Salary Desk
colors:
  brand-green: "#014d43"
  brand-lime: "#d3fe73"
  canvas: "#fbfaf9"
  surface: "#f4f4f3"
  paper: "#ffffff"
  foreground: "#1c1917"
  secondary-text: "#57534e"
  muted-text: "#6b655f"
  dark-canvas: "#111a18"
  dark-surface: "#18231f"
  dark-paper: "#213029"
  dark-text: "#f4f4f5"
  dark-muted: "#b0beb5"
  success: "#06734f"
  warning: "#875700"
  danger: "#b91c35"
  dark-success: "#6ee7b7"
  dark-warning: "#fcd34d"
  dark-danger: "#fda4af"
---

# Salary Desk design

Salary Desk is a compact HR workspace for fictional ACME. Preserve the restrained Job Desk foundation while composing only salary-management workflows. Incubyte-inspired accents identify an assessment concept, not an official internal system.

## Tokens and implementation

The front matter documents runtime palette values. src/app/globals.css defines them and maps semantic roles into Tailwind utilities. DESIGN.md does not generate CSS. The design consistency check compares both and checks accessible text/action pairs and unapproved palette literals.

Observed public accents #014d43 and #d3fe73 come from incubyte.co inline styling inspected 2026-11-11. No published brand-standard claim. Light primary: green background / white text. Dark primary: lime background / deep-green text. Status roles remain distinct from the brand accent. Focus uses a clearly visible solid ring with an offset, never color alone.

## Typography and surfaces

Geist sans for the interface; tabular numbers for salaries, counts and dates. Page title 24 px / 30 px desktop, headings 18 px, interface text 14 px, supporting text 12 px. Salary units/currency must remain visible. Use neutral canvas, field, paper and inset surfaces with hairlines and restrained shadows. Cards rest flat; controls may use tactile inset highlights. Radius: 6, 8, 12 and 16 px. Do not add gradients, glows, decorative charts or nested panels.

## Responsive shell

Desktop has a compact left navigation with Employees and Salary overview, ACME identity and theme controls. Mobile has a compact header and two clear navigation destinations; employee records become labelled cards instead of a compressed table. Main content must not overflow at 320 px. Safe areas and minimum 44 px touch controls apply. Use semantic Tailwind roles, no BEM parallel system.

## Interaction

Employee panels use reviewed accessible sheet/dialog primitives with labelled titles, focus containment, Escape/close behavior and scrollable content. Preserve unsaved/failed input; show pending, invalid, error, conflict and success explicitly. Confirmed writes alone trigger success. Salary-change preview communicates amount, currency, annual basis and percentage. Summary tiles open explanations with population and matching employees. Avoid implying fairness or market comparisons.

Both themes and keyboard focus are required. Honor prefers-reduced-motion, keep ordinary transitions restrained, and avoid decorative motion. Shared primitive variants own control states; domain components compose them. No pipeline terms, job statuses, personal search indexes, PWA or service workers.
