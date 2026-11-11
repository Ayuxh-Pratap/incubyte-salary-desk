import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Providers } from "@/components/providers";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "Salary Desk · ACME", template: "%s · Salary Desk" },
  description: "A focused salary-management assessment for fictional ACME.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={
          GeistSans.variable +
          " " +
          GeistMono.variable +
          " font-sans antialiased"
        }
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
