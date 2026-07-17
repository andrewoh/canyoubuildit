type ProjectTone = "shipping" | "learning" | "retired";

type Project = {
  title: string;
  tone: ProjectTone;
  stage: string;
  summary: string;
  outcome: string;
  href?: string;
};

type Principle = {
  title: string;
  copy: string;
};

type Note = {
  label: string;
  title: string;
  copy: string;
};

const signals = [
  "personal ai projects",
  "successes with receipts",
  "failures worth documenting",
  "new ideas still on the workbench",
];

const projects: Project[] = [
  {
    title: "Wardrobe",
    tone: "shipping",
    stage: "Live personal tool",
    summary:
      "A visual catalog built from real outfit photos, with clean garment cutouts, useful filters, and modeled references for every piece.",
    outcome:
      "A private photo archive turned into a calm, browsable record of what is actually in rotation.",
    href: "/wardrobe",
  },
  {
    title: "Amex Platinum Benefit Tracker",
    tone: "shipping",
    stage: "Live household tool",
    summary:
      "A shared Andrew + Stella command center for tracking Amex Platinum credits by cadence, owner, completion date, notes, and realized value before benefits expire.",
    outcome:
      "A practical checklist that turns card benefits into an accountable household workflow.",
    href: "/amex-platinum-tracker/",
  },
  {
    title: "Personal Superhuman",
    tone: "shipping",
    stage: "Featured build",
    summary:
      "A private desktop inbox assistant for one human, designed to make Gmail and calendar triage calmer, faster, and more deliberate.",
    outcome:
      "The strongest projects here stay useful because they keep humans firmly in charge.",
  },
  {
    title: "Calendar Co-Pilot",
    tone: "learning",
    stage: "Still testing",
    summary:
      "Availability suggestions and event drafts for the meetings that should happen, without letting software quietly become the scheduler.",
    outcome:
      "Interesting whenever it advises clearly and stops short of pretending certainty.",
  },
  {
    title: "OpenClaw Digests",
    tone: "learning",
    stage: "Early experiments",
    summary:
      "A scratchpad for personal digests, reminders, and ambient nudges that may eventually deserve a place in the daily loop.",
    outcome:
      "Promising enough to keep exploring, but still earning the right to interrupt.",
  },
  {
    title: "Draft Autopilot",
    tone: "retired",
    stage: "Retired on purpose",
    summary:
      "An earlier attempt at effortless replies that taught the useful lesson that speed and trust are not the same thing.",
    outcome:
      "Failures stay visible here because they explain the taste of the projects that survive.",
  },
];

const principles: Principle[] = [
  {
    title: "Build fast, keep the paper trail.",
    copy:
      "Every experiment should leave behind something readable: a working surface, a clear lesson, or an honest reason it got cut.",
  },
  {
    title: "Trust is part of the interface.",
    copy:
      "If an AI tool writes, recommends, or schedules too confidently, it stops feeling magical and starts feeling suspicious.",
  },
  {
    title: "The misses deserve good lighting too.",
    copy:
      "Projects that failed still belong in the archive when they clarify the rules for what comes next.",
  },
];

const notes: Note[] = [
  {
    label: "Guardrail",
    title: "Treat inboxes, calendars, and model output as untrusted terrain.",
    copy:
      "Prompt injection, overconfident suggestions, and unclear provenance are product problems, not cleanup chores after launch.",
  },
  {
    label: "Taste",
    title: "The goal is not to automate everything.",
    copy:
      "The best projects here reduce drag, sharpen judgment, and help me move. They do not chase autonomy for its own sake.",
  },
  {
    label: "Rhythm",
    title: "One useful outcome beats five clever features.",
    copy:
      "If a build cannot make tomorrow meaningfully better, it probably stays in the notebook instead of graduating into the workflow.",
  },
];

function getToneLabel(tone: ProjectTone): string {
  switch (tone) {
    case "shipping":
      return "alive";
    case "learning":
      return "learning";
    case "retired":
      return "retired";
  }
}

