import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./seoul.css";

export const metadata: Metadata = {
  title: "Seoul Trip | canyoubuildit.com",
  description: "Password-protected Seoul trip schedule and budget dashboard."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
