export const PRESENTATION_SECTIONS = [
  {
    slug: "",
    title: "Assessment overview",
    navLabel: "Overview",
    summary:
      "Objective, implementation status and a guide to reviewing the submission.",
  },
  {
    slug: "product",
    title: "Requirements and scope",
    navLabel: "Requirements and scope",
    summary:
      "Assessment requirements, working definitions, workflows and deliberate exclusions.",
  },
  {
    slug: "architecture",
    title: "Architecture and implementation",
    navLabel: "Architecture and flows",
    summary:
      "System boundaries, data model, exact money, safe writes and cache behavior.",
  },
  {
    slug: "decisions",
    title: "Decisions and AI collaboration",
    navLabel: "Decisions and AI",
    summary:
      "Recorded tradeoffs, implementation revisions and the actual development sequence.",
  },
  {
    slug: "quality",
    title: "Verification and delivery",
    navLabel: "Verification",
    summary:
      "Requirement evidence, tests, measured performance, limitations and outstanding deliverables.",
  },
] as const;
export function presentationHref(slug: string) {
  return "/presentation" + (slug ? "/" + slug : "");
}
export function presentationSection(slug: string) {
  return PRESENTATION_SECTIONS.find((section) => section.slug === slug);
}
export function markdownSection(markdown: string, title: string) {
  const marker = "## " + title + "\n",
    normalized = markdown.replace(/\r\n/g, "\n"),
    start = normalized.indexOf(marker);
  if (start < 0)
    throw new Error("Missing canonical presentation section: " + title);
  const body = start + marker.length,
    end = normalized.indexOf("\n## ", body);
  return normalized.slice(body, end < 0 ? undefined : end).trim();
}
