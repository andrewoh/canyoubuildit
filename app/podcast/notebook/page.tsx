import type { Metadata } from "next";

const audioSrc = "/podcast/notebook-python-walkthrough.m4a";

const sections = [
  "Assumptions and confidence labels",
  "Helper functions and effect tables",
  "Data loading and derived fields",
  "Validation and randomization checks",
  "Signup lift, timing, and censoring",
  "Retention maturity and mature cohort stress test",
  "Day-of-week heterogeneity",
  "ROI sensitivity and launch recommendation",
  "Reproducibility outputs"
];

export const metadata: Metadata = {
  title: "Python Notebook Podcast | canyoubuildit.com",
  description: "A notebook-first audio walkthrough of the Free First Month experiment analysis."
};

export default function NotebookPodcastPage() {
  return (
    <main className="notebookPodcast">
      <section className="notebookHero" aria-labelledby="notebook-title">
        <div className="notebookHeroInner">
          <p className="notebookKicker">Free First Month Experiment</p>
          <h1 id="notebook-title">Python Notebook Walkthrough</h1>
          <p className="notebookLead">
            A calm, notebook-first explanation of the analysis logic, from data validation through retention maturity, ROI, and the final launch recommendation.
          </p>
          <div className="notebookPlayer" aria-label="Notebook podcast audio player">
            <audio controls preload="metadata" src={audioSrc}>
              <a href={audioSrc}>Download the notebook podcast audio</a>
            </audio>
            <div className="notebookMeta">
              <span>14 min 12 sec</span>
              <span>Kokoro local TTS</span>
              <span>M4A audio</span>
            </div>
          </div>
          <a className="notebookDownload" href={audioSrc} download>
            Download audio
          </a>
        </div>
      </section>

      <section className="notebookBody" aria-label="Podcast outline">
        <div>
          <p className="notebookKicker">What it covers</p>
          <h2>Built around the Python notebook, not the deck.</h2>
        </div>
        <ol className="notebookSections">
          {sections.map((section) => (
            <li key={section}>{section}</li>
          ))}
        </ol>
      </section>

      <section className="notebookCaveats" aria-label="Core caveats">
        <p>
          Core caveats preserved: <code>paid_signup_date</code> likely marks trial or plan start, true post-trial paid retention is not observed for most treatment signups, and broad launch should wait for mature paid conversion, retention, and ROI gates.
        </p>
      </section>
    </main>
  );
}
