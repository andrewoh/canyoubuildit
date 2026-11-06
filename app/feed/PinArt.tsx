import type { FeedPin } from './pins';
import { recordings } from './recordings';
import RecordingArt from './RecordingArt';
import LifePhoto from './LifePhoto';
import './pin-art.css';

type Props = {
  pin: FeedPin;
  playing?: boolean;
  detail?: boolean;
  onFailure?: (id: string) => void;
};

export default function PinArt({ pin, playing, detail, onFailure }: Props) {
  const recording = recordings[pin.id];
  if (recording) return <RecordingArt recording={recording} id={pin.id} playing={playing} detail={detail} onFailure={onFailure} />;
  if (pin.art === 'bio' || pin.art === 'career') return <LifePhoto slot={pin.art === 'bio' ? 'portrait' : 'career'} />;
  if (pin.art === 'economics') return <figure className="pin-art still-dropalpha" role="img" aria-label={pin.alt}>
    <span>DropAlpha · Example data</span>
    <img src="/feed/media/dropalpha-native.webp" width="390" height="570" alt="" loading="lazy" decoding="async" draggable="false" />
  </figure>;
  return <figure className="pin-art cover-wardrobe" role="img" aria-label={pin.alt}>
    <img className="wardrobe-image" src="/feed/linen-400.webp" srcSet="/feed/linen-400.webp 400w, /feed/linen-780.webp 780w"
      sizes="auto, (max-width:720px) 50vw, (max-width:1080px) 33vw, 360px"
      alt="" loading="lazy" decoding="async" draggable="false" />
  </figure>;
}
