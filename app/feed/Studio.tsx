'use client';

import { ArrowDown, ArrowRight, ArrowUpRight, List, Pause, Play, Radio, ChevronDown } from 'lucide-react';
import { feedPins } from './pins';
import PinArt from './PinArt';
import { SilentPreview } from './RecordingArt';
import { posterUrl, recordings } from './recordings';
import './studio.css';

export const featureIds = ['49ers', 'tend', 'spark'];

const tvTitles: Record<string, string[]> = {
  '49ers': ['Injury', 'report'],
  'family-os': ['Family', 'OS'],
};

export function StudioHeader({ onHome }: { onHome: () => void }) {
  return <header className="feed-header studio-header">
    <div className="studio-header-inner">
      <a className="station-brand" href="#top" onClick={onHome}>
        <span className="station-mark" aria-hidden="true"><i/><i/><i/><i/><i/></span>
        Andrew Oh
      </a>
      <nav aria-label="Main navigation">
        <a href="#work" className="station-guide-link" aria-label="Channel guide"><List size={17} aria-hidden="true"/><span>Channel guide</span><span className="compact-guide-label">Guide</span></a>
        <a className="station-resume" href="/resume">Résumé <ArrowUpRight size={15} aria-hidden="true"/></a>
      </nav>
    </div>
  </header>;
}

type StudioProps = {
  channelId: string;
  onTune: (id: string) => void;
  playing: boolean;
  onPlay: () => void;
  watching: boolean;
  onWatch: () => void;
  onEnded: () => void;
  onFailure: (id: string) => void;
  onDetail: (id: string) => void;
  onStory: () => void;
};

export default function Studio({ channelId, onTune, playing, onPlay, watching, onWatch, onEnded, onFailure, onDetail, onStory }: StudioProps) {
  const index = feedPins.findIndex(item => item.id === channelId);
  const channel = feedPins[index];
  const recording = recordings[channel.id];
  const playbackId = 'studio-' + channel.id;
  const fullScreen = !recording || channel.id === 'pokeread';
  const title = tvTitles[channel.id] ?? [channel.project];
  const featured = feedPins.filter(item => featureIds.includes(item.id));

  return <section className="studio" aria-labelledby="show-title" id="intro">
    <div className="studio-set">
      <div className="studio-copy">
        <p className="studio-byline">A project channel by Andrew Oh</p>
        <h1 id="show-title" tabIndex={-1}>After <em>Hours<span>.</span></em></h1>
        <p className="studio-introduction">Currently: Director of Data Science at Xero. I built Injury Report to settle a football argument, Tend to catch family follow-ups, and SPARK to find AI demos worth trying.</p>
        <div className="studio-actions">
          <a href="#work" className="studio-browse">Channel guide <ArrowDown size={16} aria-hidden="true"/></a>
          <button type="button" onClick={onStory}>My story <ArrowRight size={16} aria-hidden="true"/></button>
        </div>
      </div>
      <div className="studio-broadcast" data-demo-id={recording ? playbackId : undefined}>
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
          <div className={'studio-screen screen-' + channel.id} aria-label={'Channel ' + channel.number + ', ' + channel.project}>
            <div className={'studio-raster' + (fullScreen ? ' raster-full' : '')} key={channel.id}>
              {!fullScreen && <div className="tube-caption" aria-hidden="true">
                <span className="tube-channel">CH {channel.number}</span>
                <strong>{title.map(word => <span key={word}>{word}</span>)}</strong>
                <span className="tube-category">{channel.board}</span>
              </div>}
              {recording ? <div className="tube-footage" aria-hidden="true">
                <img src={posterUrl(recording)} alt="" width={recording.width} height={recording.height} draggable={false} />
                {playing && <SilentPreview key={watching ? 'lineup' : 'preview'} recording={recording} id={playbackId} onFailure={onFailure} onEnded={watching ? onEnded : undefined}/>}
              </div> : <div className="tube-still"><PinArt pin={channel} /></div>}
            </div>
            <button className="tube-project" type="button" onClick={() => onDetail(channel.id)} aria-label={'Open program: ' + channel.project}/>
          </div>
          <button className="studio-dial dial-tune" type="button" aria-label="Tune to the next channel" title="Next channel"
            onClick={() => onTune(feedPins[(index + 1) % feedPins.length].id)}/>
          <button className="studio-dial dial-play" type="button"
            aria-label={recording ? playing ? 'Pause television' : 'Play television' : 'Open program notes'}
            title={recording ? playing ? 'Pause' : 'Play' : 'Program notes'} onClick={recording ? onPlay : () => onDetail(channel.id)}/>
        </div>
        <div className="studio-readout">
          {recording && <button type="button" className="station-transport" onClick={onPlay} aria-label={(playing ? 'Pause' : 'Play') + ' featured demo'}>
            {playing ? <Pause size={12} fill="currentColor"/> : <Play size={12} fill="currentColor"/>}
          </button>}
          <label className="station-tuner">
            <select aria-label="Tune television to channel" value={channel.id} onChange={event => onTune(event.target.value)}>
              {feedPins.map(item => <option key={item.id} value={item.id}>CH {item.number} · {item.project}</option>)}
            </select>
            <ChevronDown size={12} aria-hidden="true"/>
          </label>
          <i aria-hidden="true"/>
          <button type="button" onClick={() => onDetail(channel.id)} className="station-project">Program notes <ArrowUpRight size={13}/></button>
        </div>
      </div>
    </div>
    <div className="studio-lineup">
      <div className="lineup-inner">
        <div className="lineup-label"><Radio size={19} strokeWidth={1.6} aria-hidden="true"/><span>Featured</span></div>
        <div className="lineup-buttons" role="group" aria-label="Choose a featured channel">
          {featured.map(entry => <button key={entry.id} type="button" aria-pressed={entry.id === channel.id} onClick={() => onTune(entry.id)}>
            <span className="lineup-number">{entry.number}</span><span>{entry.project}</span>
          </button>)}
        </div>
        <button className="lineup-watch" type="button" aria-pressed={watching} onClick={onWatch}>
          {watching ? <Pause size={13} fill="currentColor"/> : <Play size={13} fill="currentColor"/>}
          {watching ? 'Stop lineup' : 'Watch highlights'}
        </button>
      </div>
    </div>
  </section>;
}
