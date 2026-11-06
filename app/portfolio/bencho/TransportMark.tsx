// Play/pause geometry adapted from Lorenzo Cabra's Bencho StepPlayer (MIT).
// The two paths keep the same vertices so CSS can interpolate their shape.
const marks = {
  play: ['M6.5 4L13.25 8L13.25 16L6.5 20Z', 'M13.25 8L20 12L20 12L13.25 16Z'],
  pause: ['M6 4L10 4L10 20L6 20Z', 'M14 4L18 4L18 20L14 20Z'],
};

export default function TransportMark({ playing, size = 15 }: { playing: boolean; size?: number }) {
  return <svg className="media-mark" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    {marks[playing ? 'pause' : 'play'].map((d, i) => <path key={i} d={d} />)}
  </svg>;
}
