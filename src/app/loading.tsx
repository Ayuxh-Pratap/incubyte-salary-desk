export default function Loading() {
  return (
    <div role="status" className="space-y-4 p-8">
      <span className="sr-only">Loading workspace</span>
      {[1, 2, 3].map((x) => (
        <div key={x} className="h-12 animate-pulse rounded-lg border bg-card" />
      ))}
    </div>
  );
}
