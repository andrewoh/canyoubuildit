'use client';

// Adapted from Bencho Compare, copyright (c) 2026 Lorenzo Cabra (MIT).
// Source: cabralorenzo/bencho@27ac3159201fa48eb16ef65faa5d8078963a9a61
// blocks/image-compare/Compare.tsx. Full permission notice: ./LICENSE.
// Responsive sizing, native range input, preference handling and portfolio
// images replace the fixed-size before/after demonstration.
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import './wardrobe-compare.css';

const ASSET = '/wardrobe/items/import-e73c37d8-319e-4e90-b6cb-b738d8b193f5';
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

export default function WardrobeCompare({ paused = false }: { paused?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 400, height: 244 });
  const [position, setPosition] = useState(.5);
  const [bend, setBend] = useState(0);
  const [held, setHeld] = useState(false);
  const [reduced, setReduced] = useState(true);
  const current = useRef(.5);
  const target = useRef<number | null>(null);
  const ends = useRef({ x: .5, velocity: 0 });
  const frame = useRef(0);
  const drag = useRef<{ velocity: number; time: number; last: number } | null>(null);
  const motionEnabled = useRef(false);
  const width = useRef(size.width);
  const still = paused || reduced;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!box.current) return;
    const observer = new ResizeObserver(([entry]) => {
      width.current = entry.contentRect.width;
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(box.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    motionEnabled.current = !still;
    if (still) {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      target.current = null;
      ends.current = { x: current.current, velocity: 0 };
      setBend(0);
    }
    return () => cancelAnimationFrame(frame.current);
  }, [still]);

  // Bencho's two coupled motions: a flick glides the split while the ends of
  // the divider lag on a damped spring. The clip and divider share one curve.
  function animate() {
    if (frame.current || !motionEnabled.current) return;
    let previous = performance.now();
    const tick = (time: number) => {
      const delta = Math.min(.033, (time - previous) / 1000);
      previous = time;
      if (target.current !== null) {
        current.current += (target.current - current.current) * (1 - Math.pow(.0004, delta));
        if (Math.abs(target.current - current.current) < .0005) {
          current.current = target.current;
          target.current = null;
        }
      }
      const edge = ends.current;
      edge.velocity += ((current.current - edge.x) * 620 - edge.velocity * 44) * delta;
      edge.x += edge.velocity * delta;
      setPosition(current.current);
      setBend(clamp((current.current - edge.x) * width.current * .5, -9, 9));
      if (target.current === null && Math.abs(current.current - edge.x) < .0006 && Math.abs(edge.velocity) < .002) {
        edge.x = current.current;
        edge.velocity = 0;
        setBend(0);
        frame.current = 0;
      } else frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  }

  function place(value: number) {
    target.current = null;
    current.current = value;
    setPosition(value);
    if (!motionEnabled.current) {
      ends.current = { x: value, velocity: 0 };
      setBend(0);
    } else animate();
  }

  function release(cancelled = false) {
    const gesture = drag.current;
    drag.current = null;
    setHeld(false);
    if (!cancelled && motionEnabled.current && gesture && performance.now() - gesture.time < 90 && Math.abs(gesture.velocity) > .0025) {
      target.current = gesture.velocity > 0 ? 1 : 0;
      animate();
    }
  }

  const x = position * size.width;
  const edge = x - bend;
  const curve = `M ${edge.toFixed(2)} 0 Q ${(x + bend).toFixed(2)} ${size.height / 2} ${edge.toFixed(2)} ${size.height}`;
  const cut = `path("M 0 0 L ${edge.toFixed(2)} 0 Q ${(x + bend).toFixed(2)} ${size.height / 2} ${edge.toFixed(2)} ${size.height} L 0 ${size.height} Z")`;

  return <div className="wardrobe-comparison">
    <div ref={box} className="wardrobe-compare" data-held={held || undefined} data-still={still || undefined} style={{ '--compare-position': position } as CSSProperties}>
      <img className="wardrobe-compare-image" src={`${ASSET}-modeled.webp`} alt="Modeled reference of the gray catalog blazer" draggable={false}/>
      <div className="wardrobe-compare-catalog" style={{ clipPath: cut }}>
        <img className="wardrobe-compare-image" src={`${ASSET}-garment.webp`} alt="Gray blazer catalog cutout" draggable={false}/>
      </div>
      <span className="wardrobe-compare-label">Catalog</span>
      <span className="wardrobe-compare-label wardrobe-compare-label-right">Modeled</span>
      <svg className="wardrobe-compare-line" width="100%" height="100%" viewBox={`0 0 ${size.width} ${size.height}`} aria-hidden="true"><path d={curve}/></svg>
      <span className="wardrobe-compare-grip" style={{ left: `${position * 100}%` }} aria-hidden="true"><svg width="18" height="12" viewBox="0 0 18 12"><path d="M6 2 2 6l4 4M12 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
      <input className="wardrobe-compare-range" type="range" min="0" max="1000" step="10" value={Math.round(position * 1000)} aria-label="Compare catalog garment and modeled reference" aria-valuetext={`${Math.round(position * 100)}% catalog, ${Math.round((1 - position) * 100)}% modeled reference`} onPointerDown={() => { drag.current = { velocity: 0, time: performance.now(), last: current.current }; setHeld(true); }} onPointerUp={() => release()} onPointerCancel={() => release(true)} onBlur={() => release(true)} onChange={event => {
        const value = Number(event.target.value) / 1000;
        const gesture = drag.current;
        if (gesture) {
          const time = performance.now();
          gesture.velocity = (value - gesture.last) / Math.max(1, time - gesture.time);
          gesture.time = time;
          gesture.last = value;
        }
        place(value);
      }}/>
    </div>
    <p className="wardrobe-compare-hint">Drag to explore two views of the same item</p>
  </div>;
}
