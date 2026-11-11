import Link from "next/link";
import { analysisFilters } from "@/domain/analysis";
import { DashboardScreen } from "@/components/dashboard-screen";
export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  let currency: string;
  try {
    currency = analysisFilters({
      currency: (await searchParams).currency ?? "INR",
    }).currency!;
  } catch {
    return (
      <section role="alert">
        <h1 className="text-title font-medium">
          Choose a valid pay currency
        </h1>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex min-h-11 items-center underline"
        >
          Reset Dashboard
        </Link>
      </section>
    );
  }
  return <DashboardScreen currency={currency} />;
}
