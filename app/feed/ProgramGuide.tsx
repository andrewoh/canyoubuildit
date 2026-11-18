'use client';

import { useRef, type MouseEvent } from 'react';
import { ArrowRight, ArrowUpRight, Search, X } from 'lucide-react';
import TransportMark from '../portfolio/bencho/TransportMark';
import PinArt from './PinArt';
import { SilentPreview } from './RecordingArt';
import { channelNumber, type Board, type FeedPin } from './pins';
import { posterUrl, recordings } from './recordings';
import './program-guide.css';

const topics: Board[] = ['AI systems', 'Data science', 'Products', 'About me'];

type ProgramGuideProps = {
  visible: FeedPin[];
  board: Board | null;
  onBoard: (board: Board | null) => void;
  query: string;
  onQuery: (value: string) => void;
  activeId: string | null;
  onPlay: (id: string) => void;
  onFailure: (id: string) => void;
  onOpen: (id: string) => void;
  automaticAllowed: boolean;
  autoOn: boolean;
  onToggleAuto: () => void;
};

function ChannelListing({ item, playing, onPlay, onFailure, onOpen }: {
  item: FeedPin;
  playing: boolean;
} & Pick<ProgramGuideProps, 'onPlay' | 'onFailure' | 'onOpen'>) {
  const number = channelNumber(item.id);
  const clip = recordings[item.id];
  const format = clip?.label ?? (item.id === 'dropalpha' ? 'Example data' : undefined);

  function open(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onOpen(item.id);
  }

  return (
    <article className="guide-listing" aria-label={'Channel ' + number + ', ' + item.project}
      data-demo-id={clip ? item.id : undefined} data-channel={item.id}>
      <a className="guide-program-link" href={'#channel/' + item.id} onClick={open}
        aria-label={'Open channel ' + number + ': ' + item.project}>
        <span className="guide-frequency" aria-hidden="true"><span>CH</span><strong>{number}</strong></span>
        <div className="guide-media" aria-hidden="true">
          {clip ? <div className="guide-frame">
            <img src={posterUrl(clip)} width={clip.width} height={clip.height} alt="" loading="lazy" decoding="async" />
            {playing && <SilentPreview recording={clip} id={item.id} onFailure={onFailure} />}
          </div> : <PinArt pin={item} />}
        </div>
        <div className="guide-program-copy">
          <div className="guide-format">{item.board}{format && <> <span aria-hidden="true">/</span> {format}</>}</div>
          <h3>{item.project} <ArrowRight size={20} strokeWidth={1.6} aria-hidden="true" /></h3>
          <p>{item.caption}</p>
        </div>
        <span className="guide-open-mark" aria-hidden="true"><ArrowRight size={23} strokeWidth={1.6} /></span>
      </a>
      {clip && <button className="guide-transport" type="button"
        aria-label={(playing ? 'Pause' : 'Play') + ' ' + item.project + ' preview'}
        aria-pressed={playing} onClick={() => onPlay(item.id)}>
        <TransportMark playing={playing} size={13} />
        <span>0:{String(clip.seconds).padStart(2, '0')}</span>
      </button>}
    </article>
  );
}

export default function ProgramGuide({ visible, board, onBoard, query, onQuery, activeId,
  onPlay, onFailure, onOpen, automaticAllowed, autoOn, onToggleAuto }: ProgramGuideProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  const hasVideo = visible.some(item => recordings[item.id]);

  return (
    <section id="work" tabIndex={-1} aria-labelledby="guide-title" className="program-guide">
      <span id="in-flight" className="guide-anchor" aria-hidden="true" />
      <span id="projects" className="guide-anchor" aria-hidden="true" />
      <div className="guide-inner">
        <div className="guide-mast">
          <h2 id="guide-title">Channel <em>guide.</em></h2>
          <form className="guide-search" role="search" onSubmit={event => event.preventDefault()}>
            <Search size={17} aria-hidden="true" />
            <input ref={searchRef} type="search" aria-label="Search channels" placeholder="Find a program"
              value={query} onChange={event => onQuery(event.target.value)} onKeyDown={event => {
                if (event.key === 'Escape' && query) { event.preventDefault(); onQuery(''); }
              }} />
            {query && <button type="button" aria-label="Clear search" onClick={() => {
              onQuery(''); searchRef.current?.focus();
            }}><X size={15} aria-hidden="true" /></button>}
          </form>
        </div>
        <div className="guide-controls">
          <div className="guide-topics" role="group" aria-label="Filter channels by topic">
            <button type="button" aria-pressed={board === null} onClick={() => onBoard(null)}>All channels</button>
            {topics.map(topic => <button type="button" key={topic}
              aria-pressed={board === topic} onClick={() => onBoard(topic)}>{topic}</button>)}
          </div>
          <div className="guide-status">
            <span role="status" aria-atomic="true">{visible.length} {visible.length === 1 ? 'channel' : 'channels'}</span>
            {hasVideo && <button className="guide-preview-toggle" type="button" disabled={!automaticAllowed}
              onClick={onToggleAuto} aria-pressed={autoOn}
              aria-label={automaticAllowed ? (autoOn ? 'Pause automatic previews' : 'Enable automatic previews') : 'Use the play button on a channel for a preview'}>
              <TransportMark playing={autoOn} size={12} />
              {!automaticAllowed ? 'Manual previews' : autoOn ? 'Pause previews' : 'Enable previews'}
            </button>}
          </div>
        </div>
        <div className="guide-listings">
          {visible.map(item => <ChannelListing key={item.id} item={item} playing={activeId === item.id}
            onPlay={onPlay} onFailure={onFailure} onOpen={onOpen} />)}
          {!visible.length && <div className="guide-empty">
            <h3>No matching programs</h3>
            <button type="button" onClick={() => { onBoard(null); onQuery(''); }}>Show all channels <ArrowRight size={15} /></button>
          </div>}
        </div>
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