export function App() {
  return (
    <main className="showcase-page" id="top">
      <section className="showcase-hero">
        <div aria-hidden="true" className="showcase-noise" />

        <header className="showcase-nav">
          <a className="showcase-wordmark" href="#top">
            <span className="showcase-wordmark-dot" />
            canyoubuildit.com
          </a>

          <nav aria-label="Primary" className="showcase-nav-links">
            <a href="#projects">Projects</a>
            <a href="#process">Process</a>
            <a href="#notes">Notes</a>
          </nav>
        </header>

        <div className="showcase-hero-grid">
          <div className="showcase-hero-copy">
            <p className="showcase-kicker showcase-reveal showcase-reveal-1">
              build archive
            </p>

            <h1 className="showcase-title showcase-reveal showcase-reveal-2">
              A running index of the AI projects I keep shipping, testing, and
              sometimes killing early.
            </h1>

            <p className="showcase-lede showcase-reveal showcase-reveal-3">
              <span>canyoubuildit.com</span> is where I keep the receipts:
              working builds, rough experiments, and the failures that taught
              the most.
            </p>

            <div className="showcase-actions showcase-reveal showcase-reveal-4">
              <a className="showcase-button showcase-button-primary" href="#projects">
                Browse the projects
              </a>
              <a className="showcase-button showcase-button-secondary" href="/wardrobe">
                Open Wardrobe
              </a>
            </div>
          </div>

          <div aria-hidden="true" className="showcase-visual">
            <div className="showcase-visual-rim" />

            <article className="showcase-artifact showcase-artifact-primary">
              <p className="showcase-artifact-label">Featured now</p>
              <strong>Wardrobe</strong>
              <span>
                outfit photos turned into a clean, modeled clothing catalog
              </span>
            </article>

            <article className="showcase-artifact showcase-artifact-secondary">
              <p className="showcase-artifact-label">Still probing</p>
              <strong>Calendar Co-Pilot</strong>
              <span>
                suggestions, slots, and drafts without pretending to be your
                boss
              </span>
            </article>

            <article className="showcase-artifact showcase-artifact-tertiary">
              <p className="showcase-artifact-label">Worth the lesson</p>
              <strong>Draft Autopilot</strong>
              <span>
                retired because overconfident software is worse than slow
                software
              </span>
            </article>
          </div>
        </div>

        <div className="showcase-signal-strip">
          {signals.map((signal) => (
            <span key={signal}>{signal}</span>
          ))}
        </div>
      </section>

      <section className="showcase-section" id="projects">
        <div className="showcase-section-head">
          <p className="showcase-section-label">Selected builds</p>
          <h2>
            Some of these are shipping. Some are still wobbling. A few are
            retired for good reasons.
          </h2>
        </div>

        <div className="showcase-project-list">
          {projects.map((project, index) => (
            <article
              className={`showcase-project showcase-project-${project.tone}`}
              key={project.title}
            >
              <p className="showcase-project-index">
                {String(index + 1).padStart(2, "0")}
              </p>

              <div className="showcase-project-main">
                <div className="showcase-project-heading">
                  <p className="showcase-project-stage">
                    {project.stage} / {getToneLabel(project.tone)}
                  </p>
                  <h3>{project.title}</h3>
                </div>

                <p className="showcase-project-summary">{project.summary}</p>

                {project.href ? (
                  <a className="showcase-button showcase-button-secondary" href={project.href}>
                    Open build
                  </a>
                ) : null}
              </div>

              <p className="showcase-project-outcome">{project.outcome}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="showcase-section showcase-process" id="process">
        <div className="showcase-process-grid">
          <div className="showcase-process-intro">
            <p className="showcase-section-label">Process</p>
            <h2>
              I treat each experiment like a receipt, not a launch announcement.
            </h2>
            <p>
              Fast prototypes. Human review. Better notes. Fewer fake victory
              laps.
            </p>
          </div>

          <div className="showcase-process-columns">
            <div className="showcase-principles">
              {principles.map((principle) => (
                <article className="showcase-principle" key={principle.title}>
                  <h3>{principle.title}</h3>
                  <p>{principle.copy}</p>
                </article>
              ))}
            </div>

            <div className="showcase-notes" id="notes">
              {notes.map((note) => (
                <article className="showcase-note" key={note.title}>
                  <p className="showcase-note-label">{note.label}</p>
                  <h3>{note.title}</h3>
                  <p>{note.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="showcase-section showcase-final">
        <p className="showcase-section-label">Next up</p>
        <h2>
          This is the front page for the projects that make it past the sketch
          stage.
        </h2>
        <p>
          More builds will get added over time. For now, this gives Personal
          Superhuman and the Amex Platinum tracker the right home: projects on
          the wall, not the wall itself.
        </p>

        <div className="showcase-actions">
          <a className="showcase-button showcase-button-primary" href="#top">
            Back to the top
          </a>
          <a className="showcase-button showcase-button-secondary" href="/amex-platinum-tracker/">
            Open Amex tracker
          </a>
        </div>
      </section>
    </main>
  );
}
