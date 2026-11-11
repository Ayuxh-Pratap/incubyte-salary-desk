import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import {
  PRESENTATION_SECTIONS,
  presentationSection,
  presentationHref,
  markdownSection,
} from "@/lib/presentation";
import { readPresentation } from "@/server/presentation/content";
import { REPOSITORY } from "@/server/presentation/catalog";
import { PresentationBody } from "@/components/presentation/content";
import { LinkPending } from "@/components/link-pending";
export default async function PresentationPage({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}) {
  const { section: segments = [] } = await params;
  if (segments.length > 1) notFound();
  const section = presentationSection(segments[0] ?? "");
  if (!section) notFound();
  const index = PRESENTATION_SECTIONS.indexOf(section),
    previous = PRESENTATION_SECTIONS[index - 1],
    next = PRESENTATION_SECTIONS[index + 1];
  const narrative = await readPresentation();
  return (
    <article
      data-case-study
      data-assessment-report
      className="w-full min-w-0 pb-10"
    >
      <header className="pt-2 pb-7 md:pb-9">
        <div className="flex flex-wrap items-center justify-between gap-3 text-meta text-muted-foreground">
          <p>Salary Desk · Assessment report and engineering case study</p>
          <p>
            Section {index + 1} of {PRESENTATION_SECTIONS.length} · Local review
          </p>
        </div>
        <div className="mt-5 flex flex-wrap items-start justify-between gap-5">
          <div>
            <h1 className="text-title-lg font-medium tracking-tight">
              {section.title}
            </h1>
            <p className="mt-3 max-w-[85ch] text-ui leading-relaxed text-foreground-2">
              {section.summary}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              prefetch={false}
              href="/dashboard?currency=USD"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-card px-4 text-ui font-medium shadow-button hover:shadow-button-hover"
            >
              Open workspace
              <ArrowRight aria-hidden className="size-4" />
            </Link>
            <a
              href={REPOSITORY}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-meta text-foreground-2 hover:bg-inset"
            >
              Published baseline source
              <ArrowUpRight aria-hidden className="size-4" />
            </a>
          </div>
        </div>
        <p className="mt-4 text-meta text-muted-foreground">
          Incubyte · Software Craftsperson / TypeScript II assessment ·
          Fictional ACME · Synthetic data
        </p>
      </header>
      <nav
        aria-label="Presentation sections"
        className="mb-8 flex flex-wrap gap-2 border-y py-3"
      >
        {PRESENTATION_SECTIONS.map((item, i) => (
          <Link
            key={item.slug}
            prefetch={false}
            href={presentationHref(item.slug)}
            aria-label={item.title}
            aria-current={item.slug === section.slug ? "page" : undefined}
            className={`relative isolate inline-flex min-h-11 items-center gap-2 overflow-hidden rounded-lg px-3 text-meta transition-colors ${item.slug === section.slug ? "bg-inset font-medium text-foreground" : "text-foreground-2 hover:bg-inset hover:text-foreground"}`}
          >
            <LinkPending />
            <span aria-hidden className="tabular-nums text-muted-foreground">
              0{i + 1}
            </span>
            {item.navLabel}
          </Link>
        ))}
      </nav>
      <PresentationBody content={markdownSection(narrative, section.title)} />
      <footer className="mt-9 border-t pt-5">
        <nav
          aria-label="Report sequence"
          className="flex flex-wrap items-center justify-between gap-4"
        >
          {previous ? (
            <Link
              prefetch={false}
              href={presentationHref(previous.slug)}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-ui text-foreground-2 hover:bg-inset"
            >
              <ArrowLeft aria-hidden className="size-4" />
              {previous.title}
            </Link>
          ) : (
            <span className="text-meta text-muted-foreground">
              Requirements → Implementation → Decisions → Evidence
            </span>
          )}
          {next ? (
            <Link
              prefetch={false}
              href={presentationHref(next.slug)}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-card px-4 text-ui font-medium shadow-button hover:shadow-button-hover"
            >
              {next.title}
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          ) : (
            <Link
              prefetch={false}
              href="/dashboard"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-card px-4 text-ui font-medium shadow-button hover:shadow-button-hover"
            >
              Review the working product
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          )}
        </nav>
        <p className="mt-5 text-meta text-muted-foreground">
          Independent assessment concept · Canonical report:
          docs/PRESENTATION.md · Evidence is labeled by source and environment.
        </p>
      </footer>
    </article>
  );
}
