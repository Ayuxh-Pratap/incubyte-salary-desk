import "server-only";
import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";
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
    <p className="my-3 max-w-[78ch] text-ui leading-relaxed text-foreground-2">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="my-3 max-w-[78ch] list-disc space-y-3 pl-5 text-ui leading-relaxed text-foreground-2">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3 max-w-[78ch] list-decimal space-y-3 pl-5 text-ui leading-relaxed text-foreground-2">
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
export function Diagram({ id }: { id: keyof typeof diagrams }) {
  const diagram = diagrams[id];
  return (
    <figure
      className="my-6 rounded-xl bg-card p-4 md:p-5"
      aria-label={diagram.title}
    >
      <figcaption className="mb-4">
        <p className="text-ui font-medium">{diagram.title}</p>
        <p className="mt-1 max-w-[85ch] text-meta leading-relaxed text-muted-foreground">
          {diagram.description}
        </p>
      </figcaption>
      <ol
        className={
          diagram.kind === "flow"
            ? `grid gap-5 sm:grid-cols-2 ${diagram.nodes.length === 4 ? "xl:grid-cols-4" : "xl:grid-cols-5"}`
            : "grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
        }
      >
        {diagram.nodes.map((node, index) => (
          <li
            key={node.title}
            className="relative min-w-0 rounded-lg bg-inset p-4"
          >
            <span className="mb-2 block text-meta tabular-nums text-muted-foreground">
              {diagram.kind === "model"
                ? "Entity"
                : diagram.kind === "timeline"
                  ? "Milestone"
                  : "Step"}{" "}
              {index + 1}
            </span>
            <p className="text-ui font-medium">{node.title}</p>
            <p className="mt-2 text-meta leading-relaxed text-foreground-2">
              {node.body}
            </p>
            {diagram.kind === "flow" && index < diagram.nodes.length - 1 && (
              <>
                <ArrowRight
                  aria-hidden
                  className="absolute top-1/2 -right-5 hidden size-5 text-muted-foreground xl:block"
                />
                <ArrowDown
                  aria-hidden
                  className="absolute -bottom-5 left-1/2 size-5 text-muted-foreground sm:hidden"
                />
              </>
            )}
            {"commit" in node && (
              <p className="mt-3 text-meta">
                {"published" in node && node.published ? (
                  <a
                    className="underline underline-offset-4"
                    href={`${REPOSITORY}/commit/${node.commit}`}
                  >
                    {node.commit}
                  </a>
                ) : (
                  <span>
                    <code>{node.commit}</code> · local review
                  </span>
                )}
              </p>
            )}
          </li>
        ))}
      </ol>
    </figure>
  );
}
export async function SourceExcerpt({ id }: { id: keyof typeof SOURCES }) {
  const source = SOURCES[id],
    sample = excerpt(await readSource(id), source.focus);
  return (
    <figure className="my-5 min-w-0 rounded-xl bg-card p-4">
      <figcaption className="flex flex-wrap items-center justify-between gap-2 text-meta">
        <span>{source.title}</span>
        <Link
          className="underline underline-offset-4"
          href={`/presentation/source/${id}#L${sample.start}`}
        >
          Inspect actual file · line {sample.start}
        </Link>
      </figcaption>
      <pre
        tabIndex={0}
        className="mt-3 overflow-x-auto rounded-lg bg-inset p-4 text-meta leading-relaxed"
      >
        <code>{sample.text}</code>
      </pre>
      <p className="mt-2 break-all text-meta text-muted-foreground">
        {source.file} · generated from this build’s source
      </p>
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
export async function PresentationBody({ content }: { content: string }) {
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
        <pre
          key={i}
          tabIndex={0}
          aria-label="Current verification record"
          className="my-5 overflow-x-auto rounded-xl bg-card p-4 text-meta leading-relaxed"
        >
          {await readArtifact("current-verification")}
        </pre>,
      );
    else if (type === "artifacts") blocks.push(<ArtifactIndex key={i} />);
    else throw new Error(`Unknown presentation block: ${type}/${id}`);
  }
  return <>{blocks}</>;
}
