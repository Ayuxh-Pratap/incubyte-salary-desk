import Link from "next/link";
import { notFound } from "next/navigation";
import {
  PRESENTATION_SECTIONS,
  presentationHref,
  presentationSection,
  markdownSection,
} from "@/lib/presentation";
import { readPresentation } from "@/server/presentation/content";
import { PresentationBody } from "@/components/presentation/content";
export default async function PresentationPage({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}) {
  const { section: segments = [] } = await params;
  if (segments.length > 1) notFound();
  const section = presentationSection(segments[0] ?? "");
  if (!section) notFound();
  const content = markdownSection(await readPresentation(), section.title);
  return (
    <article className="mx-auto w-full max-w-[1200px] min-w-0 pb-10">
      <header>
        <p className="text-meta text-muted-foreground">
          Presentation · Engineering case study
        </p>
        <h1 className="mt-2 text-title font-semibold tracking-tight">
          {section.title}
        </h1>
        <p className="mt-3 text-ui text-foreground-2">{section.summary}</p>
      </header>
      <nav
        aria-label="Presentation sections"
        className="my-6 flex flex-wrap gap-2"
      >
        {PRESENTATION_SECTIONS.map((item) => (
          <Link
            prefetch={false}
            key={item.slug}
            href={presentationHref(item.slug)}
            aria-current={item.slug === section.slug ? "page" : undefined}
            className={`min-h-11 rounded-lg px-3 py-3 text-meta transition-colors ${item.slug === section.slug ? "bg-inset font-medium text-foreground" : "text-muted-foreground hover:bg-inset hover:text-foreground"}`}
          >
            {item.title}
          </Link>
        ))}
      </nav>
      <PresentationBody content={content} />
      <footer className="mt-8 border-t pt-4 text-meta text-muted-foreground">
        Canonical narrative: docs/PRESENTATION.md · Synthetic assessment concept
        · Review evidence is labeled by version.
      </footer>
    </article>
  );
}
