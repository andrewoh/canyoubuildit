'use client';

import { useRef, type ReactNode } from 'react';
import { ArrowUpRight, Bookmark, Search, X } from 'lucide-react';
import TransportMark from '../portfolio/bencho/TransportMark';
import type { Board } from './pins';
import './program-guide.css';

const topics: Board[] = ['AI systems', 'Data science', 'Products', 'About me'];

type View = 'home' | 'saved';

type ProgramGuideProps = {
  children: ReactNode;
  view: View;
  onView: (view: View) => void;
  board: Board | null;
  onBoard: (board: Board | null) => void;
  query: string;
  onQuery: (query: string) => void;
  count: number;
  savedCount: number;
  hasVideo: boolean;
  automaticAllowed: boolean;
  autoOn: boolean;
  onToggleAuto: () => void;
};

export default function ProgramGuide({
  children, view, onView, board, onBoard, query, onQuery, count,
  savedCount, hasVideo, automaticAllowed, autoOn, onToggleAuto,
}: ProgramGuideProps) {
  const searchRef = useRef<HTMLInputElement>(null);

  return (
    <section id="work" tabIndex={-1} aria-labelledby="guide-title" className="program-guide">
      <span id="in-flight" className="guide-anchor" aria-hidden="true" />
      <span id="projects" className="guide-anchor" aria-hidden="true" />
      <div className="guide-inner">
        <div className="guide-controls">
          <h2 id="guide-title">Program <em>guide</em></h2>
          <div className="guide-views" role="group" aria-label="Feed views">
            <button type="button" aria-pressed={view === 'home'} onClick={() => onView('home')}>All pins</button>
            <button type="button" aria-pressed={view === 'saved'} onClick={() => onView('saved')}>
              <Bookmark size={14} aria-hidden="true" /> Saved{savedCount > 0 && <span className="guide-saved-count">{savedCount}</span>}
            </button>
          </div>
          <form className="guide-search" role="search" onSubmit={event => event.preventDefault()}>
            <Search size={17} aria-hidden="true" />
            <input ref={searchRef} type="search" aria-label="Search pins" placeholder="Search the guide"
              value={query} onChange={event => onQuery(event.target.value)} onKeyDown={event => {
                if (event.key === 'Escape' && query) {
                  event.preventDefault();
                  onQuery('');
                }
              }} />
            {query && <button type="button" aria-label="Clear search" onClick={() => {
              onQuery('');
              searchRef.current?.focus();
            }}><X size={15} aria-hidden="true" /></button>}
          </form>
          <div className="guide-topics" role="group" aria-label="Filter by board">
            <button type="button" aria-pressed={board === null} onClick={() => onBoard(null)}>All topics</button>
            {topics.map(topic => <button type="button" key={topic}
              aria-pressed={board === topic} onClick={() => onBoard(topic)}>{topic}</button>)}
          </div>
          <div className="guide-status">
            <span className="guide-count" role="status" aria-atomic="true">{count} {count === 1 ? 'pin' : 'pins'}</span>
            {hasVideo && <button type="button" className="guide-preview-toggle" disabled={!automaticAllowed}
              aria-pressed={autoOn} onClick={onToggleAuto}
              aria-label={!automaticAllowed ? 'Automatic previews off. Use a pin’s play button.' : autoOn ? 'Pause automatic previews' : 'Enable automatic previews'}>
              <TransportMark playing={autoOn} size={13} />
              {!automaticAllowed ? 'Manual previews' : autoOn ? 'Pause previews' : 'Enable previews'}
            </button>}
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}

export function StudioFooter() {
  return (
    <footer id="contact" className="studio-footer">
      <div className="studio-footer-inner">
        <div className="studio-contact">
          <div className="studio-signature">
            <strong>Andrew Oh</strong>
            <span>Director of Data Science at Xero<br />Previously at Pinterest</span>
          </div>
          <a className="studio-contact-link" href="https://www.linkedin.com/in/ohandrew/" aria-label="Get in touch with Andrew on LinkedIn">
            Get in touch <ArrowUpRight aria-hidden="true" strokeWidth={1.25} />
          </a>
        </div>
        <nav className="studio-links" aria-label="More from Andrew">
          <a href="/resume">Résumé <ArrowUpRight size={14} aria-hidden="true" /></a>
          <a href="/archive">Build archive <ArrowUpRight size={14} aria-hidden="true" /></a>
        </nav>
      </div>
    </footer>
  );
}
