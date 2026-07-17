import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "SQL + Python Interview Pad | canyoubuildit.com",
  description: "A CoderPad-style SQL and Python practice workspace for technical interview preparation."
};

export default function InterviewPrepLayout({ children }: { children: ReactNode }) {
  return children;
}
