import Link from "next/link";
export default function NotFound() {
  return (
    <div className="p-8">
      <h1 className="text-title font-medium">Page not found</h1>
      <Link
        className="mt-4 inline-flex min-h-11 items-center underline"
        href="/employees"
      >
        Back to employees
      </Link>
    </div>
  );
}
