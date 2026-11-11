import Link from "next/link";
import { analysisFilters } from "@/domain/analysis";
import { OverviewScreen } from "@/components/overview-screen";
export default async function Overview({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  let filters;
  try {
    filters = analysisFilters({
      ...params,
      currency: params.currency || "INR",
    });
  } catch {
    return (
      <section role="alert" className="rounded-xl border bg-card p-6">
        <h1 className="text-title font-semibold">Choose a valid population</h1>
        <p className="mt-3 text-muted-foreground">
          Analysis requires one currency and valid employee filters.
        </p>
        <Link
          href="/overview?currency=INR"
          className="mt-4 inline-flex min-h-11 items-center underline"
        >
          Reset to INR population
        </Link>
      </section>
    );
  }
  return <OverviewScreen filters={filters} />;
}
