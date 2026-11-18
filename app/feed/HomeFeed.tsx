'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import { ArrowRight, Bookmark, Check, Search, X } from 'lucide-react';
import { feedPins, type Board, type FeedPin } from './pins';
import PinArt from './PinArt';
import ProjectTilt from '../portfolio/bencho/ProjectTilt';
import TransportMark from '../portfolio/bencho/TransportMark';
import { recordings } from './recordings';
import useFeedPreviews from './useFeedPreviews';
import PinDetail from './PinDetail';
import Studio, { channels, StudioHeader } from './Studio';
import ProgramGuide, { StudioFooter } from './ProgramGuide';
import './home-feed.css';


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
  const [channel, setChannel] = useState(0);
  const [watching, setWatching] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const studioId = 'studio-' + channels[channel].id;
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const visible = feedPins.filter(pin =>
    (view === 'home' || saved.includes(pin.id)) && (!board || board === pin.board)
    && terms.every(term => searchIndex.get(pin.id)!.includes(term)),
  );
  const visibleKey = visible.map(item => item.id).join('.');
  const gridRef = useMasonry(visibleKey);
  const previews = useFeedPreviews(pageRef, studioId + '/' + visibleKey, Boolean(opened));
  const { playPin, playbackFailed } = previews;

  // The lineup is an explicit, finite play request, even when automatic previews are disabled.
  // Scrolling to the index or backgrounding the tab hands playback back to the feed.
  useEffect(() => {
    const screen = pageRef.current?.querySelector('.studio-screen');
    if (!watching || !screen || opened) return;
    playPin(studioId);
    const cancel = () => setWatching(false);
    const hidden = () => { if (document.hidden) cancel(); };
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) cancel();
    }) : null;
    observer?.observe(screen);
    document.addEventListener('visibilitychange', hidden);
    return () => { observer?.disconnect(); document.removeEventListener('visibilitychange', hidden); };
  }, [watching, studioId, playPin, opened]);

  const studioFailed = useCallback((id: string) => {
    setWatching(false);
    playbackFailed(id);
  }, [playbackFailed]);

  function stopLineup() {
    previews.pausePin(studioId);
    setWatching(false);
  }

  function watchLineup() {
    if (watching) { stopLineup(); return; }
    const screen = pageRef.current?.querySelector('.studio-screen');
    const bounds = screen?.getBoundingClientRect();
    if (bounds && (bounds.top < 58 || bounds.bottom > window.innerHeight)) {
      screen?.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
    setChannel(0);
    setWatching(true);
  }

  function advanceLineup() {
    if (channel === channels.length - 1) stopLineup();
    else setChannel(channel + 1);
  }

  const pin = opened ? byId.get(opened.id) : null;
  const tourIndex = opened?.touring ? tourStops.findIndex(stop => stop.id === opened.id) : -1;
  const nextStop = tourIndex >= 0 ? tourStops[tourIndex + 1] : null;
  const pinIndex = visible.findIndex(item => item.id === pin?.id);
  const nextPin = opened?.touring
    ? (nextStop ? byId.get(nextStop.id)! : null)
    : (pinIndex >= 0 ? visible[pinIndex + 1] ?? null : null);

  useEffect(() => {
    const syncLocation = () => { setWatching(false); setOpened(pinFromLocation()); };
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
    setWatching(false);
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
  }

  return (
    <div className="home-feed" id="top" ref={pageRef}>
      <a href="#work" className="feed-skip">Skip to project guide</a>
      <StudioHeader onHome={() => switchView('home')} />
      <main>
        <Studio selected={channel} onTune={index => { setWatching(false); setChannel(index); }}
          playing={previews.activeId === studioId} watching={watching} onWatch={watchLineup} onEnded={advanceLineup}
          onPlay={() => { setWatching(false); previews.togglePin(studioId); }} onFailure={studioFailed}
          onDetail={openPin} onStory={() => openPin(tourStops[0].id, true)} />
        <ProgramGuide view={view} onView={switchView} board={board} onBoard={setBoard}
          query={query} onQuery={setQuery} count={visible.length} savedCount={saved.length}
          hasVideo={visible.some(item => recordings[item.id])} automaticAllowed={previews.automaticAllowed}
          autoOn={previews.autoOn} onToggleAuto={previews.toggleAuto}>
          <div ref={gridRef} className="feed-grid">
            {visible.map(item => {
              const kept = saved.includes(item.id);
              const recording = recordings[item.id];
              const playing = previews.activeId === item.id;
              const cover = <PinArt pin={item} playing={playing} onFailure={previews.playbackFailed} />;
              const href = '#pin/' + item.id;
              return <div key={item.id} className="feed-cell">
                <article className="feed-tile" data-demo-id={recording ? item.id : undefined}>
                  <div className="feed-media-stage">
                    <a className="feed-pin-link" href={href} aria-label={'Open pin: ' + item.title} onClick={event => followPin(event, item.id)}>
                      <div className="feed-cover">{recording ? cover : <ProjectTilt>{cover}</ProjectTilt>}</div>
                    </a>
                    {recording && <button type="button" className="feed-preview-action"
                      aria-label={(playing ? 'Pause ' : 'Play ') + item.project + ' preview'} aria-pressed={playing}
                      onClick={() => previews.togglePin(item.id)}>
                      <TransportMark playing={playing} size={13} />
                      <span>0:{String(recording.seconds).padStart(2, '0')}</span>
                    </button>}
                    <button className="feed-save" type="button" aria-label={(kept ? 'Unsave ' : 'Save ') + item.title} aria-pressed={kept}
                      title={kept ? 'Remove from saved pins' : 'Save pin'} onClick={() => toggleSave(item)}>
                      {kept ? <Check size={16} /> : <Bookmark size={16} />}
                    </button>
                  </div>
                  <div className="feed-caption">
                    <span className="feed-project">{item.project}{recording ? ' · ' + recording.label : ''}</span>
                    <h3><a href={href} tabIndex={-1} onClick={event => followPin(event, item.id)}>{item.title}</a></h3>
                  </div>
                </article>
              </div>;
            })}
          </div>
          {visible.length === 0 && <div className="feed-empty">
            {view === 'saved' && !saved.length ? <>
              <Bookmark size={28} /><h2>Your saved pins will appear here.</h2>
              <p>Tap the bookmark on any pin to keep it on this device.</p>
              <button onClick={() => switchView('home')}>Explore all pins <ArrowRight size={16}/></button>
            </> : <>
              <Search size={28} /><h2>No matching pins</h2><p>Try a project name, a topic, or a different board.</p>
              <button onClick={() => { setBoard(null); setQuery(''); }}>Clear filters <X size={15}/></button>
            </>}
          </div>}
        </ProgramGuide>
      </main>
      <StudioFooter />
      <span className="feed-sr" role="status">{announcement}</span>
      {pin && <PinDetail pin={pin} next={nextPin} saved={saved.includes(pin.id)} onSave={() => toggleSave(pin)}
        onClose={closePin} onNext={() => { if (nextPin) openPin(nextPin.id, opened?.touring); }}
        tour={tourIndex >= 0 ? { step: tourIndex + 1, total: tourStops.length, note: tourStops[tourIndex].note } : undefined} />}
    </div>
  );
}
