import type { Metadata } from 'next';
import { ArrowLeft, Download } from 'lucide-react';
import PrintButton from './print-button';
import './resume.css';

export const metadata: Metadata = {
  title: 'Andrew Oh | Data science résumé',
  description: 'Professional experience in data science leadership, AI strategy, subscriptions and experimentation.',
};

const experience = [
  {
    employer: 'Xero', role: 'Director of Data Science', dates: 'Sep 2024 – Present',
    work: [
      'Lead data science for Payments, Payroll and Ecosystem. Coach scientists and partner with product and engineering on decisions across all three areas.',
      'Develop AI agents for analytics and decision support, with shared metrics, evaluation and human review.',
    ],
  },
  {
    employer: 'Walmart', role: 'Senior Data Science Manager', dates: 'Mar 2023 – Aug 2024',
    work: [
      'Managed teams covering member engagement and retention, member care and account management, and data engineering.',
      'Expanded experimentation and built data foundations for Fraud, Trust & Safety, and Payments.',
    ],
  },
  {
    employer: 'Coinbase', role: 'Senior Data Scientist', dates: 'Apr 2022 – Jan 2023',
    work: [
      'Led data science for NFT Growth and Coinbase One. Used synthetic controls to measure the impact of the subscription.',
      'Received a 2022 High Impact award for the NFT launch and for helping Coinbase One grow from beta to over 200,000 users.',
    ],
  },
  {
    employer: 'Pinterest', role: 'Product Data Scientist', dates: 'Dec 2017 – Apr 2022',
    work: ['Managed analytics for teams building creator tools, monetization products and measurement.'],
  },
  {
    employer: 'PicsArt', role: 'Senior Business Analyst', dates: 'Jul 2016 – Nov 2017',
    work: ['Led analytics at the San Francisco headquarters, managed BI analysts, and used Python and Spark for clustering and funnel studies.'],
  },
  {
    employer: 'Yahoo!', role: 'Data Analyst → Data Insights Analyst III', dates: 'Jan 2013 – Jul 2016',
    work: ['Standardized Search instrumentation, ran Shopping experiments, and cut reporting latency from 30 minutes to real time.'],
  },
];

const earlier = [
  { employer: 'Blackhawk Network', role: 'Customer Service Analyst', dates: 'Aug 2010 – Dec 2012' },
  { employer: 'Property Sciences', role: 'Accounting Specialist', dates: 'May 2009 – Feb 2010' },
  { employer: 'Chevron', role: 'Payroll Representative', dates: 'Oct 2008 – Jan 2009' },
];

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
            <p>Director of Data Science</p>
            <span>San Francisco Bay Area <span aria-hidden="true">·</span> LinkedIn @ohandrew</span>
          </div>
          <p className="resume-summary">I lead data science teams in payments, subscriptions and customer retention. My work brings experimentation and AI-assisted analysis into product decisions.</p>
        </header>
        <section className="resume-experience" aria-labelledby="experience-title">
          <h2 id="experience-title">Experience</h2>
          {experience.map(position => <div className="resume-position" key={position.employer}>
            <div className="resume-position-heading">
              <h3>{position.employer} <span>{position.role}</span></h3>
              <span className="resume-dates">{position.dates}</span>
            </div>
            <ul>{position.work.map(line => <li key={line}>{line}</li>)}</ul>
          </div>)}
        </section>
        <section className="resume-short" aria-labelledby="earlier-title">
          <h2 id="earlier-title">Earlier experience</h2>
          {earlier.map(position => <div className="resume-position-heading" key={position.employer}>
            <p><strong>{position.employer}</strong> <span>{position.role}</span></p>
            <span className="resume-dates">{position.dates}</span>
          </div>)}
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
