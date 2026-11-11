import Link from "next/link";
import { parseFilters } from "@/domain/filters";
import { EmployeesScreen } from "@/components/employees-screen";
export default async function Employees({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  let filters;
  try {
    filters = parseFilters(params);
  } catch {
    return (
      <section role="alert" className="rounded-xl bg-card p-6">
        <h1 className="text-title font-medium">Check your filters</h1>
        <p className="mt-3 text-muted-foreground">
          Salary sorting requires a currency. Search is limited to 100
          characters and pages to 25, 50 or 100 records.
        </p>
        <Link
          href="/employees"
          className="mt-4 inline-flex min-h-11 items-center underline"
        >
          Clear filters
        </Link>
      </section>
    );
  }
  return <EmployeesScreen filters={filters} />;
}
