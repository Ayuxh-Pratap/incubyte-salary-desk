export const PRESENTATION_SECTIONS = [
  {
    slug: "",
    title: "Start here",
    summary: "The HR problem, the working product and a five-minute review.",
  },
  {
    slug: "product",
    title: "Product and scope",
    summary: "A small current-pay tool with explicit business definitions.",
  },
  {
    slug: "architecture",
    title: "Architecture and flows",
    summary: "Trace a read, an exact amount and a version-checked save.",
  },
  {
    slug: "decisions",
    title: "Decisions and AI collaboration",
    summary: "The recorded choices, revisions and real development sequence.",
  },
  {
    slug: "quality",
    title: "Quality and evidence",
    summary: "Verification, measurements, reproducibility and remaining gates.",
  },
] as const;
export function presentationHref(slug: string) {
  return "/presentation" + (slug ? "/" + slug : "");
}
export function presentationSection(slug: string) {
  return PRESENTATION_SECTIONS.find((s) => s.slug === slug);
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
