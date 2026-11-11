import "server-only";
import Link from "next/link";
import { Diagram } from "./diagram";
import { EvidenceSummary, PerformanceEvidence } from "./evidence";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import diagrams from "../../../docs/presentation-diagrams.json";
import {
  ARTIFACTS,
  SOURCES,
  REPOSITORY,
  artifactKey,
  sourceKey,
} from "@/server/presentation/catalog";
import {
  readArtifact,
  readSource,
  excerpt,
} from "@/server/presentation/content";
const components: Components = {
  h1: ({ children }) => (
    <h2 className="mt-7 mb-3 text-section font-semibold tracking-tight">
      {children}
    </h2>
  ),
  h2: ({ children }) => (
    <h2 className="mt-8 text-section font-semibold tracking-tight">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-7 mb-3 text-section font-semibold tracking-tight">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="my-3 max-w-[80ch] text-ui leading-relaxed text-foreground-2">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="my-3 max-w-[80ch] list-disc space-y-3 pl-5 text-ui leading-relaxed text-foreground-2">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3 max-w-[80ch] list-decimal space-y-3 pl-5 text-ui leading-relaxed text-foreground-2">
      {children}
    </ol>
  ),
  a: ({ href, children }) => {
    if (!href || href.startsWith("file:") || /^[A-Za-z]:/.test(href))
      return <span>{children}</span>;
    const relative =
      !href.startsWith("/") &&
      !href.startsWith("#") &&
      !href.startsWith("https://");
    const reviewed = Object.entries(ARTIFACTS).find(
      ([, value]) => value.file === href || value.file.endsWith("/" + href),
    );
    if (relative && !reviewed) return <span>{children}</span>;
    const target = relative ? "/presentation/artifacts/" + reviewed![0] : href;
    if (target.startsWith("/") && !target.startsWith("//"))
      return (
        <Link
          href={target}
          prefetch={false}
          className="rounded text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-primary"
        >
          {children}
        </Link>
      );
    return (
      <a
        href={target}
        className="rounded text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-primary"
      >
        {children}
      </a>
    );
  },
  pre: ({ children }) => (
    <pre
      tabIndex={0}
      className="my-4 max-w-full overflow-x-auto rounded-lg bg-inset p-4 text-meta leading-relaxed"
    >
      {children}
    </pre>
  ),
  code: ({ children }) => (
    <code className="break-words rounded bg-inset px-1 py-0.5 text-meta">
      {children}
    </code>
  ),
  table: ({ children }) => (
    <div
      tabIndex={0}
      role="region"
      aria-label="Document table"
      className="my-4 overflow-x-auto"
    >
      <table className="w-full text-left text-meta [&_td]:border-b [&_td]:p-3 [&_th]:bg-inset [&_th]:p-3">
        {children}
      </table>
    </div>
  ),
};
export function MarkdownBody({ content }: { content: string }) {
  return (
    <Markdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </Markdown>
  );
}
const sourceNotes: Record<keyof typeof SOURCES, string[]> = {
  money: [
    "Parse the decimal string directly into BigInt. No floating-point intermediate can change the amount.",
    "Currency precision determines the scale. Excess decimals, zero and values above MAX_MINOR are rejected.",
    "JSON transports minor units as strings; rounding belongs at the display boundary.",
  ],
  queries: [
    "The database applies the shared population predicate before sorting and paging.",
    "LIMIT bounds returned rows. The full matching count belongs to the same normal-page statement.",
    "A stable id tie-breaker prevents tied names or salaries from moving unpredictably between pages.",
  ],
  salary: [
    "The WHERE clause checks both employee id and the version HR originally read.",
    "One successful write advances the version and writes server-owned update metadata.",
    "No returned row triggers conflict handling; the UI keeps the proposed amount for review.",
  ],
  schema: [
    "The positive, bounded amount and annual-period rules exist in PostgreSQL as well as server validation.",
    "Foreign keys retain explicit country, currency, department and role.",
    "Unknown salary is not silently coerced to zero.",
  ],
  chart: [
    "The instance lifetime follows the canvas and chart kind, not freshly allocated callback identities.",
    "Changed series update in place; unchanged revalidation does not restart the entrance animation.",
    "Theme updates recolor the same instance.",
  ],
  cache: [
    "Concurrent reads for one key share a pending request.",
    "Freshness is bounded; exact URL and session scope identify the cached population.",
    "Successful edits invalidate salary-bearing views rather than leaving previously visited analysis stale.",
  ],
  freshness: [
    "Only visible views start expiry reads. A hidden tab resumes with a deduplicated freshness check.",
    "A fresh focus event does not force another request.",
    "Ordinary responses notify their query subscribers; explicit refresh remains available.",
  ],
};
export async function SourceExcerpt({ id }: { id: keyof typeof SOURCES }) {
  const source = SOURCES[id],
    sample = excerpt(await readSource(id), source.focus);
  return (
    <figure className="my-8 min-w-0 overflow-hidden rounded-xl bg-card shadow-panel">
      <figcaption className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 text-meta md:px-7">
        <span className="font-medium">{source.title}</span>
        <Link
          prefetch={false}
          className="underline underline-offset-4"
          href={`/presentation/source/${id}#L${sample.start}`}
        >
          Inspect actual file · line {sample.start}
        </Link>
      </figcaption>
      <div className="grid min-w-0 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="min-w-0 p-4 md:p-6">
          <pre
            tabIndex={0}
            className="overflow-x-auto rounded-lg bg-inset p-4 font-mono text-meta leading-relaxed"
          >
            <code>{sample.text}</code>
          </pre>
          <p className="mt-3 break-all text-meta text-muted-foreground">
            {source.file} · actual source from this build
          </p>
        </div>
        <ol className="space-y-5 p-5 text-ui leading-relaxed text-foreground-2 md:p-7 lg:border-l">
          {sourceNotes[id].map((note, index) => (
            <li key={note} className="flex gap-3">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-inset text-meta tabular-nums text-foreground">
                {index + 1}
              </span>
              <span>{note}</span>
            </li>
          ))}
        </ol>
      </div>
    </figure>
  );
}
export function ArtifactIndex() {
  return (
    <div className="my-5 grid gap-3 sm:grid-cols-2">
      {Object.entries(ARTIFACTS).map(([key, value]) => (
        <Link
          key={key}
          href={`/presentation/artifacts/${key}`}
          prefetch={false}
          className="rounded-xl bg-card p-4 transition-colors hover:bg-inset"
        >
          <p className="text-ui font-medium">{value.title} ↗</p>
          <p className="mt-2 text-meta text-muted-foreground">{value.status}</p>
        </Link>
      ))}
      <a
        className="rounded-xl bg-card p-4 text-ui underline underline-offset-4"
        href={REPOSITORY}
      >
        Public repository · published baseline ↗
      </a>
      <a
        className="rounded-xl bg-card p-4 text-ui underline underline-offset-4"
        href="https://incubyte-salary-desk.vercel.app"
      >
        Published application · evaluator access required ↗
      </a>
      <a
        className="rounded-xl bg-card p-4 text-ui underline underline-offset-4"
        href="https://github.com/Ayuxh-Pratap/incubyte-salary-desk/actions/runs/42996069517"
      >
        Historical baseline CI ↗
      </a>
    </div>
  );
}
async function ContentBlocks({ content }: { content: string }) {
  const parts = content.split(
    /```(diagram|source|document|evidence|artifacts)\s*\n([^`]+)```/g,
  );
  const blocks = [];
  for (let i = 0; i < parts.length; i++) {
    if (i % 3 === 0) {
      blocks.push(<MarkdownBody key={i} content={parts[i]} />);
      continue;
    }
    const type = parts[i],
      id = parts[++i].trim();
    if (type === "diagram" && Object.hasOwn(diagrams, id))
      blocks.push(<Diagram key={i} id={id as keyof typeof diagrams} />);
    else if (type === "source" && sourceKey(id))
      blocks.push(<SourceExcerpt key={i} id={sourceKey(id)!} />);
    else if (type === "document" && artifactKey(id))
      blocks.push(
        <details key={i} className="my-5 rounded-xl bg-card p-4">
          <summary className="cursor-pointer text-ui font-medium">
            Read the one-page requirements
          </summary>
          <MarkdownBody content={await readArtifact(artifactKey(id)!)} />
        </details>,
      );
    else if (type === "evidence")
      blocks.push(
        id === "performance" ? (
          <PerformanceEvidence key={i} />
        ) : (
          <EvidenceSummary key={i} />
        ),
      );
    else if (type === "artifacts")
      blocks.push(
        <details key={i} className="my-8 rounded-xl bg-card p-5 shadow-panel">
          <summary className="cursor-pointer text-ui font-medium">
            Browse the selected source and evidence
          </summary>
          <ArtifactIndex />
        </details>,
      );
    else throw new Error(`Unknown presentation block: ${type}/${id}`);
  }
  return <>{blocks}</>;
}

export async function PresentationBody({ content }: { content: string }) {
  const parts = content.replace(/\r\n/g, "\n").split(/^### (.+)\n/gm),
    blocks = [];
  if (parts[0].trim())
    blocks.push(<ContentBlocks key="intro" content={parts[0]} />);
  for (let i = 1; i < parts.length; i += 2) {
    const heading = parts[i],
      body = parts[i + 1] ?? "",
      at = body.search(/```(?:diagram|source|document|evidence|artifacts)/),
      intro = at < 0 ? body : body.slice(0, at),
      rest = at < 0 ? "" : body.slice(at);
    blocks.push(
      <section key={heading} className="my-10 md:my-14">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] lg:gap-12">
          <h3 className="max-w-[27ch] text-heading font-medium leading-snug tracking-tight md:text-title">
            {heading}
          </h3>
          <div className="min-w-0 [&_p:first-child]:mt-0">
            <MarkdownBody content={intro} />
          </div>
        </div>
        {rest && <ContentBlocks content={rest} />}
      </section>,
    );
  }
  return <>{blocks}</>;
}
