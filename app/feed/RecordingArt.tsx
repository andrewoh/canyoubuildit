'use client';

import { useEffect, useRef, useState } from 'react';
import { movieUrl, posterUrl, type Recording } from './recordings';
import './recording-art.css';

type Props = {
  recording: Recording;
  id: string;
  playing?: boolean;
  detail?: boolean;
  onFailure?: (id: string) => void;
};

function SilentPreview({ recording, id, onFailure }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let cancelled = false;
    video.muted = true;
    video.play().catch(() => { if (!cancelled) onFailure?.(id); });
    return () => {
      cancelled = true;
      video.pause();
    };
  }, [id, onFailure]);

  return <video ref={ref} src={movieUrl(recording)} muted loop playsInline preload="none"
    className="recording-motion" data-ready={ready || undefined} aria-hidden="true"
    onPlaying={() => setReady(true)}
    onTimeUpdate={event => {
      const video = event.currentTarget;
      if (video.duration > 0) video.closest<HTMLElement>('.feed-media-stage')?.style.setProperty('--clip-progress', (video.currentTime / video.duration * 100) + '%');
    }}
    onError={() => onFailure?.(id)} />;
}

export default function RecordingArt({ recording, id, playing, detail, onFailure }: Props) {
  const label = recording.description;
  if (detail) {
    return <figure className="recording-detail">
      <video controls playsInline muted preload="none" poster={posterUrl(recording)}
        width={recording.width} height={recording.height} aria-label={label} src={movieUrl(recording)} />
      <figcaption>{recording.label} · {recording.seconds}s</figcaption>
    </figure>;
  }
  return <figure className={'pin-art recording-art film-' + id} role="img" aria-label={label}>
    {id === '49ers' && <div className="film-sports-mast" aria-hidden="true">
      <b>49ers</b><span>Injury study<br/>2017–2025</span>
    </div>}
    <div className="recording-window">
      <img className="recording-poster" alt="" src={posterUrl(recording)}
        width={recording.width} height={recording.height} loading="lazy" decoding="async" draggable="false" />
      {playing && <SilentPreview recording={recording} id={id} onFailure={onFailure} />}
    </div>
  </figure>;
}
