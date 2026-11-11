import type { ReactNode } from "react";
export function ReportSheet({ children }: { children: ReactNode }) {
  return (
    <div
      data-report-sheet
      className="mx-auto w-full min-w-0 max-w-[1280px] rounded-[2px] border bg-card px-5 py-8 text-body shadow-panel sm:px-10 sm:py-10 xl:px-16 xl:py-14"
    >
      {children}
    </div>
  );
}
