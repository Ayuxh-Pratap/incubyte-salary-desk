import { ArrowUpRight } from "lucide-react";
import { DEMO_VIDEO } from "@/lib/submission";

export function SubmissionVideo() {
  return (
    <section
      id="video-demo"
      aria-labelledby="video-demo-title"
      className="my-8 scroll-mt-6 rounded-xl bg-inset p-5 md:p-6"
    >
      <h2 id="video-demo-title" className="text-heading font-medium">
        Watch the recorded walkthrough
      </h2>
      <p className="mt-2 text-ui leading-relaxed text-foreground-2">
        {DEMO_VIDEO.duration} · Product workflows, salary validation and
        persistence, analysis, architecture and verification.
      </p>
      <video
        className="mt-5 aspect-video w-full rounded-lg bg-card"
        controls
        playsInline
        preload="none"
        poster="/demo-poster.jpg"
        aria-label="Salary Desk video demonstration"
      >
        <source src={DEMO_VIDEO.url} type="video/mp4" />
        Your browser can open the recording using the download link below.
      </video>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-meta">
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
      <p className="mt-1 text-meta text-muted-foreground">
        Playback starts when you press Play. The recording is hosted separately
        from the application; both viewing and download links are available.
      </p>
    </section>
  );
}
