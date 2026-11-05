'use client';

/**
 * Adapted from Bencho GlassDock by Lorenzo Cabra (MIT).
 * https://github.com/cabralorenzo/bencho/blob/27ac3159201fa48eb16ef65faa5d8078963a9a61/blocks/dock/GlassDock.tsx
 * Keeps its measured pointer tracking, raised-cosine magnification and travelling tooltip.
 * Portfolio adaptation adds real anchors, section tracking and accessible motion controls.
 */
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { Blocks, ChartNoAxesCombined, Fingerprint, MessageCircle, Workflow } from 'lucide-react';
import './portfolio-dock.css';

const SECTIONS = [
  { id: 'work', label: 'Selected work', Icon: Blocks },
  { id: 'lab', label: 'Data lab', Icon: ChartNoAxesCombined },
  { id: 'ai-lab', label: 'AI lab', Icon: Workflow },
  { id: 'approach', label: 'My approach', Icon: Fingerprint },
  { id: 'contact', label: 'Let’s connect', Icon: MessageCircle },
];

export default function PortfolioDock({ paused = false, hidden = false }: { paused?: boolean; hidden?: boolean }) {
  const [pastHero, setPastHero] = useState(false);
  const [active, setActive] = useState('work');
  const [hover, setHover] = useState<number | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const [reduced, setReduced] = useState(false);
  const bar = useRef<HTMLElement>(null);
  const target = hover ?? focus;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const hero = document.getElementById('top');
    if (!hero) return;
    const heroObserver = new IntersectionObserver(([entry]) => {
      setPastHero(!entry.isIntersecting && entry.boundingClientRect.bottom <= 0);
    });
    heroObserver.observe(hero);

    const sections = SECTIONS.map(({ id }) => document.getElementById(id)).filter((section): section is HTMLElement => Boolean(section));
    const updateActive = () => {
      // The observer's bottom edge is 40% down the viewport; allow rounding.
      const threshold = window.innerHeight * 0.4 + 2;
      const reached = sections.filter(section => section.getBoundingClientRect().top <= threshold);
      setActive(reached.at(-1)?.id ?? SECTIONS[0].id);
    };
    let sectionObserver: IntersectionObserver | null = null;
    const observeSections = () => {
      sectionObserver?.disconnect();
      // IntersectionObserver percentage margins resolve against width, even
      // vertically. Pixel margins keep this band aligned with updateActive.
      const height = window.innerHeight;
      sectionObserver = new IntersectionObserver(updateActive, {
        rootMargin: `-${height * 0.2}px 0px -${height * 0.6}px 0px`,
      });
      sections.forEach(section => sectionObserver?.observe(section));
      updateActive();
    };
    observeSections();
    window.addEventListener('resize', observeSections);
    return () => {
      heroObserver.disconnect();
      sectionObserver?.disconnect();
      window.removeEventListener('resize', observeSections);
    };
  }, []);

  useEffect(() => {
    if (hidden || !pastHero) { setHover(null); setFocus(null); }
  }, [hidden, pastHero]);

  if (!pastHero || hidden) return null;

  return <nav
    ref={bar}
    className="portfolio-dock"
    aria-label="Jump to portfolio section"
    data-still={paused || reduced}
    onPointerMove={event => {
      // Touch retains ordinary link and scrolling behavior; only the mouse magnifies.
      if (event.pointerType !== 'mouse') return;
      const items = bar.current?.querySelectorAll<HTMLElement>('.portfolio-dock-item');
      if (!items?.length) return;
      let nearest = 0;
      let distance = Infinity;
      items.forEach((item, index) => {
        const bounds = item.getBoundingClientRect();
        const next = Math.abs(event.clientX - (bounds.left + bounds.width / 2));
        if (next < distance) { distance = next; nearest = index; }
      });
      setHover(nearest);
    }}
    onPointerLeave={() => setHover(null)}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocus(null); }}
  >
    {SECTIONS.map(({ id, label, Icon }, index) => {
      const distance = target === null ? Infinity : Math.abs(index - target);
      // Bencho's raised cosine lets neighboring glyphs rise with the focused item.
      const field = paused || reduced || distance > 2 ? 0 : (1 + Math.cos(Math.PI * distance / 3)) / 2;
      return <a
        key={id}
        href={`#${id}`}
        className="portfolio-dock-item"
        aria-label={label}
        aria-current={active === id ? 'location' : undefined}
        data-active={active === id}
        data-near={distance <= 1 ? distance : undefined}
        onFocus={() => { setFocus(index); setHover(null); }}
        onClick={() => setActive(id)}
      >
        <span className="portfolio-dock-glyph" style={{ transform: `translateY(${-7 * field}px) scale(${1 + 0.32 * field})` }}>
          <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
        </span>
        <span className="portfolio-dock-dot" aria-hidden="true" />
        <span className="portfolio-dock-mobile-label" aria-hidden="true">{['Work', 'Data', 'AI', 'Approach', 'Connect'][index]}</span>
      </a>;
    })}
    <DockTip bar={bar} at={target} />
  </nav>;
}

function DockTip({ bar, at }: { bar: RefObject<HTMLElement | null>; at: number | null }) {
  const [last, setLast] = useState(0);
  const [place, setPlace] = useState<{ x: number; width: number } | null>(null);
  const [ready, setReady] = useState(false);
  const word = useRef<HTMLSpanElement>(null);
  const index = at ?? last;

  useEffect(() => { if (at !== null) setLast(at); }, [at]);
  useLayoutEffect(() => {
    const nav = bar.current;
    const item = nav?.querySelectorAll<HTMLElement>('.portfolio-dock-item')[index];
    const text = word.current;
    if (!nav || !item || !text) return;
    const measure = () => {
      const width = Math.ceil(text.scrollWidth) + 24;
      setPlace({ x: item.offsetLeft + item.offsetWidth / 2 - width / 2, width });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [bar, index]);
  useLayoutEffect(() => {
    if (!place || ready) return;
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, [place, ready]);

  return <span
    className="portfolio-dock-tip"
    aria-hidden="true"
    data-visible={at !== null && Boolean(place)}
    data-ready={ready}
    style={place ? { width: place.width, transform: `translateX(${place.x}px)` } : undefined}
  ><span ref={word}>{SECTIONS[index].label}</span></span>;
}
