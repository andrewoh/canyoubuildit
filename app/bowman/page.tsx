"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Check,
  Layers3,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  Trash2,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { bowmanCards, type BowmanCard } from "../../lib/bowman-data";
import styles from "./page.module.css";

type Tab = "search" | "collection";
type TrendFilter = "all" | "rising" | "falling" | "high";
type CollectionFilter = "all" | "saved" | "unsaved";
type CollectionItem = { cardId: string; addedAt: string };

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const years = Array.from(new Set(bowmanCards.map((card) => card.year))).sort((a, b) => b - a);
const teams = Array.from(new Set(bowmanCards.map((card) => card.team))).sort((a, b) => a.localeCompare(b));
const realImageCount = bowmanCards.filter((card) => !card.imageUrl.startsWith("data:")).length;
const fallbackImageCount = bowmanCards.length - realImageCount;

function releaseValue(card: BowmanCard) {
  return card.trend[0]?.value ?? card.previousValue;
}

function valueChange(card: BowmanCard) {
  return card.currentValue - releaseValue(card);
}

function percentChange(card: BowmanCard) {
  const baseValue = releaseValue(card);
  if (!baseValue) return 0;
  return (valueChange(card) / baseValue) * 100;
}

function formatTrendMonth(value: string) {
  const [year, month] = value.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit" }).format(date);
}

function classNames(...names: Array<string | false | null | undefined>) {
  return names.filter(Boolean).join(" ");
}

