import { ArrowUpRight } from "lucide-react";
import { DEMO_VIDEO } from "@/lib/submission";

export function SubmissionVideo() {
  return (
    <section
      id="video-demo"
      aria-labelledby="video-demo-title"
      className="my-6 scroll-mt-6 border-b pb-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="video-demo-title" className="text-heading font-medium">
          Recorded walkthrough
        </h2>
        <p className="text-meta text-muted-foreground">
          {DEMO_VIDEO.duration} · Video demo
        </p>
      </div>
      <video
        className="mt-3 aspect-video w-full rounded-md border bg-card"
        controls
        playsInline
        preload="none"
        poster="/demo-poster.jpg"
        aria-label="Salary Desk video demonstration"
      >
        <source src={DEMO_VIDEO.url} type="video/mp4" />
        Your browser can open the recording using the download link below.
      </video>
      <div className="mt-1 flex flex-wrap gap-x-5 text-meta">
        <a
          className="inline-flex min-h-11 items-center gap-2 text-foreground underline underline-offset-4"
          href={DEMO_VIDEO.url}
        >
          Download MP4
          <ArrowUpRight aria-hidden className="size-3.5" />
        </a>
        <a
          className="inline-flex min-h-11 items-center gap-2 text-foreground underline underline-offset-4"
          href={DEMO_VIDEO.driveUrl}
          target="_blank"
          rel="noreferrer"
        >
          Google Drive copy
          <ArrowUpRight aria-hidden className="size-3.5" />
        </a>
      </div>
    </section>
  );
}
