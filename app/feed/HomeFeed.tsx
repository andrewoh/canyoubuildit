'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { feedPins, type Board } from './pins';
import useFeedPreviews from './useFeedPreviews';
import PinDetail from './PinDetail';
import Studio, { featureIds, StudioHeader } from './Studio';
import ProgramGuide, { StudioFooter } from './ProgramGuide';
import './home-feed.css';


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

function pinFromLocation(): OpenPin | null {
  const fragment = location.hash.slice(1);
  const legacy: Record<string, string> = { lab: '49ers', 'ai-lab': 'family-os', approach: 'about-andrew', process: 'family-os' };
  if (legacy[fragment] && byId.has(legacy[fragment])) return { id: legacy[fragment], touring: false };
  const match = /^(channel|pin|story)\/([a-z0-9-]+)$/.exec(fragment);
  if (!match || !byId.has(match[2])) return null;
  return { id: match[2], touring: match[1] === 'story' && tourStops.some(stop => stop.id === match[2]) };
}

export default function HomeFeed() {
  const [board, setBoard] = useState<Board | null>(null);
  const [query, setQuery] = useState('');
  const [opened, setOpened] = useState<OpenPin | null>(null);
  const [channelId, setChannelId] = useState<string>(featureIds[0]);
  const [watching, setWatching] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const studioId = 'studio-' + channelId;
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const visible = feedPins.filter(pin =>
    (!board || board === pin.board)
    && terms.every(term => searchIndex.get(pin.id)!.includes(term)),
  );
  const visibleKey = visible.map(item => item.id).join('.');
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
    setChannelId(featureIds[0]);
    setWatching(true);
  }

  function advanceLineup() {
    const next = featureIds[featureIds.indexOf(channelId) + 1];
    if (next) setChannelId(next);
    else stopLineup();
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
    syncLocation();
    window.addEventListener('popstate', syncLocation);
    window.addEventListener('hashchange', syncLocation);
    return () => {
      window.removeEventListener('popstate', syncLocation);
      window.removeEventListener('hashchange', syncLocation);
    };
  }, []);

  function openPin(id: string, touring = false) {
    setWatching(false);
    const hash = '#' + (touring ? 'story/' : 'channel/') + id;
    const state = { ...history.state, feedDetail: true };
    if (opened) history.replaceState(history.state, '', hash);
    else history.pushState(state, '', hash);
    setOpened({ id, touring });
  }

  function closePin() {
    setOpened(null);
    if (history.state?.feedDetail) history.back();
    else history.replaceState(history.state, '', location.pathname + location.search);
  }

  return (
    <div className="home-feed" id="top" ref={pageRef}>
      <a href="#work" className="feed-skip">Skip to project guide</a>
      <StudioHeader onHome={() => { setBoard(null); setQuery(''); }} />
      <main>
        <Studio channelId={channelId} onTune={id => { setWatching(false); setChannelId(id); }}
          playing={previews.activeId === studioId} watching={watching} onWatch={watchLineup} onEnded={advanceLineup}
          onPlay={() => { setWatching(false); previews.togglePin(studioId); }} onFailure={studioFailed}
          onDetail={openPin} onStory={() => openPin(tourStops[0].id, true)} />
        <ProgramGuide visible={visible} board={board} onBoard={setBoard} query={query} onQuery={setQuery}
          activeId={previews.activeId} onPlay={previews.togglePin} onFailure={previews.playbackFailed}
          onOpen={openPin} automaticAllowed={previews.automaticAllowed} autoOn={previews.autoOn} onToggleAuto={previews.toggleAuto} />
      </main>
      <StudioFooter />
      {pin && <PinDetail pin={pin} next={nextPin}
        onClose={closePin} onNext={() => { if (nextPin) openPin(nextPin.id, opened?.touring); }}
        tour={tourIndex >= 0 ? { step: tourIndex + 1, total: tourStops.length, note: tourStops[tourIndex].note } : undefined} />}
    </div>
  );
}
