"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: new FormData(form).get("password") }),
      });
      const body = await response.json();
      if (!response.ok) {
        setError(body.error);
        return;
      }
      router.push("/employees");
      router.refresh();
    } catch {
      setError("Connection failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="mt-8 space-y-4">
      <label className="block text-ui font-medium" htmlFor="password">
        Evaluator access code
      </label>
      <Input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        maxLength={256}
        aria-describedby={error ? "login-error" : undefined}
        aria-invalid={!!error}
      />
      {error && (
        <p id="login-error" role="alert" className="text-destructive">
          {error}
        </p>
      )}
      <Button className="w-full" type="submit" loading={busy}>
        Open workspace <ArrowRight />
      </Button>
      <p className="flex items-center justify-center gap-2 text-meta text-muted-foreground">
        <ShieldCheck className="size-4" />
        Protected access · Synthetic data only
      </p>
    </form>
  );
}
