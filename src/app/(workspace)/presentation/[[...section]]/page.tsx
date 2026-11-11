import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import {
  PRESENTATION_SECTIONS,
  presentationSection,
  presentationAnchor,
  markdownSection,
} from "@/lib/presentation";
import { readPresentation } from "@/server/presentation/content";
import { REPOSITORY } from "@/server/presentation/catalog";
import { PresentationBody } from "@/components/presentation/content";
import { CURRENCIES } from "@/domain/money";
export default async function PresentationPage({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}) {
  const { section: segments = [] } = await params;
  if (segments.length > 1) notFound();
  const section = presentationSection(segments[0] ?? "");
  if (!section) notFound();
  if (section.slug)
    redirect("/presentation#" + presentationAnchor(section.slug));
  const narrative = await readPresentation();
  return (
    <article data-case-study className="w-full min-w-0 pb-10">
      <header className="pt-3 pb-8 md:pt-5 md:pb-10">
        <div className="flex flex-wrap items-center justify-between gap-3 text-meta text-muted-foreground">
          <p>Case study · Full-stack TypeScript · AI-assisted development</p>
          <p>Independent assessment concept · Fictional ACME</p>
        </div>
        <div className="mt-7 grid items-end gap-7 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,0.7fr)] xl:gap-12">
          <div>
            <h1 className="text-title-lg font-medium tracking-tight">
              Salary Desk
            </h1>
            <p className="mt-4 max-w-[32ch] text-3xl leading-tight font-medium tracking-tight md:text-4xl">
              A clear view of pay.
              <br />A careful way to change it.
            </p>
            <p className="mt-5 max-w-[75ch] text-ui leading-relaxed text-foreground-2">
              From a spreadsheet brief to a working HR tool: find an employee,
              correct current pay without losing a newer edit, and explain
              compensation for a defined population.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 xl:justify-end">
            <Link
              prefetch={false}
              href="/dashboard?currency=USD"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-card px-4 text-ui font-medium shadow-button transition-shadow hover:shadow-button-hover"
            >
              Open workspace
              <ArrowRight aria-hidden className="size-4" />
            </Link>
            <a
              href={REPOSITORY}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-ui text-foreground-2 hover:bg-inset"
            >
              Published source
              <ArrowUpRight aria-hidden className="size-4" />
            </a>
          </div>
        </div>
        <dl className="mt-9 grid grid-cols-2 border-y md:grid-cols-4">
          {[
            { value: "10,000", label: "Synthetic employees" },
            {
              value: String(Object.keys(CURRENCIES).length),
              label: "Explicit pay currencies",
            },
            { value: "25", label: "Rows per default page" },
            { value: "Annual base", label: "Salary basis" },
          ].map((fact) => (
            <div
              key={fact.label}
              className="py-5 pr-4 md:border-r md:pl-5 md:first:pl-0 md:last:border-r-0"
            >
              <dt className="text-meta text-muted-foreground">{fact.label}</dt>
              <dd className="mt-2 text-title font-medium tracking-tight tabular-nums">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
        <ul
          aria-label="Application stack"
          className="mt-5 flex flex-wrap gap-2"
        >
          {[
            "TypeScript",
            "Next.js",
            "PostgreSQL",
            "Drizzle",
            "Zod",
            "Vitest",
            "Playwright",
          ].map((item) => (
            <li
              key={item}
              className="rounded-full bg-inset px-3 py-1 text-meta text-foreground-2"
            >
              {item}
            </li>
          ))}
        </ul>
      </header>
      <nav
        aria-label="Presentation sections"
        className="sticky top-0 z-10 flex flex-wrap gap-x-5 gap-y-1 border-y bg-background/95 px-1 py-2 backdrop-blur-sm"
      >
        {PRESENTATION_SECTIONS.map((item, i) => (
          <Link
            key={item.slug}
            prefetch={false}
            href={"/presentation#" + presentationAnchor(item.slug)}
            className="inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-meta text-foreground-2 hover:bg-inset hover:text-foreground"
          >
            <span className="tabular-nums text-muted-foreground">0{i + 1}</span>
            {item.title}
          </Link>
        ))}
      </nav>
      {PRESENTATION_SECTIONS.map((chapter, index) => (
        <section
          key={chapter.slug}
          id={presentationAnchor(chapter.slug)}
          aria-labelledby={`chapter-${index}`}
          className="scroll-mt-44 border-b pt-10 pb-5 xl:scroll-mt-24 md:pt-14 md:pb-8"
        >
          <header className="flex flex-wrap items-baseline justify-between gap-4">
            <h2
              id={`chapter-${index}`}
              className="text-title font-medium tracking-tight"
            >
              <span className="mr-3 text-meta tabular-nums text-muted-foreground">
                0{index + 1}
              </span>
              {chapter.title}
            </h2>
            <p className="text-meta text-muted-foreground">{chapter.summary}</p>
          </header>
          <PresentationBody
            content={markdownSection(narrative, chapter.title)}
          />
        </section>
      ))}
      <footer className="flex flex-wrap items-center justify-between gap-4 pt-7 text-meta text-muted-foreground">
        <span>
          Canonical story: docs/PRESENTATION.md · Synthetic data · Evidence is
          versioned.
        </span>
        <Link
          prefetch={false}
          href="/dashboard"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-foreground hover:bg-inset"
        >
          Explore the working product
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </footer>
    </article>
  );
}
