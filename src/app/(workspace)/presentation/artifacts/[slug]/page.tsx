import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTIFACTS, artifactKey } from "@/server/presentation/catalog";
import { readArtifact } from "@/server/presentation/content";
import { MarkdownBody } from "@/components/presentation/content";
export default async function ArtifactPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const key = artifactKey((await params).slug);
  if (!key) notFound();
  const artifact = ARTIFACTS[key],
    content = await readArtifact(key);
  return (
    <article className="w-full min-w-0 pb-10">
      <Link
        className="text-meta underline underline-offset-4"
        href="/presentation/quality"
      >
        ← Quality and evidence
      </Link>
      <h1 className="mt-5 text-title font-semibold">{artifact.title}</h1>
      <p className="my-3 text-meta text-muted-foreground">{artifact.status}</p>
      {artifact.format === "markdown" ? (
        <MarkdownBody content={content} />
      ) : (
        <pre
          tabIndex={0}
          className="my-5 overflow-x-auto rounded-xl bg-card p-4 text-meta leading-relaxed"
        >
          {content}
        </pre>
      )}
    </article>
  );
}
