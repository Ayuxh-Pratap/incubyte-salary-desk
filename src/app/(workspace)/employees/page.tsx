export default function Employees() {
  return (
    <>
      <p className="text-meta font-medium uppercase tracking-wider text-muted-foreground">
        People & compensation
      </p>
      <h1 className="mt-2 text-title font-semibold tracking-tight">
        Employees
      </h1>
      <p className="mt-2 text-foreground-2">
        Find a person. Understand their pay. Make a careful correction.
      </p>
      <section className="mt-6 rounded-xl border bg-card p-6">
        <h2 className="text-heading font-medium">
          Database setup is the next step
        </h2>
        <p className="mt-2 text-muted-foreground">
          The foundation is running. Employee browsing will use the hosted
          database after migration and explicit synthetic seeding.
        </p>
        <p className="mt-4 text-meta text-muted-foreground">
          No sample records are presented as connected data.
        </p>
      </section>
    </>
  );
}
