'use client';

// Adapted from Bencho Tilt by Lorenzo Cabra (MIT). See ./LICENSE and README.md.
import { useEffect, useRef, useState, type ReactNode, type PointerEvent } from 'react';
import { useReducedMotion } from 'framer-motion';
import './project-tilt.css';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// Bencho's frame-normalized spring parks as soon as the surface settles.
function useSurfaceSpring(target: number, instant: boolean) {
  const [at, setAt] = useState(target);
  const current = useRef(target);
  const velocity = useRef(0);
  useEffect(() => {
    if (instant) {
      current.current = target;
      velocity.current = 0;
      setAt(target);
      return;
    }
    let frame = 0;
    let previous = 0;
    const tick = (time: number) => {
      const dt = previous ? clamp((time - previous) / 16.67, 0, 2.5) : 1;
      previous = time;
      velocity.current += (target - current.current) * .16 * dt;
      velocity.current *= Math.pow(.72, dt);
      current.current += velocity.current * dt;
      if (Math.abs(target - current.current) < .02 && Math.abs(velocity.current) < .02) {
        current.current = target;
        velocity.current = 0;
        setAt(target);
        return;
      }
      setAt(current.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, instant]);
  return at;
}

export default function ProjectTilt({ children, paused = false, disabled = false }: {
  children: ReactNode; paused?: boolean; disabled?: boolean;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const reducedMotion = useReducedMotion();
  const still = !!reducedMotion || paused || disabled;
  const active = hovered && !still;
  const x = useSurfaceSpring(active ? pointer.x : 0, still);
  const y = useSurfaceSpring(active ? pointer.y : 0, still);
  const light = useSurfaceSpring(active ? 1 : 0, still);
  const px = ((x + 1) / 2) * 100;
  const py = ((y + 1) / 2) * 100;
  function track(event: PointerEvent<HTMLDivElement>) {
    if (still || event.pointerType !== 'mouse' || !frame.current) return;
    const box = frame.current.getBoundingClientRect();
    setPointer({
      x: clamp(((event.clientX - box.left) / box.width) * 2 - 1, -1, 1),
      y: clamp(((event.clientY - box.top) / box.height) * 2 - 1, -1, 1),
    });
    setHovered(true);
  }
  return <div className="project-tilt" ref={frame} onPointerMove={track}
    onPointerLeave={() => setHovered(false)} onPointerCancel={() => setHovered(false)}>
    <div className="project-tilt-surface" style={{
      transform: still ? 'none' : `translateZ(${-14 * light}px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`,
      boxShadow: `0 ${mix(16, 8, light)}px ${mix(36, 20, light)}px -16px rgba(15, 23, 12, .26)`,
    }}>
      {children}
      <span className="project-tilt-sheen" aria-hidden="true" style={{
        backgroundImage: `radial-gradient(42% 34% at ${px}% ${py}%, rgba(9, 14, 8, ${.18 * light}), transparent), radial-gradient(52% 42% at ${100 - px}% ${100 - py}%, rgba(225, 255, 178, ${.18 * light}), transparent)`,
      }}/>
    </div>
  </div>;
}
