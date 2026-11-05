"use client";

/*
 * Adapted from Bencho's MagneticSelect by Lorenzo Cabra (MIT).
 * Source: https://github.com/cabralorenzo/bencho/blob/27ac3159201fa48eb16ef65faa5d8078963a9a61/blocks/magnet-select/MagneticSelect.tsx
 * Retains its distance field, outward push, stagger, and separate X/Y springs.
 * This adaptation keeps labels and hit targets still while the surfaces settle.
 * Copyright (c) 2026 Lorenzo Cabra. See the adjacent LICENSE file.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import "./magnetic-filters.css";

type Point = { x: number; y: number; width: number };

export type MagneticFiltersProps = {
  items: { label: string; count: string }[];
  value: string;
  onChange: (value: string) => void;
  paused?: boolean;
};

const SPREAD = 2.8;
const GROW_X = 1.045;
const GROW_Y = 1.1;
const DAMPING_RATIO = 0.9 - 0.48 * 0.55;

const spring = (stiffness: number, mass: number) => ({
  type: "spring" as const,
  stiffness,
  damping: 2 * Math.sqrt(stiffness * mass) * DAMPING_RATIO,
  mass,
});

export function MagneticFilters({
  items,
  value,
  onChange,
  paused = false,
}: MagneticFiltersProps) {
  const root = useRef<HTMLDivElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [measured, setMeasured] = useState(false);
  const reducedMotion = useReducedMotion();
  // SSR and the first client render both use identity transforms. Motion's
  // server/client float formatting differs for fractional spring targets.
  // Delay targets and preference-dependent markup until the DOM is measured.
  const still = !measured || paused || !!reducedMotion;
  const selected = items.findIndex((item) => item.label === value);
  const itemKey = items.map((item) => `${item.label}:${item.count}`).join("\0");

  useEffect(() => {
    const element = root.current;
    if (!element) return;

    const measure = () => {
      const next = Array.from(
        element.querySelectorAll<HTMLButtonElement>(".bencho-filter"),
        (button) => ({
          x: button.offsetLeft + button.offsetWidth / 2,
          y: button.offsetTop + button.offsetHeight / 2,
          width: button.offsetWidth,
        }),
      );
      setPoints((previous) =>
        previous.length === next.length &&
        next.every((point, i) =>
          point.x === previous[i].x &&
          point.y === previous[i].y &&
          point.width === previous[i].width,
        )
          ? previous
          : next,
      );
    };

    measure();
    setMeasured(true);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    element.querySelectorAll(".bencho-filter").forEach((button) => observer.observe(button));
    return () => observer.disconnect();
  }, [itemKey]);

  const origin = points[selected];

  return (
    <div
      ref={root}
      className="bencho-filters"
      role="group"
      aria-label="Filter selected projects"
      data-still={still || undefined}
    >
      {items.map((item, index) => {
        const active = index === selected;
        const point = points[index];
        const dx = point && origin ? point.x - origin.x : index - selected;
        const dy = point && origin ? point.y - origin.y : 0;
        const distance = Math.hypot(dx, dy);
        const pitch = point && origin ? (point.width + origin.width) / 2 + 12 : 1;
        const far = selected < 0 ? 0 : distance / pitch;
        const fall = active || selected < 0 ? 0 : Math.exp(-(far - 1) / SPREAD);
        // Constant outward push preserves the spacing between neighbors on a ray.
        const room = ((origin?.width ?? 100) * (GROW_X - 1)) / 2;
        const push = active || selected < 0 ? 0 : Math.min(4, room + 1.4);
        const ux = distance ? dx / distance : 0;
        const uy = distance ? dy / distance : 0;
        const stiffness = 300 + 280 * (1 - Math.min(far, 3) / 4);
        const delay = far * 0.022;

        return (
          <button
            key={item.label}
            type="button"
            className="bencho-filter"
            aria-pressed={active}
            onClick={() => onChange(item.label)}
          >
            <motion.span
              className="bencho-filter-surface"
              aria-hidden="true"
              initial={false}
              animate={{
                x: still ? 0 : ux * push,
                y: still ? 0 : uy * push,
                scaleX: still ? 1 : active ? GROW_X : 1 - 0.012 * fall,
                scaleY: still ? 1 : active ? GROW_Y : 1 - 0.025 * fall,
                rotate: still ? 0 : ux * 0.7 * fall,
              }}
              transition={still ? { duration: 0 } : {
                x: { ...spring(stiffness, 0.9), delay },
                y: { ...spring(stiffness, 0.9), delay },
                scaleX: { ...spring(stiffness * 1.24, 0.8), delay },
                scaleY: { ...spring(stiffness * 0.86, 0.95), delay },
                rotate: { ...spring(stiffness * 0.8, 1), delay },
              }}
            />
            <span className="bencho-filter-label">{item.label}</span>
            <span className="bencho-filter-count">{item.count}</span>
          </button>
        );
      })}
    </div>
  );
}
