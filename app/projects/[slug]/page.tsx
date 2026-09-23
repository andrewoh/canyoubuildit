import { notFound } from "next/navigation";

import { recentProjects } from "../../../data/recent-projects";

type ProjectPreviewPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProjectPreviewPage({ params }: ProjectPreviewPageProps) {
  const { slug } = await params;
  const project = recentProjects.find(
    (entry) => entry.href === `/projects/${slug}` && entry.preview,
  );

  if (!project?.preview) {
    notFound();
  }

  return (
    <main
      style={{
        alignItems: "center",
        background: "#07100d",
        color: "#f8f1e4",
        display: "flex",
        fontFamily: "Arial, sans-serif",
        minHeight: "100vh",
        padding: "clamp(28px, 8vw, 110px)",
      }}
    >
      <section style={{ maxWidth: 760 }}>
        <a href="/#in-flight" style={{ color: "#9fc3ad", textDecoration: "none" }}>
          ← canyoubuildit.com / in flight
        </a>
        <p style={{ color: "#f0b86f", fontSize: 13, letterSpacing: ".14em", marginTop: 54, textTransform: "uppercase" }}>
          {project.preview.eyebrow}
        </p>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(48px, 9vw, 100px)", letterSpacing: "-.055em", lineHeight: 0.95, margin: "14px 0 28px" }}>
          {project.title}
        </h1>
        <p style={{ fontFamily: "Georgia, serif", fontSize: "clamp(24px, 3.5vw, 38px)", lineHeight: 1.15, margin: 0 }}>
          {project.preview.detail}
        </p>
        <p style={{ borderTop: "1px solid #375044", color: "#c4d0c6", fontSize: 17, lineHeight: 1.55, marginTop: 48, maxWidth: 620, paddingTop: 24 }}>
          {project.summary}
        </p>
        <p style={{ color: "#9fc3ad", fontSize: 14, marginTop: 38 }}>
          Public project preview · last local activity {project.touched}
        </p>
      </section>
    </main>
  );
}
