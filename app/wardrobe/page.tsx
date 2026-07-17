"use client";

import Link from "next/link";
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import recommendationsData from "./recommendations-data.json";
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

type OwnedOutfit = {
  id?: string;
  name?: string;
  occasion?: string | string[];
  reason?: string;
  garmentIds?: string[];
  image?: string;
};

type ShopItem = {
  id?: string;
  name?: string;
  brand?: string;
  category?: string;
  color?: string;
  price?: string | number;
  priceText?: string;
  url?: string;
  productUrl?: string;
  imageUrl?: string;
};

type MixedOutfit = {
  id?: string;
  name?: string;
  reason?: string;
  ownedGarmentIds?: string[];
  shopItems?: ShopItem[];
};

type RecommendationsData = {
  version: number;
  ownedOutfits: OwnedOutfit[];
  mixedOutfits: MixedOutfit[];
};

type FilterId = "all" | "layers" | "tops" | "bottoms" | "shoes" | "accessories";
type ViewId = "wardrobe" | "outfits";

const items = wardrobeData as WardrobeItem[];
const recommendations = recommendationsData as RecommendationsData;

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

function safeShopUrl(value?: string) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function formatShopPrice(item: ShopItem) {
  const value = item.price ?? item.priceText;
  if (typeof value === "number") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
  }
  return value || "View current price";
}

function ShopItemImage({ item }: { item: ShopItem }) {
  const [failed, setFailed] = useState(false);

  return (
    <span className="wardrobe-shop-image">
      {!failed && item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{item.category || "Item"}</span>
      )}
      <small>Online</small>
    </span>
  );
}

function OwnedGarments({
  garmentIds,
  itemMap,
  compact = false,
  onOpen
}: {
  garmentIds: string[];
  itemMap: Map<string, WardrobeItem>;
  compact?: boolean;
  onOpen: (itemId: string, event: ReactMouseEvent<HTMLButtonElement>) => void;
}) {
  const garments = garmentIds.map((id) => itemMap.get(id)).filter((item): item is WardrobeItem => Boolean(item));

  if (!garments.length) {
    return <p className="wardrobe-outfit-missing">Wardrobe pieces are being matched.</p>;
  }

  return (
    <div className={`wardrobe-outfit-garments${compact ? " is-compact" : ""}`}>
      {garments.map((item) => (
        <button
          type="button"
          className="wardrobe-outfit-garment"
          key={item.id}
          onClick={(event) => onOpen(item.id, event)}
          aria-haspopup="dialog"
          aria-controls="wardrobe-viewer"
          aria-label={`View ${item.name} details`}
        >
          <span className="wardrobe-outfit-garment-image">
            <img src={item.thumbnail || item.image} alt="" loading="lazy" />
          </span>
          <span>{item.name}</span>
        </button>
      ))}
    </div>
  );
}

function OwnedOutfitEntry({
  outfit,
  index,
  itemMap,
  onOpen
}: {
  outfit: OwnedOutfit;
  index: number;
  itemMap: Map<string, WardrobeItem>;
  onOpen: (itemId: string, event: ReactMouseEvent<HTMLButtonElement>) => void;
}) {
  const garmentIds = Array.isArray(outfit.garmentIds) ? outfit.garmentIds : [];
  const garments = garmentIds.map((id) => itemMap.get(id)).filter((item): item is WardrobeItem => Boolean(item)).slice(0, 6);
  const occasions = Array.isArray(outfit.occasion)
    ? outfit.occasion
    : outfit.occasion
      ? [outfit.occasion]
      : [];
  const name = outfit.name || `Wardrobe look ${index + 1}`;

  return (
    <article className="wardrobe-outfit-entry wardrobe-owned-outfit">
      <div className="wardrobe-outfit-artwork">
        {outfit.image ? (
          <img className="wardrobe-outfit-modeled" src={outfit.image} alt={`Modeled view of ${name}`} loading="lazy" />
        ) : (
          <div className="wardrobe-outfit-collage" aria-label={`${name} wardrobe pieces`}>
            {garments.map((item) => (
              <img key={item.id} src={item.thumbnail || item.image} alt="" loading="lazy" />
            ))}
          </div>
        )}
        <span className="wardrobe-outfit-number">Look {String(index + 1).padStart(2, "0")}</span>
      </div>

      <div className="wardrobe-outfit-copy">
        {occasions.length ? <p className="wardrobe-outfit-occasion">{occasions.join(" · ")}</p> : null}
        <h3>{name}</h3>
        {outfit.reason ? <p className="wardrobe-outfit-reason">{outfit.reason}</p> : null}
        <div className="wardrobe-outfit-subhead">
          <span>From your wardrobe</span>
          <small>{garmentIds.length} {garmentIds.length === 1 ? "piece" : "pieces"}</small>
        </div>
        <OwnedGarments garmentIds={garmentIds} itemMap={itemMap} onOpen={onOpen} />
      </div>
    </article>
  );
}