function BowmanCardTile({
  card,
  isSaved,
  isFlipped,
  collectionMode,
  onFlip,
  onToggleCollection
}: {
  card: BowmanCard;
  isSaved: boolean;
  isFlipped: boolean;
  collectionMode: boolean;
  onFlip: () => void;
  onToggleCollection: () => void;
}) {
  const delta = valueChange(card);
  const isUp = delta >= 0;

  return (
    <article className={styles.cardShell}>
      <button
        className={classNames(styles.cardAction, isSaved && styles.savedAction)}
        onClick={(event) => {
          event.stopPropagation();
          onToggleCollection();
        }}
        title={collectionMode ? "Remove from collection" : isSaved ? "Saved to collection" : "Save to collection"}
        aria-label={collectionMode ? `Remove ${card.playerName}` : isSaved ? `${card.playerName} is saved` : `Save ${card.playerName}`}
      >
        {collectionMode ? <Trash2 size={17} /> : isSaved ? <Check size={17} /> : <Plus size={18} />}
      </button>

      <button className={styles.flipButton} onClick={onFlip} aria-label={`Flip ${card.playerName} card`}>
        <div className={classNames(styles.flipInner, isFlipped && styles.flipped)}>
          <div className={styles.cardFace}>
            <div className={styles.imageFrame}>
              <img src={card.imageUrl} alt={`${card.playerName} ${card.year} Bowman Chrome ${card.cardNumber}`} />
            </div>
            <div className={styles.cardCaption}>
              <div>
                <span>{card.year} Chrome</span>
                <h3>{card.playerName}</h3>
              </div>
              <strong>{currency.format(card.currentValue)}</strong>
            </div>
          </div>

          <div className={classNames(styles.cardFace, styles.cardBack)}>
            <div className={styles.backTop}>
              <span>{card.cardNumber}</span>
              <b className={isUp ? styles.up : styles.down}>
                {isUp ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                {isUp ? "+" : ""}{currency.format(delta)}
              </b>
            </div>
            <h3>{card.playerName}</h3>
            <p>{card.team} · {card.position || "Prospect"} · {card.setName}</p>
            <div className={styles.valueRow}>
              <span>Since release</span>
              <strong>{currency.format(card.currentValue)}</strong>
              <em className={isUp ? styles.up : styles.down}>{isUp ? "+" : ""}{percentChange(card).toFixed(1)}%</em>
            </div>
            <div className={styles.chartBox}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={card.trend} margin={{ top: 6, right: 6, bottom: 0, left: -22 }}>
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    minTickGap={18}
                    tick={{ fontSize: 10, fill: "#758095" }}
                    tickFormatter={formatTrendMonth}
                  />
                  <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
                  <Tooltip
                    formatter={(value) => currency.format(Number(value))}
                    labelFormatter={(label) => formatTrendMonth(String(label))}
                    contentStyle={{ borderRadius: 8, border: "1px solid #d7dce5" }}
                  />
                  <Area type="monotone" dataKey="value" stroke={isUp ? "#16815f" : "#a33d4a"} fill={isUp ? "#d9f3eb" : "#f7dce1"} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className={styles.sourceRow}>
              <span>Released {card.releaseDate || card.year}</span>
              <span>{card.imageCredit}</span>
            </div>
          </div>
        </div>
      </button>
    </article>
  );
}

export default function BowmanPage() {
  const [activeTab, setActiveTab] = useState<Tab>("search");
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("all");
  const [team, setTeam] = useState("all");
  const [trend, setTrend] = useState<TrendFilter>("all");
  const [collectionFilter, setCollectionFilter] = useState<CollectionFilter>("all");
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [loadingCollection, setLoadingCollection] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/bowman/collection", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (!cancelled && Array.isArray(payload.collection)) setCollection(payload.collection);
      })
      .finally(() => {
        if (!cancelled) setLoadingCollection(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const savedIds = useMemo(() => new Set(collection.map((item) => item.cardId)), [collection]);

  const visibleCards = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const base = activeTab === "collection" ? bowmanCards.filter((card) => savedIds.has(card.id)) : bowmanCards;

    return base.filter((card) => {
      const matchesQuery =
        !normalizedQuery ||
        [card.playerName, card.team, card.cardNumber, card.position || "", String(card.year)]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesYear = year === "all" || card.year === Number(year);
      const matchesTeam = team === "all" || card.team === team;
      const delta = valueChange(card);
      const matchesTrend =
        trend === "all" ||
        (trend === "rising" && delta >= 0) ||
        (trend === "falling" && delta < 0) ||
        (trend === "high" && card.currentValue >= 10);
      const matchesCollection =
        activeTab === "collection" ||
        collectionFilter === "all" ||
        (collectionFilter === "saved" && savedIds.has(card.id)) ||
        (collectionFilter === "unsaved" && !savedIds.has(card.id));

      return matchesQuery && matchesYear && matchesTeam && matchesTrend && matchesCollection;
    });
  }, [activeTab, collectionFilter, query, savedIds, team, trend, year]);

  const collectionCards = useMemo(() => {
    return collection
      .map((item) => bowmanCards.find((card) => card.id === item.cardId))
      .filter((card): card is BowmanCard => Boolean(card));
  }, [collection]);

  const collectionValue = collectionCards.reduce((sum, card) => sum + card.currentValue, 0);
  const strongestRiser = collectionCards.reduce<BowmanCard | null>((best, card) => {
    if (!best) return card;
    return valueChange(card) > valueChange(best) ? card : best;
  }, null);
  const recentAdds = collection.slice(0, 3).map((item) => bowmanCards.find((card) => card.id === item.cardId)?.playerName).filter(Boolean);

  async function toggleCollection(card: BowmanCard) {
    if (savingId) return;
    setSavingId(card.id);
    const removing = savedIds.has(card.id);
    const response = await fetch("/api/bowman/collection", {
      method: removing ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: card.id })
    });
    const payload = await response.json();
    if (Array.isArray(payload.collection)) setCollection(payload.collection);
    setSavingId(null);
  }

  function toggleFlip(cardId: string) {
    setFlipped((current) => {
      const next = new Set(current);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <span className={styles.kicker}><Layers3 size={15} /> canyoubuildit.com</span>
          <h1>Bowman 1st Tracker</h1>
          <p>{bowmanCards.length} checklist cards · {realImageCount} real card images · release-to-current value curves</p>
        </div>
        <div className={styles.tabs} role="tablist" aria-label="Bowman tracker tabs">
          <button className={activeTab === "search" ? styles.activeTab : ""} onClick={() => setActiveTab("search")}><Search size={17} /> Search</button>
          <button className={activeTab === "collection" ? styles.activeTab : ""} onClick={() => setActiveTab("collection")}><Star size={17} /> My Collection</button>
        </div>
      </header>

      {activeTab === "search" && (
        <section className={styles.marketStrip} aria-label="Market summary">
          <div>
            <span>Cards tracked</span>
            <strong>{bowmanCards.length}</strong>
          </div>
          <div>
            <span>Real images</span>
            <strong>{realImageCount}</strong>
          </div>
          <div>
            <span>Generated fallbacks</span>
            <strong>{fallbackImageCount}</strong>
          </div>
        </section>
      )}

      {activeTab === "collection" && (
        <section className={styles.collectionStats} aria-label="Collection summary">
          <div>
            <span>Total value</span>
            <strong>{currency.format(collectionValue)}</strong>
          </div>
          <div>
            <span>Cards</span>
            <strong>{collectionCards.length}</strong>
          </div>
          <div>
            <span>Strongest riser</span>
            <strong>{strongestRiser ? strongestRiser.playerName : "None"}</strong>
          </div>
          <div>
            <span>Recent adds</span>
            <strong>{recentAdds.length ? recentAdds.join(", ") : "None"}</strong>
          </div>
        </section>
      )}

      <section className={styles.filters} aria-label="Search filters">
        <label className={styles.searchBox}>
          <Search size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search player, team, card #" />
        </label>
        <label>
          <span>Year</span>
          <select value={year} onChange={(event) => setYear(event.target.value)}>
            <option value="all">All years</option>
            {years.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label>
          <span>Team</span>
          <select value={team} onChange={(event) => setTeam(event.target.value)}>
            <option value="all">All teams</option>
            {teams.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label>
          <span>Trend</span>
          <select value={trend} onChange={(event) => setTrend(event.target.value as TrendFilter)}>
            <option value="all">All values</option>
            <option value="rising">Rising</option>
            <option value="falling">Falling</option>
            <option value="high">$10+</option>
          </select>
        </label>
        {activeTab === "search" && (
          <label>
            <span>Collection</span>
            <select value={collectionFilter} onChange={(event) => setCollectionFilter(event.target.value as CollectionFilter)}>
              <option value="all">All cards</option>
              <option value="saved">Saved</option>
              <option value="unsaved">Unsaved</option>
            </select>
          </label>
        )}
        <div className={styles.resultCount}>
          <SlidersHorizontal size={16} />
          <b>{visibleCards.length}</b>
          <span>{activeTab === "collection" ? "saved shown" : "cards shown"}</span>
        </div>
      </section>

      {loadingCollection ? (
        <section className={styles.emptyState}>Loading collection…</section>
      ) : visibleCards.length ? (
        <section className={styles.cardGrid} aria-label={activeTab === "collection" ? "My collection cards" : "Search results"}>
          {visibleCards.map((card) => (
            <BowmanCardTile
              key={card.id}
              card={card}
              isSaved={savedIds.has(card.id)}
              isFlipped={flipped.has(card.id)}
              collectionMode={activeTab === "collection"}
              onFlip={() => toggleFlip(card.id)}
              onToggleCollection={() => toggleCollection(card)}
            />
          ))}
        </section>
      ) : (
        <section className={styles.emptyState}>
          <BarChart3 size={28} />
          <b>No cards match these filters.</b>
        </section>
      )}
    </main>
  );
}
