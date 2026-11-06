'use client';

import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import { ArrowRight, ArrowUpRight, Bookmark, Check, Search, X } from 'lucide-react';
import { feedPins, type Board, type FeedPin } from './pins';
import PinArt from './PinArt';
import PinDetail from './PinDetail';
import './home-feed.css';

const boards: Board[] = ['About me', 'AI systems', 'Data science', 'Products'];
const savedKey = 'andrew-oh.saved-pins.v1';
const tourStops = [
  { id: 'about-andrew', note: 'A few of the things that find their way into my projects.' },
  { id: 'work-history', note: 'Where I’ve worked, and where to find my professional background.' },
  { id: '49ers', note: 'One question I wanted to answer with data.' },
  { id: 'family-os', note: 'One decision I wanted a person to keep.' },
];

type OpenPin = { id: string; touring: boolean };
const byId = new Map(feedPins.map(pin => [pin.id, pin]));
const searchIndex = new Map(feedPins.map(pin => [
  pin.id, [pin.title, pin.project, pin.board, pin.caption, pin.story, pin.decision].join(' ').toLowerCase(),
]));

function readSaved(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(savedKey) || '[]');
    return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === 'string' && byId.has(id)))] : [];
  } catch {
    return [];
  }
}

function pinFromLocation(): OpenPin | null {
  const fragment = location.hash.slice(1);
  const legacy: Record<string, string> = { lab: '49ers', 'ai-lab': 'family-os', approach: 'about-andrew', process: 'family-os' };
  if (legacy[fragment] && byId.has(legacy[fragment])) return { id: legacy[fragment], touring: false };
  const match = /^(pin|story)\/([a-z0-9-]+)$/.exec(fragment);
  if (!match || !byId.has(match[2])) return null;
  return { id: match[2], touring: match[1] === 'story' && tourStops.some(stop => stop.id === match[2]) };
}

// Keep the reading order in the DOM. Only the space reserved under each pin
// changes when the column width, artwork, or caption changes.
function useMasonry(visibleKey: string) {
  const gridRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid || !window.ResizeObserver) return;
    const tiles = Array.from(grid.querySelectorAll<HTMLElement>('.feed-tile'));
    const update = (tile: HTMLElement, height: number) => {
      tile.parentElement?.style.setProperty('--pin-rows', String(Math.ceil(height / 4)));
    };
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.target.getBoundingClientRect().height;
        update(entry.target as HTMLElement, height);
      }
    });
    const heights = tiles.map(tile => tile.getBoundingClientRect().height);
    tiles.forEach((tile, index) => {
      update(tile, heights[index]);
      observer.observe(tile, { box: 'border-box' });
    });
    grid.dataset.masonry = 'ready';
    return () => observer.disconnect();
  }, [visibleKey]);
  return gridRef;
}

