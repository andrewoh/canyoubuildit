import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./wardrobe.css";

export const metadata: Metadata = {
  title: "Wardrobe | canyoubuildit.com",
  description: "A personal wardrobe index with cataloged pieces and outfit recommendations."
};

export default function WardrobeLayout({ children }: { children: ReactNode }) {
  return children;
}
