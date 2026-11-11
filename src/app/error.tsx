"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div role="alert" className="mx-auto max-w-lg p-8">
      <h1 className="text-title font-semibold">We couldn’t load this view</h1>
      <p className="my-4 text-muted-foreground">
        We couldn’t confirm the current view. Check the latest salary before
        retrying a change, or ask the assessment owner to check the connection.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
