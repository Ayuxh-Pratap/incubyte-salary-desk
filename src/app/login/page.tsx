import { Layers } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { ThemeToggle } from "@/components/theme-toggle";
export default function Login() {
  return (
    <main className="grid min-h-dvh place-items-center bg-muted p-4">
      <div className="w-full max-w-md">
        <section className="rounded-2xl border bg-card p-6 shadow-sm sm:p-9">
          <span className="mb-8 inline-flex items-center gap-2 text-ui font-medium">
            <Layers className="size-5 text-primary" />
            Salary Desk{" "}
            <span className="font-normal text-muted-foreground">/ ACME</span>
          </span>
          <p className="text-meta uppercase tracking-wider text-muted-foreground">
            The compensation workspace
          </p>
          <h1 className="mt-3 text-3xl font-medium tracking-tight">
            A clearer view
            <br />
            of how we pay.
          </h1>
          <p className="mt-4 text-foreground-2">
            Find employees, make careful salary updates, and understand
            compensation in context.
          </p>
          <LoginForm />
        </section>
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-meta text-muted-foreground">
            Independent assessment concept.
            <br />
            Not an Incubyte internal system.
          </p>
          <ThemeToggle />
        </div>
      </div>
    </main>
  );
}
