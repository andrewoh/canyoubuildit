import type { Metadata } from 'next';
import { ArrowLeft, Download } from 'lucide-react';
import PrintButton from './print-button';
import { earlierExperience, experience } from './experience';
import './resume.css';

export const metadata: Metadata = {
  title: 'Andrew Oh | Data science résumé',
  description: 'Professional experience in data science leadership, AI strategy, subscriptions and experimentation.',
};

export default function Resume() {
  return (
    <main className="resume-page">
      <nav aria-label="Résumé tools" className="resume-nav">
        <a href="/"><ArrowLeft size={16} aria-hidden="true" /> After Hours</a>
        <div className="resume-actions">
          <a href="/profile/andrew-oh.pdf" download><Download size={15} aria-hidden="true" /> Download PDF</a>
          <PrintButton />
        </div>
      </nav>
      <article className="resume-sheet" aria-labelledby="resume-name">
        <header className="resume-header">
          <h1 id="resume-name">Andrew <em>Oh</em><span className="resume-period" aria-hidden="true">.</span></h1>
          <div className="resume-heading-meta">
            <p>Director of Data Science at Xero</p>
            <span>San Francisco Bay Area <span aria-hidden="true">·</span> LinkedIn @ohandrew</span>
          </div>
          <p className="resume-summary">Data Products &amp; AI Strategy | Subscriptions, Experimentation &amp; Customer Lifecycle</p>
        </header>
        <section className="resume-experience" aria-labelledby="experience-title">
          <h2 id="experience-title">Experience</h2>
          {experience.map(position => (
            <article className="resume-position" key={position.employer}>
              <div className="resume-position-heading">
                <h3>{position.employer}{position.role && <> <span>{position.role}</span></>}</h3>
                <span className="resume-dates">{position.dates}</span>
              </div>
              {position.progression && (
                <dl className="resume-progression">
                  {position.progression.map(step => (
                    <div key={step.role}><dt>{step.role}</dt><dd>{step.dates}</dd></div>
                  ))}
                </dl>
              )}
              {position.summary && <p className="resume-role-summary">{position.summary}</p>}
              {position.work && <ul>{position.work.map(line => <li key={line}>{line}</li>)}</ul>}
            </article>
          ))}
        </section>
        <section className="resume-earlier" aria-labelledby="earlier-title">
          <h2 id="earlier-title">Earlier experience</h2>
          <ul>
            {earlierExperience.map(position => (
              <li key={position.employer}>
                <div className="resume-position-heading">
                  <h3>{position.employer} <span>{position.role}</span></h3>
                  <span className="resume-dates">{position.dates}</span>
                </div>
                <p>{position.summary}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="resume-short" aria-labelledby="education-title">
          <h2 id="education-title">Education</h2>
          <div className="resume-position-heading">
            <p><strong>University of California, Davis</strong> <span>B.A., Economics and Religious Studies</span></p>
            <span className="resume-dates">2004 – 2008</span>
          </div>
        </section>
      </article>
    </main>
  );
}
