"use client";

import Link from "next/link";
import type { CSSProperties, MouseEvent as ReactMouseEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import wardrobeData from "./wardrobe-data.json";

type WardrobeItem = {
  id: string;
  name: string;
  part: string;
  color: string;
  secondaryColor: string | null;
  palette: string[];
  tags: string[];
  image: string;
  thumbnail: string;
  modeledImage: string;
  importJobId: string;
};

type FilterId = "all" | "layers" | "tops" | "bottoms" | "shoes" | "accessories";

const items = wardrobeData as WardrobeItem[];

const filters: Array<{ id: FilterId; label: string }> = [
  { id: "all", label: "All pieces" },
  { id: "layers", label: "Layers" },
  { id: "tops", label: "Tops" },
  { id: "bottoms", label: "Bottoms" },
  { id: "shoes", label: "Shoes" },
  { id: "accessories", label: "Accessories" }
];

function categoryForPart(part: string) {
  if (part === "wholebody_up") return { id: "layers" as const, label: "Layer" };
  if (part === "upperbody") return { id: "tops" as const, label: "Top" };
  if (part === "lowerbody") return { id: "bottoms" as const, label: "Bottom" };
  if (part === "shoes") return { id: "shoes" as const, label: "Shoes" };
  return { id: "accessories" as const, label: "Accessory" };
}

function displayTag(tag: string) {
  return tag.replaceAll("-", " ");
}

export default function WardrobePage() {
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  const visibleItems = useMemo(
    () =>
      activeFilter === "all"
        ? items
        : items.filter((item) => categoryForPart(item.part).id === activeFilter),
    [activeFilter]
  );

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [selectedId]
  );

  useEffect(() => {
    if (!selectedItem) return;

    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedId(null);
      if (event.key === "Tab") {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = priorOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.requestAnimationFrame(() => lastTriggerRef.current?.focus());
    };
  }, [selectedItem]);

  function openViewer(itemId: string, event: ReactMouseEvent<HTMLButtonElement>) {
    lastTriggerRef.current = event.currentTarget;
    setSelectedId(itemId);
  }

  function closeViewer() {
    setSelectedId(null);
  }

  return (
    <main className="wardrobe-page">
      <header className="wardrobe-header">
        <div className="wardrobe-utility">
          <Link href="/" className="wardrobe-home-link">
            canyoubuildit.com
          </Link>
          <span aria-hidden="true">/</span>
          <span>Personal index</span>
        </div>

        <div className="wardrobe-title-row">
          <div>
            <p className="wardrobe-kicker">Collected &amp; cataloged</p>
            <h1>Wardrobe</h1>
          </div>
          <p className="wardrobe-tally" aria-label={`${items.length} pieces in the wardrobe`}>
            <strong>{String(items.length).padStart(2, "0")}</strong>
            <span>pieces</span>
          </p>
        </div>
      </header>

      <section className="wardrobe-catalog" aria-labelledby="wardrobe-catalog-heading">
        <div className="wardrobe-controls">
          <h2 id="wardrobe-catalog-heading" className="wardrobe-sr-only">
            Wardrobe catalog
          </h2>
          <nav className="wardrobe-filters" aria-label="Filter wardrobe by category">
            {filters.map((filter) => {
              const count =
                filter.id === "all"
                  ? items.length
                  : items.filter((item) => categoryForPart(item.part).id === filter.id).length;

              return (
                <button
                  key={filter.id}
                  type="button"
                  className={activeFilter === filter.id ? "is-active" : ""}
                  aria-pressed={activeFilter === filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                >
                  {filter.label}
                  <span>{String(count).padStart(2, "0")}</span>
                </button>
              );
            })}
          </nav>
          <p className="wardrobe-result-count" aria-live="polite">
            Showing {visibleItems.length} {visibleItems.length === 1 ? "piece" : "pieces"}
          </p>
        </div>

        <div className="wardrobe-grid">
          {visibleItems.map((item, index) => {
            const category = categoryForPart(item.part);
            return (
              <article
                className="wardrobe-item"
                key={`${activeFilter}-${item.id}`}
                style={{ "--item-index": index } as CSSProperties}
              >
                <button
                  type="button"
                  className="wardrobe-item-button"
                  onClick={(event) => openViewer(item.id, event)}
                  aria-haspopup="dialog"
                  aria-controls="wardrobe-viewer"
                  aria-label={`View ${item.name} details`}
                >
                  <span className="wardrobe-image-stage">
                    <img src={item.thumbnail} alt="" loading="lazy" />
                    <span className="wardrobe-view-cue" aria-hidden="true">
                      View
                    </span>
                  </span>
                  <span className="wardrobe-item-caption">
                    <span>
                      <b>{item.name}</b>
                      <small>{category.label}</small>
                    </span>
                    <i style={{ backgroundColor: item.color }} aria-hidden="true" />
                  </span>
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {selectedItem ? (
        <div
          className="wardrobe-viewer-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeViewer();
          }}
        >
          <section
            id="wardrobe-viewer"
            className="wardrobe-viewer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wardrobe-viewer-title"
          >
            <button
              ref={closeButtonRef}
              type="button"
              className="wardrobe-viewer-close"
              onClick={closeViewer}
              aria-label="Close item details"
            >
              <span aria-hidden="true">×</span>
            </button>

            <div className="wardrobe-modeled-stage">
              <img
                className="wardrobe-modeled-image"
                src={selectedItem.modeledImage}
                alt={`Modeled view of ${selectedItem.name}`}
              />
              <div className="wardrobe-floating-cutout">
                <img src={selectedItem.image} alt={`${selectedItem.name} garment cutout`} />
              </div>
            </div>

            <div className="wardrobe-viewer-copy">
              <p className="wardrobe-viewer-number">
                Piece {String(items.findIndex((item) => item.id === selectedItem.id) + 1).padStart(2, "0")}
              </p>
              <h2 id="wardrobe-viewer-title">{selectedItem.name}</h2>

              <dl className="wardrobe-details">
                <div>
                  <dt>Category</dt>
                  <dd>{categoryForPart(selectedItem.part).label}</dd>
                </div>
                <div>
                  <dt>Colors</dt>
                  <dd className="wardrobe-color-list">
                    {selectedItem.palette.map((color, index) => (
                      <span key={`${color}-${index}`}>
                        <i style={{ backgroundColor: color }} aria-hidden="true" />
                        {color.toUpperCase()}
                      </span>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt>Details</dt>
                  <dd className="wardrobe-tags">
                    {selectedItem.tags.map((tag) => (
                      <span key={tag}>{displayTag(tag)}</span>
                    ))}
                  </dd>
                </div>
              </dl>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
