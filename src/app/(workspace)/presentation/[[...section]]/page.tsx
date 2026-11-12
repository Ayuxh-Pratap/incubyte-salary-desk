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
import { REPOSITORY, repositoryFile } from "@/server/presentation/catalog";
import { PresentationBody } from "@/components/presentation/content";
import { ReportSheet } from "@/components/presentation/report-sheet";
import { SubmissionVideo } from "@/components/presentation/submission-video";
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
    next = PRESENTATION_SECTIONS[index + 1],
    narrative = await readPresentation();
  return (
    <article
      data-case-study
      data-assessment-report
      className="w-full min-w-0 pb-6"
    >
      <div className="mx-auto mb-5 flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-3">
        <p className="text-meta text-muted-foreground">
          Presentation / Assessment report
        </p>
        <div className="flex flex-wrap gap-2">
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
            Source repository
            <ArrowUpRight aria-hidden className="size-4" />
          </a>
        </div>
      </div>
      <nav
        aria-label="Presentation sections"
        className="mx-auto mb-6 flex w-full max-w-[1280px] flex-wrap gap-2"
      >
        {PRESENTATION_SECTIONS.map((item, i) => (
          <Link
            key={item.slug}
            prefetch={false}
            href={presentationHref(item.slug)}
            aria-label={item.title}
            aria-current={item.slug === section.slug ? "page" : undefined}
            className={`relative isolate inline-flex min-h-11 items-center gap-2 overflow-hidden rounded-lg px-3 text-meta transition-colors ${item.slug === section.slug ? "bg-inset font-medium text-foreground shadow-well" : "text-foreground-2 hover:bg-inset hover:text-foreground"}`}
          >
            <LinkPending />
            <span aria-hidden className="tabular-nums text-muted-foreground">
              0{i + 1}
            </span>
            {item.navLabel}
          </Link>
        ))}
      </nav>
      <ReportSheet>
        <header className="border-b pb-7 md:pb-9">
          <div className="flex flex-wrap items-center justify-between gap-3 text-meta text-muted-foreground">
            <p className="font-medium tracking-wide">
              SALARY DESK / ENGINEERING ASSESSMENT
            </p>
            <p className="tabular-nums">
              SECTION {String(index + 1).padStart(2, "0")} /{" "}
              {String(PRESENTATION_SECTIONS.length).padStart(2, "0")}
            </p>
          </div>
          <p className="mt-5 text-meta text-muted-foreground">
            Incubyte · Software Craftsperson / TypeScript II
          </p>
          <h1 className="mt-3 text-title-lg font-medium tracking-tight">
            {section.title}
          </h1>
          <p className="mt-4 max-w-[80ch] text-body leading-relaxed text-foreground-2">
            {section.summary}
          </p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-meta text-muted-foreground">
            <span>Organization: Fictional ACME</span>
            <span>Data: Synthetic</span>
            <span>Status: Released application · Video available</span>
          </div>
        </header>
        {index === 0 && <SubmissionVideo />}
        <PresentationBody content={markdownSection(narrative, section.title)} />
        <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t pt-5 text-meta text-muted-foreground">
          <p>
            Independent assessment concept ·{" "}
            <a
              className="underline underline-offset-4"
              href={repositoryFile("docs/PRESENTATION.md")}
            >
              Canonical report on GitHub
            </a>
          </p>
          <p className="tabular-nums">
            Section {index + 1} of {PRESENTATION_SECTIONS.length}
          </p>
        </footer>
      </ReportSheet>
      <nav
        aria-label="Report sequence"
        className="mx-auto mt-6 flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-4"
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
    </article>
  );
}
