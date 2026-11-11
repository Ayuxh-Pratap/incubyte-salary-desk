import { ReportSheet } from "@/components/presentation/report-sheet";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SOURCES, sourceKey } from "@/server/presentation/catalog";
import { readSource } from "@/server/presentation/content";
export default async function SourcePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const key = sourceKey((await params).slug);
  if (!key) notFound();
  const source = SOURCES[key],
    content = await readSource(key);
  return (
    <article className="w-full min-w-0">
      <Link
        className="text-meta underline underline-offset-4"
        href="/presentation/architecture"
      >
        ← Architecture and flows
      </Link>
      <div className="mt-5">
        <ReportSheet>
          <h1 className="mt-5 text-title font-semibold">{source.title}</h1>
          <p className="my-3 break-all text-meta text-muted-foreground">
            {source.file} · Actual local review source; not a claim that the
            review is published.
          </p>
          <pre
            tabIndex={0}
            aria-label={source.title}
            className="my-5 overflow-x-auto rounded-lg bg-inset p-4 text-meta leading-relaxed"
          >
            <code>
              {content.split("\n").map((line, i) => (
                <span
                  id={`L${i + 1}`}
                  key={i}
                  className="block scroll-mt-4 target:bg-inset"
                >
                  <a
                    href={`#L${i + 1}`}
                    aria-label={`Line ${i + 1}`}
                    className="mr-4 inline-block w-8 select-none text-right tabular-nums text-muted-foreground"
                  >
                    {i + 1}
                  </a>
                  {line || " "}
                </span>
              ))}
            </code>
          </pre>
        </ReportSheet>
      </div>
    </article>
  );
}
