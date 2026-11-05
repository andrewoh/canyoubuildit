'use client';

import { useEffect, useRef } from 'react';
import './sculpture.css';

type Mode = 0 | 1 | 2;
type Vec3 = { x: number; y: number; z: number };
type Point2 = { x: number; y: number; z: number; scale: number };
type Edge = readonly [number, number];
const COUNT = 1080;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

// A fixed geometry means the visual is repeatable, including after hydration.
function makeShapes(): Vec3[][] {
  const sphere: Vec3[] = [];
  const terrain: Vec3[] = [];
  const cube: Vec3[] = [];
  for (let i = 0; i < COUNT; i++) {
    const y = 1 - (i / (COUNT - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = GOLDEN_ANGLE * i;
    const ripple = 1 + Math.sin(theta * 3 + y * 4) * 0.024;
    sphere.push({ x: Math.cos(theta) * radius * ripple, y: y * ripple, z: Math.sin(theta) * radius * ripple });

    const tx = ((i % 36) / 35 - .5) * 2.35;
    const tz = (Math.floor(i / 36) / 29 - .5) * 2;
    const ridge = Math.exp(-Math.pow(tx * .9 - tz * .5, 2) * 3) * .68;
    const waves = Math.sin(tx * 3 + tz * 2) * .19 + Math.cos(tz * 4) * .09;
    terrain.push({ x: tx, y: -ridge - waves + .28, z: tz });

    const face = Math.floor(i / 180);
    const cell = i % 180;
    const u = ((cell % 15) / 14 - .5) * 1.6;
    const v = (Math.floor(cell / 15) / 11 - .5) * 1.6;
    cube.push(face === 0 ? { x: -.8, y: u, z: v } : face === 1 ? { x: .8, y: u, z: v } : face === 2 ? { x: u, y: -.8, z: v } : face === 3 ? { x: u, y: .8, z: v } : face === 4 ? { x: u, y: v, z: -.8 } : { x: u, y: v, z: .8 });
  }
  return [sphere, terrain, cube];
}

function makeEdges(shapes: Vec3[][]): Edge[][] {
  const spherical: Edge[] = [];
  const seen = new Set<string>();
  // Only connect a few near neighbors: a legible mesh rather than a full graph.
  shapes[0].forEach((point, i) => {
    const nearest: { n: number; d: number }[] = [];
    shapes[0].forEach((other, j) => {
      if (i === j) return;
      const d = (point.x - other.x) ** 2 + (point.y - other.y) ** 2 + (point.z - other.z) ** 2;
      if (nearest.length < 3 || d < nearest[2].d) {
        nearest.push({ n: j, d });
        nearest.sort((a, b) => a.d - b.d);
        if (nearest.length > 3) nearest.pop();
      }
    });
    nearest.forEach(({ n }) => {
      const key = i < n ? `${i}:${n}` : `${n}:${i}`;
      if (!seen.has(key)) { seen.add(key); spherical.push([i, n]); }
    });
  });
  const terrain: Edge[] = [];
  const cube: Edge[] = [];
  for (let i = 0; i < COUNT; i++) {
    if (i % 36 < 35) terrain.push([i, i + 1]);
    if (i + 36 < COUNT) terrain.push([i, i + 36]);
    if (i % 15 < 14) cube.push([i, i + 1]);
    if (i % 180 < 165) cube.push([i, i + 15]);
  }
  return [spherical, terrain, cube];
}

export default function SignalSculpture({ mode, paused = false }: { mode: Mode; paused?: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef(mode);
  const pausedRef = useRef(paused);
  const updateRef = useRef<(() => void) | null>(null);

  useEffect(() => { modeRef.current = mode; updateRef.current?.(); }, [mode]);
  useEffect(() => { pausedRef.current = paused; updateRef.current?.(); }, [paused]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const ctx = context;
    const shapes = makeShapes();
    const meshes = makeEdges(shapes);
    const current = shapes[modeRef.current].map(point => ({ ...point }));
    const projected: Point2[] = Array.from({ length: COUNT }, () => ({ x: 0, y: 0, z: 0, scale: 1 }));
    const order = Array.from({ length: COUNT }, (_, i) => i);
    const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = reducedQuery.matches;
    let visible = true;
    let width = 0;
    let height = 0;
    let frame = 0;
    let disposed = false;
    let lastTime = 0;
    let rotation = -.3;
    let tilt = -.13;
    let userTilt = 0;
    let pointer: { id: number; x: number; y: number } | null = null;
    let morphing = false;
    let lastMode = modeRef.current;

    function draw(time = 0) {
      if (disposed) return;
      frame = 0;
      const canMove = !pausedRef.current && !reduced;
      const delta = Math.min(32, Math.max(0, time - lastTime || 16));
      lastTime = time;
      if (canMove && !pointer) rotation += delta * .000065;
      const activeMode = modeRef.current;
      const target = shapes[activeMode];
      const modeChanged = lastMode !== activeMode;
      if (modeChanged) { morphing = true; lastMode = activeMode; }
      const smoothing = canMove ? 1 - Math.exp(-delta / 160) : 1;
      let error = 0;
      for (let i = 0; i < COUNT; i++) {
        const p = current[i];
        const t = target[i];
        p.x += (t.x - p.x) * smoothing;
        p.y += (t.y - p.y) * smoothing;
        p.z += (t.z - p.z) * smoothing;
        error += Math.abs(t.x - p.x) + Math.abs(t.y - p.y) + Math.abs(t.z - p.z);
      }
      morphing = error > .12;
      const targetTilt = (activeMode === 1 ? -.62 : activeMode === 2 ? -.3 : -.13) + userTilt;
      tilt += (targetTilt - tilt) * smoothing;
      ctx.clearRect(0, 0, width, height);
      if (!width || !height) return;
      const size = Math.min(width * .37, height * .35);
      const centerX = width * .54;
      const centerY = height * .49;
      const cosineY = Math.cos(rotation);
      const sineY = Math.sin(rotation);
      const cosineX = Math.cos(tilt);
      const sineX = Math.sin(tilt);
      for (let i = 0; i < COUNT; i++) {
        const p = current[i];
        const x = p.x * cosineY + p.z * sineY;
        const z1 = -p.x * sineY + p.z * cosineY;
        const y = p.y * cosineX - z1 * sineX;
        const z = p.y * sineX + z1 * cosineX;
        const perspective = 3.7 / (3.7 + z);
        projected[i] = { x: centerX + x * size * perspective, y: centerY + y * size * perspective, z, scale: perspective };
      }

      // Subtle axis marks anchor the object in a technical working space.
      ctx.strokeStyle = 'rgba(181, 212, 147, .13)';
      ctx.lineWidth = .7;
      const cross = (x: number, y: number) => { ctx.beginPath(); ctx.moveTo(x - 4, y); ctx.lineTo(x + 4, y); ctx.moveTo(x, y - 4); ctx.lineTo(x, y + 4); ctx.stroke(); };
      cross(centerX - size * 1.23, centerY);
      cross(centerX + size * 1.23, centerY);
      cross(centerX, centerY - size * 1.19);
      cross(centerX, centerY + size * 1.19);

      // Fade the mesh during larger morphs so the transition stays readable.
      const meshWeight = Math.max(.05, 1 - error / 380);
      for (const [a, b] of meshes[activeMode]) {
        const pa = projected[a];
        const pb = projected[b];
        const depth = Math.max(0, Math.min(1, (1.2 - (pa.z + pb.z) / 2) / 2.4));
        const alpha = (.025 + depth * .15) * meshWeight;
        ctx.strokeStyle = `rgba(195, 234, 143, ${alpha})`;
        ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
      }
      order.sort((a, b) => projected[b].z - projected[a].z);
      for (const i of order) {
        const p = projected[i];
        const depth = Math.max(0, Math.min(1, (1.2 - p.z) / 2.4));
        const alpha = .15 + depth * .75;
        const radius = (.65 + depth * .75) * p.scale;
        ctx.fillStyle = `rgba(215, 253, 120, ${alpha})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.fill();
        if (i % 67 === 0 && depth > .6) {
          const halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 11);
          halo.addColorStop(0, 'rgba(215, 253, 120, .19)');
          halo.addColorStop(1, 'rgba(215, 253, 120, 0)');
          ctx.fillStyle = halo; ctx.fillRect(p.x - 11, p.y - 11, 22, 22);
          ctx.fillStyle = `rgba(239, 255, 202, ${alpha})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, radius * 1.4, 0, Math.PI * 2); ctx.fill();
        }
      }
      if (visible && !document.hidden && (canMove || morphing)) frame = window.requestAnimationFrame(draw);
    }

    function requestDraw() {
      if (disposed || !visible || document.hidden) return;
      if (!frame) frame = window.requestAnimationFrame(draw);
    }
    function stop() { if (frame) window.cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
    function resize() {
      const bounds = host!.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      requestDraw();
    }
    function visibilityChange() { if (document.hidden) stop(); else requestDraw(); }
    function preferenceChange() { reduced = reducedQuery.matches; stop(); requestDraw(); }
    function pointerDown(event: PointerEvent) {
      if (event.button !== 0) return;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
      canvas!.setPointerCapture(event.pointerId);
      canvas!.classList.add('sculpt-dragging');
    }
    function pointerMove(event: PointerEvent) {
      if (!pointer || pointer.id !== event.pointerId) return;
      rotation += (event.clientX - pointer.x) * .006;
      userTilt = Math.max(-.8, Math.min(.8, userTilt + (event.clientY - pointer.y) * .004));
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      requestDraw();
    }
    function pointerUp(event: PointerEvent) {
      if (!pointer || pointer.id !== event.pointerId) return;
      if (canvas!.hasPointerCapture(event.pointerId)) canvas!.releasePointerCapture(event.pointerId);
      pointer = null;
      canvas!.classList.remove('sculpt-dragging');
      requestDraw();
    }

    updateRef.current = () => { stop(); requestDraw(); };
    const resizer = new ResizeObserver(resize);
    resizer.observe(host);
    const observer = new IntersectionObserver(entries => {
      visible = entries[0]?.isIntersecting ?? false;
      if (visible) requestDraw(); else stop();
    }, { threshold: .01 });
    observer.observe(host);
    document.addEventListener('visibilitychange', visibilityChange);
    reducedQuery.addEventListener('change', preferenceChange);
    canvas.addEventListener('pointerdown', pointerDown);
    canvas.addEventListener('pointermove', pointerMove);
    canvas.addEventListener('pointerup', pointerUp);
    canvas.addEventListener('pointercancel', pointerUp);
    resize();
    return () => {
      disposed = true;
      updateRef.current = null;
      stop();
      resizer.disconnect();
      observer.disconnect();
      document.removeEventListener('visibilitychange', visibilityChange);
      reducedQuery.removeEventListener('change', preferenceChange);
      canvas.removeEventListener('pointerdown', pointerDown);
      canvas.removeEventListener('pointermove', pointerMove);
      canvas.removeEventListener('pointerup', pointerUp);
      canvas.removeEventListener('pointercancel', pointerUp);
    };
  }, []);

  return <div className="sculpt-host" ref={hostRef} aria-hidden="true"><canvas ref={canvasRef} className="sculpt-canvas" /></div>;
}