export default function HomeFeed() {
  const [view, setView] = useState<'home' | 'saved'>('home');
  const [board, setBoard] = useState<Board | null>(null);
  const [query, setQuery] = useState('');
  const [saved, setSaved] = useState<string[]>([]);
  const [opened, setOpened] = useState<OpenPin | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const visible = feedPins.filter(pin =>
    (view === 'home' || saved.includes(pin.id)) && (!board || board === pin.board)
    && terms.every(term => searchIndex.get(pin.id)!.includes(term)),
  );
  const gridRef = useMasonry(visible.map(pin => pin.id).join('.'));
  const pin = opened ? byId.get(opened.id) : null;
  const tourIndex = opened?.touring ? tourStops.findIndex(stop => stop.id === opened.id) : -1;
  const nextStop = tourIndex >= 0 ? tourStops[tourIndex + 1] : null;
  const pinIndex = visible.findIndex(item => item.id === pin?.id);
  const nextPin = opened?.touring
    ? (nextStop ? byId.get(nextStop.id)! : null)
    : (pinIndex >= 0 ? visible[pinIndex + 1] ?? null : null);

  useEffect(() => {
    const syncLocation = () => setOpened(pinFromLocation());
    const syncSaved = (event: StorageEvent) => {
      if (event.key === savedKey || event.key === null) setSaved(readSaved());
    };
    syncLocation();
    setSaved(readSaved());
    window.addEventListener('popstate', syncLocation);
    window.addEventListener('hashchange', syncLocation);
    window.addEventListener('storage', syncSaved);
    return () => {
      window.removeEventListener('popstate', syncLocation);
      window.removeEventListener('hashchange', syncLocation);
      window.removeEventListener('storage', syncSaved);
    };
  }, []);

  function openPin(id: string, touring = false) {
    const hash = '#' + (touring ? 'story/' : 'pin/') + id;
    const state = { ...history.state, feedDetail: true };
    if (opened) history.replaceState(history.state, '', hash);
    else history.pushState(state, '', hash);
    setOpened({ id, touring });
  }

  function followPin(event: MouseEvent<HTMLAnchorElement>, id: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    openPin(id);
  }

  function closePin() {
    setOpened(null);
    if (history.state?.feedDetail) history.back();
    else history.replaceState(history.state, '', location.pathname + location.search);
  }

  function toggleSave(item: FeedPin) {
    const removing = saved.includes(item.id);
    const updated = removing ? saved.filter(id => id !== item.id) : [...saved, item.id];
    setSaved(updated);
    setAnnouncement(item.title + (removing ? ' removed from saved pins.' : ' saved.'));
    try { localStorage.setItem(savedKey, JSON.stringify(updated)); } catch { /* Saving still works for this visit. */ }
  }

  function switchView(next: typeof view) {
    setView(next);
    setBoard(null);
    setQuery('');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  return (
    <div className="home-feed" id="top">
      <a href="#work" className="feed-skip">Skip to pins</a>
      <header className="feed-header">
        <div className="feed-header-inner">
          <button className="feed-brand" type="button" aria-label="Andrew Oh, return to home feed" onClick={() => switchView('home')}>
            <span className="feed-monogram" aria-hidden="true">ao</span>
            <strong>Andrew Oh</strong>
          </button>
          <nav className="feed-nav" aria-label="Feed views">
            <button type="button" aria-pressed={view === 'home'} onClick={() => switchView('home')}>Home</button>
            <button type="button" aria-pressed={view === 'saved'} onClick={() => switchView('saved')}>
              Saved{saved.length > 0 && <span className="saved-count">{saved.length}</span>}
            </button>
          </nav>
          <form className="feed-search" role="search" onSubmit={event => event.preventDefault()}>
            <Search size={18} aria-hidden="true" />
            <input ref={searchRef} aria-label="Search pins" type="search" placeholder="Search my pins" value={query}
              onChange={event => {
                setQuery(event.target.value);
                if (window.scrollY > 160) window.scrollTo({ top: 0, behavior: 'instant' });
              }} onKeyDown={event => {
                if (event.key === 'Escape') { setQuery(''); searchRef.current?.blur(); }
              }} />
            {query && <button type="button" aria-label="Clear search" onClick={() => { setQuery(''); searchRef.current?.focus(); }}><X size={16} /></button>}
          </form>
          <a className="feed-resume" href="/resume">Résumé <ArrowUpRight size={16} /></a>
        </div>
      </header>

      <main className="feed-main">
        <div className="feed-intro" id="intro">
          <div>
            <h1 tabIndex={-1}>{view === 'home' ? <>My home <em>feed.</em></> : <>Saved <em>pins.</em></>}</h1>
            <p>{view === 'home' ? 'A little about me and the things I’ve been building with AI and data.' : 'The pins you’ve kept on this device.'}</p>
          </div>
          {view === 'home' && <button type="button" className="feed-tour" onClick={() => openPin(tourStops[0].id, true)}>
            <span className="feed-stack" aria-hidden="true"><i/><i/><i>ao</i></span>
            My story in 4 pins <ArrowRight size={16} />
          </button>}
        </div>

        <section id="work" aria-label={view === 'home' ? 'Andrew’s pins' : 'Your saved pins'}>
          <span id="in-flight" className="feed-anchor" /><span id="projects" className="feed-anchor" />
          <div className="feed-tools">
            <div className="feed-boards" role="group" aria-label="Filter by board">
              <button type="button" aria-pressed={!board} onClick={() => setBoard(null)}>All pins</button>
              {boards.map(name => <button type="button" key={name} aria-pressed={board === name} onClick={() => setBoard(name)}>{name}</button>)}
            </div>
            <span className="feed-result-count" role="status">{visible.length} {visible.length === 1 ? 'pin' : 'pins'}</span>
          </div>
          <div ref={gridRef} className="feed-grid">
            {visible.map(item => {
              const kept = saved.includes(item.id);
              return <div key={item.id} className="feed-cell">
                <article className="feed-tile">
                  <a className="feed-pin-link" href={'#pin/' + item.id} aria-label={'Open pin: ' + item.title} onClick={event => followPin(event, item.id)}>
                    <div className="feed-cover"><PinArt pin={item} /></div>
                    <div className="feed-caption">
                      <span className="feed-project">{item.project}</span>
                      <h2>{item.title}</h2>
                    </div>
                  </a>
                  <button className="feed-save" type="button" aria-label={(kept ? 'Unsave ' : 'Save ') + item.title} aria-pressed={kept}
                    title={kept ? 'Remove from saved pins' : 'Save pin'} onClick={() => toggleSave(item)}>
                    {kept ? <Check size={16} /> : <Bookmark size={16} />}
                  </button>
                </article>
              </div>;
            })}
          </div>
          {visible.length === 0 && <div className="feed-empty">
            {view === 'saved' && !saved.length ? <>
              <Bookmark size={28} /><h2>Your saved pins will appear here.</h2>
              <p>Tap the bookmark on any pin to keep it on this device.</p>
              <button onClick={() => switchView('home')}>Explore the feed <ArrowRight size={16}/></button>
            </> : <>
              <Search size={28} /><h2>No matching pins</h2><p>Try a project name, a topic, or a different board.</p>
              <button onClick={() => { setBoard(null); setQuery(''); }}>Clear filters <X size={15}/></button>
            </>}
          </div>}
        </section>
      </main>
      <footer className="feed-footer" id="contact">
        <div><strong>Andrew Oh</strong><span>Director of Data Science at Xero · Previously at Pinterest</span></div>
        <nav aria-label="More about Andrew"><a href="/archive">Build archive</a><a href="/resume">Résumé</a><a href="https://www.linkedin.com/in/ohandrew/">LinkedIn <ArrowUpRight size={14}/></a></nav>
      </footer>
      <span className="feed-sr" role="status">{announcement}</span>
      {pin && <PinDetail pin={pin} next={nextPin} saved={saved.includes(pin.id)} onSave={() => toggleSave(pin)}
        onClose={closePin} onNext={() => { if (nextPin) openPin(nextPin.id, opened?.touring); }}
        tour={tourIndex >= 0 ? { step: tourIndex + 1, total: tourStops.length, note: tourStops[tourIndex].note } : undefined} />}
    </div>
  );
}
