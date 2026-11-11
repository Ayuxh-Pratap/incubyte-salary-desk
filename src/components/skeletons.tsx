import { cn } from "@/lib/utils";
export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("block animate-pulse rounded bg-inset", className)}
    />
  );
}
export function EmployeeRowsSkeleton({ rows = 25 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <tr key={i} className="h-[68px] border-b" aria-hidden>
          <td className="px-4 py-2">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="mt-2 h-2.5 w-1/2" />
          </td>
          <td className="px-4 py-2">
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="mt-2 h-2.5 w-4/5" />
          </td>
          <td className="px-4 py-2">
            <Skeleton className="h-3 w-4/5" />
          </td>
          <td className="px-4 py-2">
            <Skeleton className="ml-auto h-3 w-3/4" />
          </td>
          <td className="p-3">
            <Skeleton className="size-5" />
          </td>
        </tr>
      ))}
    </>
  );
}
export function EmployeeCardsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <ul className="divide-y" aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <li
          key={i}
          className="flex h-40 items-center justify-between gap-4 p-4"
        >
          <div className="w-full">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-3 h-3 w-3/4" />
            <Skeleton className="mt-2 h-3 w-4/5" />
            <Skeleton className="mt-4 h-4 w-1/2" />
          </div>
          <Skeleton className="size-5 shrink-0" />
        </li>
      ))}
    </ul>
  );
}
export function MetricSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("min-h-36 rounded-xl bg-card p-4", className)}
      aria-hidden
    >
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="mt-5 h-6 w-4/5" />
      <Skeleton className="mt-4 h-2.5 w-1/2" />
    </div>
  );
}
export function DetailSkeleton() {
  return (
    <div aria-hidden>
      <div className="flex gap-3">
        <Skeleton className="size-12 shrink-0 rounded-xl" />
        <div className="w-full">
          <Skeleton className="mt-1 h-5 w-2/3" />
          <Skeleton className="mt-2 h-3 w-3/4" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-5 border-y py-5">
        {[1, 2, 3, 4].map((n) => (
          <div key={n}>
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="mt-2 h-4 w-2/3" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-6 h-3 w-1/2" />
      <Skeleton className="mt-3 h-7 w-3/4" />
      <Skeleton className="mt-5 h-3 w-full" />
      <Skeleton className="mt-8 h-4 w-2/3" />
      <Skeleton className="mt-3 h-11 w-full" />
      <Skeleton className="mt-4 h-28 w-full" />
      <Skeleton className="mt-5 h-11 w-full" />
    </div>
  );
}
