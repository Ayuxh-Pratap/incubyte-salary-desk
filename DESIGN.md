---
name: Salary Desk
colors:
  brand-green: "#014d43"
  brand-lime: "#d3fe73"
  canvas: "#f5f5f4"
  surface: "#fafafa"
  paper: "#ffffff"
  foreground: "#1c1d1b"
  secondary-text: "#44483f"
  muted-text: "#5c6058"
  inset-base: "#f0f0ef"
  table-head-base: "#e7e7e5"
  row-hover-base: "#f5f5f3"
  row-selected-base: "#e7eddf"
  border-base: "#c5c8c2"
  control-border-base: "#787d73"
  action: "#27513b"
  dark-canvas: "#101112"
  dark-surface: "#18191b"
  dark-paper: "#232427"
  dark-text: "#f4f4f5"
  dark-secondary-text: "#d4d5d9"
  dark-muted: "#b6b7bc"
  dark-inset: "#1d1e21"
  dark-table-head: "#303135"
  dark-row-hover: "#2a2b2f"
  dark-row-selected: "#30392a"
  dark-border: "#4c4e53"
  dark-control-border: "#7c7e86"
  dark-action-text: "#1c2710"
  success: "#06734f"
  warning: "#875700"
  danger: "#b91c35"
  dark-success: "#6ee7b7"
  dark-warning: "#fcd34d"
  dark-danger: "#fda4af"
---

# Salary Desk design

P1 Graphite + Lime was explicitly selected in the visual-quality pass. Neutral canvas, content field, panels and insets carry the interface. Green (light) / lime (dark) identifies intentional actions and focus; status roles remain independent. Brand-green/lime are observed Incubyte website accents, not a published brand standard or an official-system claim.

## Tokens and implementation

The front matter documents runtime palette values in src/app/globals.css. It does not generate CSS. Semantic roles map into Tailwind; the check compares documented literals and resolved contrast pairs. Palette alternatives and their measured pairs are review artifacts only, never a settings feature.

Surface roles: background is the outer canvas/sidebar, muted is the inset content field, card is a panel, inset is a recessed control track. Table-head, row-hover and row-selected are distinct roles, not one reused fill. Foreground/foreground-2/muted-foreground form the text hierarchy. Border is a decorative panel hairline; control-border identifies fields at >=3:1. Focus is a solid adjacent 2px outline, zero offset and no layout shift; dialogs draw it inward at viewport edges.

## Typography and data

Packaged Geist; 24px page title, 18px section title, 14px interface, 12px metadata. Counts and money use tabular numerals; numeric columns align right. Salary cells retain full currency and annual-base units; long names wrap or have an accessible full value. Country is independent of pay currency. No chart may add currencies or imply historical change/fairness.

## Shell and responsive composition

Desktop: 224px collapsible navigation (64px collapsed), fixed viewport frame, 12px top inset. The main panel has top/left edges and rounded top-left corner, flush right/bottom. It is the primary scroller. Content uses full available width with 16px mobile/24px desktop internal gutters; reading text/dialogs alone may cap width. Navigation distinguishes Dashboard and Workspace (Employees, Salary overview); footer groups compact appearance/logout and a concise assessment disclaimer. No promotional block.

At >=1280px, a 224px filter rail sticks beside results inside the main scroller. Its own overflow activates only when height requires it; native keyboard scrolling and focus reach all controls. Below that, filters move into a labelled modal sheet, preserving capabilities and draft state. Mobile navigation has three destinations; data uses readable cards below 768px and intentional labelled horizontal table scrolling above. Minimum 44px targets and 320px body-width safety apply.

## Controls and motion

Shared Base UI/CVA buttons use separate sh-* values mapped to Tailwind shadow roles (no self-referencing shadow token). Primary/outline actions have a subtle top highlight and hairline/short shadow, hover and pressed tokens; secondary/ghost row actions and active segments remain quiet. Fields use control-border and restrained inset treatment; no glow/gradient. Theme segments share the inset track and quiet selected panel. Existing Motion/Animate UI handle shell/sheets with reduced motion respected.

## State and verification

All filter drafts apply together. URL state defines the accepted population; transitions immediately mark only affected results busy. Skeletons reuse table column/row/card tracks, reserve headers and pagination, and never show old rows under new labels. Failed writes preserve proposals and show no success; optimistic conflicts require review. Retry, empty, loading and success states stay explicit.

Review evidence, data definitions, scorecards and limitations live in docs/UI_REVIEW.md. Both themes, representative sizes, keyboard focus and controlled latency/failure/navigation cases must be exercised. Preserve the existing semantic styling and accessible Base UI/Animate UI foundations; no additional primitive library or BEM layer.