function MixedOutfitEntry({
  outfit,
  index,
  itemMap,
  onOpen
}: {
  outfit: MixedOutfit;
  index: number;
  itemMap: Map<string, WardrobeItem>;
  onOpen: (itemId: string, event: ReactMouseEvent<HTMLButtonElement>) => void;
}) {
  const garmentIds = Array.isArray(outfit.ownedGarmentIds) ? outfit.ownedGarmentIds : [];
  const shopItems = Array.isArray(outfit.shopItems) ? outfit.shopItems : [];
  const name = outfit.name || `Online pairing ${index + 1}`;

  return (
    <article className="wardrobe-outfit-entry wardrobe-mixed-outfit">
      <header className="wardrobe-mixed-heading">
        <p className="wardrobe-outfit-occasion">Suggestion {String(index + 1).padStart(2, "0")}</p>
        <h3>{name}</h3>
        {outfit.reason ? <p className="wardrobe-outfit-reason">{outfit.reason}</p> : null}
      </header>

      <div className="wardrobe-mixed-composition">
        <section aria-label="Pieces you already own">
          <div className="wardrobe-outfit-subhead">
            <span>You already own</span>
            <small>{garmentIds.length} {garmentIds.length === 1 ? "piece" : "pieces"}</small>
          </div>
          <OwnedGarments garmentIds={garmentIds} itemMap={itemMap} compact onOpen={onOpen} />
        </section>

        <section aria-label="Suggested items available online">
          <div className="wardrobe-outfit-subhead">
            <span>Add from online</span>
            <small>External shops</small>
          </div>
          <div className="wardrobe-shop-items">
            {shopItems.map((item, itemIndex) => {
              const href = safeShopUrl(item.url ?? item.productUrl);
              const label = `${item.brand ? `${item.brand} ` : ""}${item.name || "suggested item"}`;
              const content = (
                <>
                  <ShopItemImage item={item} />
                  <span className="wardrobe-shop-meta">
                    <small>{[item.brand, item.color].filter(Boolean).join(" · ") || item.category || "Suggested item"}</small>
                    <strong>{item.name || "Shop this piece"}</strong>
                    <span>{formatShopPrice(item)}</span>
                  </span>
                  {href ? <span className="wardrobe-shop-arrow" aria-hidden="true">↗</span> : null}
                </>
              );

              return href ? (
                <a
                  className="wardrobe-shop-item"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={item.id || `${href}-${itemIndex}`}
                  aria-label={`${label}, opens online shop in a new tab`}
                >
                  {content}
                </a>
              ) : (
                <div className="wardrobe-shop-item is-unavailable" key={item.id || `${item.name}-${itemIndex}`}>
                  {content}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </article>
  );
}

export default function WardrobePage() {
  const [activeView, setActiveView] = useState<ViewId>("wardrobe");
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");
  const [ownedOnly, setOwnedOnly] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const wardrobeTabRef = useRef<HTMLButtonElement>(null);
  const outfitsTabRef = useRef<HTMLButtonElement>(null);

  const itemMap = useMemo(() => new Map(items.map((item) => [item.id, item])), []);
  const visibleItems = useMemo(
    () =>
      activeFilter === "all"
        ? items
        : items.filter((item) => categoryForPart(item.part).id === activeFilter),
    [activeFilter]
  );
  const visibleOutfits = ownedOnly ? recommendations.ownedOutfits : recommendations.mixedOutfits;
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

  function changeView(view: ViewId) {
    setSelectedId(null);
    setActiveView(view);
  }

  function handleTabKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    let nextView: ViewId | null = null;

    if (event.key === "ArrowLeft" || event.key === "Home") nextView = "wardrobe";
    if (event.key === "ArrowRight" || event.key === "End") nextView = "outfits";
    if (!nextView) return;

    event.preventDefault();
    changeView(nextView);
    (nextView === "wardrobe" ? wardrobeTabRef : outfitsTabRef).current?.focus();
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

      <div className="wardrobe-primary-nav-shell">
        <nav className="wardrobe-primary-nav" role="tablist" aria-label="Wardrobe sections">
          <button
            ref={wardrobeTabRef}
            id="wardrobe-tab"
            type="button"
            role="tab"
            aria-selected={activeView === "wardrobe"}
            aria-controls="wardrobe-panel"
            tabIndex={activeView === "wardrobe" ? 0 : -1}
            className={activeView === "wardrobe" ? "is-active" : ""}
            onClick={() => changeView("wardrobe")}
            onKeyDown={handleTabKeyDown}
          >
            Wardrobe <span>{String(items.length).padStart(2, "0")}</span>
          </button>
          <button
            ref={outfitsTabRef}
            id="outfits-tab"
            type="button"
            role="tab"
            aria-selected={activeView === "outfits"}
            aria-controls="outfits-panel"
            tabIndex={activeView === "outfits" ? 0 : -1}
            className={activeView === "outfits" ? "is-active" : ""}
            onClick={() => changeView("outfits")}
            onKeyDown={handleTabKeyDown}
          >
            Outfits <span>{String(recommendations.ownedOutfits.length).padStart(2, "0")}</span>
          </button>
        </nav>
      </div>

      {activeView === "wardrobe" ? (
        <section
          className="wardrobe-catalog"
          id="wardrobe-panel"
          role="tabpanel"
          aria-labelledby="wardrobe-tab"
        >
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
      ) : (
        <section
          className="wardrobe-outfits"
          id="outfits-panel"
          role="tabpanel"
          aria-labelledby="outfits-tab"
        >
          <header className="wardrobe-outfits-header">
            <div>
              <p className="wardrobe-kicker">Outfit recommendations</p>
              <h2>{ownedOnly ? "Wear what you own" : "Find the missing piece"}</h2>
              <p>
                {ownedOnly
                  ? "Every look uses only pieces already in your wardrobe."
                  : "Your pieces are paired with clearly marked items available online."}
              </p>
            </div>

            <label className="wardrobe-owned-filter">
              <span>
                <strong>Only my clothes</strong>
                <small>{ownedOnly ? "On · no outside items" : "Off · includes online items"}</small>
              </span>
              <input
                type="checkbox"
                role="switch"
                checked={ownedOnly}
                onChange={(event) => setOwnedOnly(event.target.checked)}
              />
              <i aria-hidden="true"><span /></i>
            </label>
          </header>

          {!visibleOutfits.length ? (
            <div className="wardrobe-outfits-empty">
              <p>{ownedOnly ? "No wardrobe-only looks are ready yet." : "No online pairings are ready yet."}</p>
              <button type="button" onClick={() => setOwnedOnly((current) => !current)}>
                {ownedOnly ? "Show online pairings" : "Show wardrobe-only looks"}
              </button>
            </div>
          ) : (
            <div className="wardrobe-outfit-list" aria-label={ownedOnly ? "Outfits made from your clothes" : "Outfits with online additions"}>
              <div className="wardrobe-outfit-list-meta" aria-live="polite">
                <span>{visibleOutfits.length} {visibleOutfits.length === 1 ? "recommendation" : "recommendations"}</span>
                <span>{ownedOnly ? "Wardrobe only" : "Wardrobe + online"}</span>
              </div>
              {ownedOnly
                ? recommendations.ownedOutfits.map((outfit, index) => (
                    <OwnedOutfitEntry
                      key={outfit.id || `${outfit.name}-${index}`}
                      outfit={outfit}
                      index={index}
                      itemMap={itemMap}
                      onOpen={openViewer}
                    />
                  ))
                : recommendations.mixedOutfits.map((outfit, index) => (
                    <MixedOutfitEntry
                      key={outfit.id || `${outfit.name}-${index}`}
                      outfit={outfit}
                      index={index}
                      itemMap={itemMap}
                      onOpen={openViewer}
                    />
                  ))}
            </div>
          )}
        </section>
      )}

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
