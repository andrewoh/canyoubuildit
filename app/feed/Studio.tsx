'use client';

import { ArrowDown, ArrowRight, ArrowUpRight, List, Pause, Play, Radio } from 'lucide-react';
import { SilentPreview } from './RecordingArt';
import { posterUrl, recordings } from './recordings';
import './studio.css';

export const channels = [
  { id: 'pokeread', name: 'PokéRead', category: 'Reading game', title: ['Poké', 'Read'], signal: 'green' },
  { id: '49ers', name: 'The injury question', category: 'Data science', title: ['Injury', 'report'], signal: 'wine' },
  { id: 'tend', name: 'Tend', category: 'Family AI', title: ['Tend'], signal: 'olive' },
] as const;

export function StudioHeader({ onHome }: { onHome: () => void }) {
  return <header className="feed-header studio-header">
    <div className="studio-header-inner">
      <a className="station-brand" href="#top" onClick={onHome}>
        <span className="station-mark" aria-hidden="true"><i/><i/><i/><i/><i/></span>
        Andrew Oh
      </a>
      <nav aria-label="Main navigation">
        <a href="#work" className="station-guide-link"><List size={17} aria-hidden="true"/> Program guide</a>
        <a className="station-resume" href="/resume">Résumé <ArrowUpRight size={15} aria-hidden="true"/></a>
      </nav>
    </div>
  </header>;
}

type StudioProps = {
  selected: number;
  onTune: (index: number) => void;
  playing: boolean;
  onPlay: () => void;
  watching: boolean;
  onWatch: () => void;
  onEnded: () => void;
  onFailure: (id: string) => void;
  onDetail: (id: string) => void;
  onStory: () => void;
};

export default function Studio({ selected, onTune, playing, onPlay, watching, onWatch, onEnded, onFailure, onDetail, onStory }: StudioProps) {
  const channel = channels[selected];
  const recording = recordings[channel.id]!;
  const channelNumber = String(selected + 1).padStart(2, '0');
  const playbackId = 'studio-' + channel.id;

  return <section className="studio" aria-labelledby="show-title" id="intro">
    <div className="studio-set">
      <div className="studio-copy">
        <p className="studio-byline">A project channel by Andrew Oh</p>
        <h1 id="show-title" tabIndex={-1}>After <em>Hours<span>.</span></em></h1>
        <p className="studio-introduction">I’m Director of Data Science at Xero. After work, I make reading games, build AI tools for family life, and put football hunches to the test.</p>
        <div className="studio-actions">
          <a href="#work" className="studio-browse">Explore the projects <ArrowDown size={16} aria-hidden="true"/></a>
          <button type="button" onClick={onStory}>My story <ArrowRight size={16} aria-hidden="true"/></button>
        </div>
      </div>
      <div className="studio-broadcast" data-demo-id={playbackId}>
        <div className="studio-tv">
          <img className="studio-tv-shell" src="/feed/studio/television.webp"
            srcSet="/feed/studio/television-small.webp 720w, /feed/studio/television.webp 1280w"
            sizes="(max-width: 680px) 100vw, (max-width: 1500px) 57vw, 850px"
            width={1280} height={853} fetchPriority="high" alt="Orange tabletop television with two tuning dials and a chrome antenna" draggable={false}/>
          <svg className="tube-def" width="0" height="0" aria-hidden="true" focusable="false"><defs>
            <clipPath id="tube-glass" clipPathUnits="objectBoundingBox">
              <path d="M .5 0 C .76 0 .89 .012 .94 .05 C .986 .085 1 .22 1 .5 C 1 .77 .988 .9 .944 .947 C .905 .984 .78 1 .5 1 C .22 1 .095 .985 .055 .947 C .014 .91 0 .78 0 .5 C 0 .21 .014 .087 .06 .048 C .10 .014 .24 0 .5 0 Z"/>
            </clipPath>
          </defs></svg>
          <div className={'studio-screen signal-' + channel.signal}>
            <div className="studio-raster" key={channel.id}>
              <div className="tube-caption" aria-hidden="true">
                <span className="tube-channel">CH {channelNumber}</span>
                <strong>{channel.title.map(word => <span key={word}>{word}</span>)}</strong>
                <span className="tube-category">{channel.category}</span>
              </div>
              <div className="tube-footage" aria-hidden="true">
                <img src={posterUrl(recording)} alt="" width={recording.width} height={recording.height} draggable={false} />
                {playing && <SilentPreview key={watching ? 'lineup' : 'preview'} recording={recording} id={playbackId} onFailure={onFailure} onEnded={watching ? onEnded : undefined}/>}
              </div>
            </div>
            <button className="tube-project" type="button" onClick={() => onDetail(channel.id)} aria-label={'Open featured project: ' + channel.name}/>
          </div>
          <button className="studio-dial dial-tune" type="button" aria-label="Tune to the next channel" title="Next channel"
            onClick={() => onTune((selected + 1) % channels.length)}/>
          <button className="studio-dial dial-play" type="button" aria-label={playing ? 'Pause television' : 'Play television'} title={playing ? 'Pause' : 'Play'}
            onClick={onPlay}/>
        </div>
        <div className="studio-readout" aria-live="polite">
          <button type="button" className="station-transport" onClick={onPlay} aria-label={(playing ? 'Pause' : 'Play') + ' featured demo'}
            title={playing ? 'Pause recording' : 'Play recording'}>
            {playing ? <Pause size={12} fill="currentColor"/> : <Play size={12} fill="currentColor"/>}
          </button>
          <span>CH {channelNumber}</span><i aria-hidden="true"/>
          <button type="button" onClick={() => onDetail(channel.id)} className="station-project">{channel.name}{channel.id === 'tend' ? ' · Sample data' : ''} <ArrowUpRight size={13}/></button>
        </div>
      </div>
    </div>
    <div className="studio-lineup">
      <div className="lineup-inner">
        <div className="lineup-label"><Radio size={19} strokeWidth={1.6} aria-hidden="true"/><span>Tune in</span></div>
        <div className="lineup-buttons" role="group" aria-label="Choose a featured channel">
          {channels.map((entry, index) => <button key={entry.id} type="button" aria-pressed={selected === index} onClick={() => onTune(index)}>
            <span className="lineup-number">0{index + 1}</span><span>{entry.name}</span>
          </button>)}
        </div>
        <button className="lineup-watch" type="button" aria-pressed={watching} onClick={onWatch}>
          {watching ? <Pause size={13} fill="currentColor"/> : <Play size={13} fill="currentColor"/>}
          {watching ? 'Stop lineup' : 'Watch all three'}
        </button>
      </div>
    </div>
  </section>;
}
