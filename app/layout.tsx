import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./showcase.css";

export const metadata: Metadata = {
  title: "canyoubuildit.com",
  description: "A personal showcase of AI projects, experiments, shipped ideas, and useful failures."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
