'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

const preferenceKey = 'andrew-oh.feed-autoplay.v1';
const settleMs = 175;
const minimumVisible = 0.4;
const tileSelector = '.feed-tile[data-demo-id]';

type Connection = EventTarget & { saveData?: boolean };
type Selection = { id: string; scope: string; manual: boolean };
type Controls = { toggle: (id: string) => void; failed: (id: string) => void; stop: () => void };

export default function useFeedPreviews(
  grid: RefObject<HTMLDivElement | null>,
  visibleKey: string,
  suspended: boolean,
) {
  const [enabled, setEnabled] = useState(true);
  const [automaticAllowed, setAllowed] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const controls = useRef<Controls | null>(null);
  const rejected = useRef(new Set<string>());
  const autoOn = enabled && automaticAllowed;

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    const syncCapabilities = () => setAllowed(Boolean(media) && !media.matches && !connection?.saveData && 'IntersectionObserver' in window);
    const syncPreference = () => {
      try { setEnabled(localStorage.getItem(preferenceKey) !== 'off'); } catch { /* Use this visit's setting. */ }
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === preferenceKey || event.key === null) syncPreference();
    };
    syncCapabilities();
    syncPreference();
    media?.addEventListener?.('change', syncCapabilities);
    connection?.addEventListener?.('change', syncCapabilities);
    window.addEventListener('storage', onStorage);
    return () => {
      media?.removeEventListener?.('change', syncCapabilities);
      connection?.removeEventListener?.('change', syncCapabilities);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    const element = grid.current;
    setSelection(null);
    if (!element || suspended) return;

    const tiles = new Map<string, HTMLElement>();
    element.querySelectorAll<HTMLElement>(tileSelector).forEach(tile => {
      const cover = tile.querySelector<HTMLElement>('.feed-cover') ?? tile;
      tiles.set(tile.dataset.demoId!, cover);
    });
    if (tiles.size === 0) return;

    let active: string | null = null;
    let manual: string | null = null;
    let paused: string | null = null;
    let hover: string | null = null;
    let focus: string | null = null;
    let timer = 0;
    let disposed = false;
    const header = document.querySelector('.feed-header');
    const tileId = (target: EventTarget | null) => target instanceof Element
      ? target.closest<HTMLElement>(tileSelector)?.dataset.demoId ?? null : null;

    focus = tileId(document.activeElement);
    if (!focus && window.matchMedia?.('(hover: hover) and (pointer: fine)').matches) {
      hover = tileId(element.querySelector(tileSelector + ':hover'));
    }

    function select(id: string | null) {
      if (active === id) return;
      active = id;
      setSelection(id ? { id, scope: visibleKey, manual: manual === id } : null);
    }

    function stop() {
      window.clearTimeout(timer);
      manual = null;
      select(null);
    }

    function choose() {
      if (document.hidden) { stop(); return; }
      const top = Math.max(0, header?.getBoundingClientRect().bottom ?? 0);
      const centerY = (window.innerHeight + top) / 2;
      const centerX = window.innerWidth / 2;
      const eligible = new Set<string>();
      let nearest: string | null = null;
      let best = Infinity;
      let manualVisible = false;
      for (const [id, cover] of tiles) {
        const r = cover.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        const height = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, top));
        const width = Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0));
        const fraction = height * width / (r.height * r.width);
        if (manual === id && fraction > 0) manualVisible = true;
        if (fraction < minimumVisible) continue;
        eligible.add(id);
        const distance = Math.hypot(r.left + r.width / 2 - centerX, r.top + r.height / 2 - centerY);
        if (distance < best) { nearest = id; best = distance; }
      }
      if (manual && manualVisible) { select(manual); return; }
      manual = null;
      if (paused && !eligible.has(paused)) paused = null;
      const candidate = [hover, focus, nearest].find(id => id !== null && eligible.has(id));
      select(autoOn && candidate && candidate !== paused && !rejected.current.has(candidate) ? candidate : null);
    }

    // Scrolling past several clips must not fetch each one on the way.
    function schedule() {
      window.clearTimeout(timer);
      if (!disposed && !document.hidden && (autoOn || manual)) timer = window.setTimeout(choose, settleMs);
    }
    function pointerOver(event: PointerEvent) {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      hover = tileId(event.target);
      schedule();
    }
    function pointerLeave() { hover = null; schedule(); }
    function focusChanged(event: FocusEvent) {
      focus = tileId(event.type === 'focusin' ? event.target : event.relatedTarget);
      hover = null;
      schedule();
    }
    function visibilityChanged() { if (document.hidden) stop(); else schedule(); }

    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
      if (disposed) return;
      for (const entry of entries) {
        if (active && tiles.get(active) === entry.target &&
          (!entry.isIntersecting || (manual !== active && entry.intersectionRatio < minimumVisible))) stop();
      }
      schedule();
    }, { threshold: [0, minimumVisible] }) : null;
    tiles.forEach(cover => observer?.observe(cover));

    controls.current = {
      toggle(id) {
        if (!tiles.has(id) || document.hidden) return;
        if (active === id) { paused = id; stop(); return; }
        rejected.current.delete(id);
        paused = null;
        manual = id;
        choose();
      },
      failed(id) {
        if (active !== id) return;
        rejected.current.add(id);
        stop();
      },
      stop,
    };
    element.addEventListener('pointerover', pointerOver);
    element.addEventListener('pointerleave', pointerLeave);
    element.addEventListener('focusin', focusChanged);
    element.addEventListener('focusout', focusChanged);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('visibilitychange', visibilityChanged);
    schedule();

    return () => {
      disposed = true;
      controls.current = null;
      window.clearTimeout(timer);
      observer?.disconnect();
      element.removeEventListener('pointerover', pointerOver);
      element.removeEventListener('pointerleave', pointerLeave);
      element.removeEventListener('focusin', focusChanged);
      element.removeEventListener('focusout', focusChanged);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('visibilitychange', visibilityChanged);
    };
  }, [grid, visibleKey, suspended, autoOn]);

  const toggleAuto = useCallback(() => {
    if (!automaticAllowed) return;
    if (autoOn) controls.current?.stop();
    setEnabled(!enabled);
    try { localStorage.setItem(preferenceKey, enabled ? 'off' : 'on'); } catch { /* Available for this visit. */ }
  }, [automaticAllowed, autoOn, enabled]);
  const togglePin = useCallback((id: string) => controls.current?.toggle(id), []);
  const playbackFailed = useCallback((id: string) => controls.current?.failed(id), []);
  const activeId = !suspended && selection?.scope === visibleKey && (selection.manual || autoOn) ? selection.id : null;
  return { activeId, autoOn, automaticAllowed, toggleAuto, togglePin, playbackFailed };
}
