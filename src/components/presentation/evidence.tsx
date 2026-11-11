import "server-only";
import Link from "next/link";
import { readArtifact } from "@/server/presentation/content";
export async function EvidenceSummary() {
  const raw = await readArtifact("current-verification"),
    record = JSON.parse(raw) as {
      applicationSource: string;
      release?: boolean;
      status: string;
      checks: Record<string, string>;
      caseStudyRevision?: { source: string; checks: Record<string, string> };
      reportRevision?: { source: string; checks: Record<string, string> };
    };
  const revision = record.reportRevision ?? record.caseStudyRevision;
  const checks = revision?.checks ?? record.checks;
  const label = record.release
    ? "Release verification"
    : record.reportRevision
      ? "Assessment report revision"
      : record.caseStudyRevision
        ? "Case-study revision"
        : "Functional baseline";
  return (
    <section
      aria-label="Recorded verification"
      className="my-8 rounded-xl bg-card p-5 shadow-panel md:p-7"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="text-heading font-medium">
          Evidence, with its version attached
        </h3>
        <span className="text-meta text-muted-foreground">
          {label} · {(revision?.source ?? record.applicationSource).slice(0, 7)}
        </span>
      </div>
      <dl className="mt-5 grid gap-x-8 md:grid-cols-2">
        {Object.entries(checks).map(([key, value]) => (
          <div key={key} className="border-t py-4">
            <dt className="text-meta font-medium capitalize text-muted-foreground">
              {key.replace(/([A-Z])/g, " $1")}
            </dt>
            <dd className="mt-2 text-ui leading-relaxed">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-meta text-muted-foreground">
        The record identifies its source/environment; a new case-study layout
        does not turn earlier measurements into new production evidence.
      </p>
      <details className="mt-5 border-t pt-4">
        <summary className="cursor-pointer text-meta font-medium">
          Inspect the exact verification record
        </summary>
        <pre
          tabIndex={0}
          aria-label="Current verification record"
          className="mt-4 overflow-x-auto rounded-lg bg-inset p-4 text-meta"
        >
          {raw}
        </pre>
      </details>
    </section>
  );
}
export async function PerformanceEvidence() {
  type Observation = {
    name: string;
    ms: number;
    requests: { path: string; rows?: number; bytes: number }[];
    db: unknown[];
  };
  type Record = { source: string; observations: Observation[] };
  const before = JSON.parse(await readArtifact("performance-before")) as Record,
    after = JSON.parse(await readArtifact("performance-after")) as Record;
  const rows = [
    ["first-dashboard", "Initial Dashboard"],
    ["dashboard-employees", "Dashboard → Employees"],
    ["return-employees", "Fresh cached return"],
    ["apply-filter", "Apply filters"],
    ["next-page", "Next page"],
  ];
  return (
    <figure
      aria-label="Recorded navigation measurements"
      className="my-8 min-w-0 overflow-hidden rounded-xl bg-card shadow-panel"
    >
      <figcaption className="px-5 py-5 md:px-7">
        <h3 className="text-heading font-medium">
          Every sample, including the slower ones
        </h3>
        <p className="mt-2 text-meta text-muted-foreground">
          Historical functional comparison · {before.source.slice(0, 7)} →{" "}
          {after.source.slice(0, 7)} · 3 samples per journey · milliseconds
        </p>
      </figcaption>
      <div
        role="region"
        aria-label="Navigation timing table, horizontally scrollable"
        tabIndex={0}
        className="overflow-x-auto"
      >
        <table className="w-full min-w-[680px] text-left text-ui">
          <thead className="bg-inset text-meta text-foreground-2">
            <tr>
              {["Journey", "Before · ms", "After · ms", "After API / SQL"].map(
                (label) => (
                  <th key={label} className="px-5 py-3 font-medium md:px-7">
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map(([key, label]) => {
              const a = after.observations.filter((o) => o.name === key),
                b = before.observations.filter((o) => o.name === key);
              return (
                <tr key={key} className="border-t">
                  <th className="px-5 py-4 font-medium md:px-7">{label}</th>
                  <td className="px-5 py-4 tabular-nums md:px-7">
                    {b.map((o) => o.ms).join(" / ")}
                  </td>
                  <td className="px-5 py-4 tabular-nums md:px-7">
                    {a.map((o) => o.ms).join(" / ")}
                  </td>
                  <td className="px-5 py-4 tabular-nums md:px-7">
                    {
                      a[0].requests.filter((r) => r.path.startsWith("/api/"))
                        .length
                    }{" "}
                    / {a[0].db.length}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="px-5 py-4 text-meta leading-relaxed text-muted-foreground md:px-7">
        Timings include the automated action, route/data readiness and
        response-body collection. The first Dashboard sample is first-process;
        the following two are warm.{" "}
        <Link
          prefetch={false}
          className="underline underline-offset-4"
          href="/presentation/artifacts/final-report"
        >
          Read the method, payloads and limitations ↗
        </Link>
      </p>
    </figure>
  );
}
