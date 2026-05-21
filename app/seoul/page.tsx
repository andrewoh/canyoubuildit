"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Plane, Hotel, ShieldCheck, Lock, Grid2X2, ReceiptText, ChartPie, Target, MapPin, Settings, Bell, Car, Utensils, Briefcase, ArrowRight, CalendarDays, RefreshCw } from "lucide-react";
import { categories, summarizeTransactions, transactions as seedTransactions, type NormalizedExpense, type TripSummary } from "../../lib/trip-data";

const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const colorByCategory: Record<string, string> = {
  Flights: "#6aa9f7",
  Hotels: "#b38be4",
  "Travel Services": "#7dc6be",
  Airport: "#f6b37b",
  Dining: "#f29a8f",
  "Ground Transport": "#a3c87a",
  Other: "#c9c3b8"
};

const iconByCategory: Record<string, ReactNode> = {
  Flights: <Plane size={22} />,
  Hotels: <Hotel size={22} />,
  "Travel Services": <ShieldCheck size={22} />,
  Airport: <Briefcase size={22} />,
  Dining: <Utensils size={22} />,
  "Ground Transport": <Car size={22} />,
  Other: <Grid2X2 size={22} />
};

function Currency({ value }: { value: number | null }) {
  if (value == null) return <span className="muted">Pending</span>;
  return <>{formatter.format(value)}</>;
}

function CategoryDonut({ summary }: { summary: TripSummary }) {
  const total = summary.postedTotal + summary.pendingTotal;
  let start = 0;
  const stops = summary.byCategory
    .map(({ category, total: categoryTotal }) => {
      const pct = total > 0 ? (categoryTotal / total) * 100 : 0;
      const end = start + pct;
      const segment = `${colorByCategory[category]} ${start}% ${end}%`;
      start = end;
      return segment;
    })
    .filter(Boolean)
    .join(", ");

  return (
    <div className="donutWrap">
      <div className="donut" style={{ background: `conic-gradient(${stops || "#ddd 0 100%"})` }}>
        <div className="donutCenter">
          <span>Total Spent</span>
          <strong>{formatter.format(summary.postedTotal)}</strong>
          <small>USD</small>
        </div>
      </div>
    </div>
  );
}

function PaperSkyline() {
  return (
    <div className="paperSkyline" aria-hidden="true">
      <div className="cloud cloudOne" />
      <div className="cloud cloudTwo" />
      <div className="cloud cloudThree" />
      <div className="hill hillBack" />
      <div className="hill hillFront" />
      <div className="tower"><span /></div>
      <div className="buildings">
        {Array.from({ length: 14 }).map((_, i) => <i key={i} />)}
      </div>
      <div className="cherryTree"><span /></div>
    </div>
  );
}

function FlightHero({ transactions }: { transactions: NormalizedExpense[] }) {
  const flight = transactions.find((row) => row.category === "Flights");
  const receiptTotal =
    typeof flight?.rawSource.receiptTotal === "number" ? flight.rawSource.receiptTotal : null;
  const confirmationCode =
    typeof flight?.rawSource.confirmationCode === "string" ? flight.rawSource.confirmationCode : null;
  return (
    <section className="heroCard flightHero">
      <div className="cardBadge blue"><Plane size={16} /> Flights</div>
      <div className="flightCopy">
        <h2>Flight to Seoul</h2>
        <p>{confirmationCode ? `United ${confirmationCode}` : "United flight"}</p>
        <strong>SFO → ICN → SFO</strong>
      </div>
      <div className="paperScene flightScene">
        <div className="cloud cloudA" />
        <div className="cloud cloudB" />
        <div className="miniTower" />
        <div className="paperPlaneRig">
          <div className="paperPlane">
            <span className="wing" />
            <span className="tail" />
            <span className="window w1" />
            <span className="window w2" />
            <span className="window w3" />
          </div>
        </div>
        <svg className="flightPath" viewBox="0 0 700 220" preserveAspectRatio="none">
          <path d="M28 150 C 190 50, 300 210, 495 92 S 645 85, 690 54" />
        </svg>
      </div>
      <div className="revealPanel">
        <span>Receipt total</span>
        <button aria-label="Reveal amount"><ArrowRight size={22} /></button>
        <small>Amount</small>
        <div className="dots"><i/><i/><i/><i/><i/></div>
        <b>{flight?.amount == null ? formatter.format(receiptTotal ?? 0) : formatter.format(flight.amount)}</b>
      </div>
      <div className="syncPill"><span>Pending</span> Receipt detected · waiting for card match</div>
    </section>
  );
}

function VisualCard({ merchant, title, amount, category, status }: NormalizedExpense) {
  const cls = category.toLowerCase().replace(/\s+/g, "-");
  return (
    <article className={`visualCard ${cls}`}>
      <div className="cardBadge" style={{ background: colorByCategory[category] }}>{iconByCategory[category]} {category}</div>
      <div className="illustration" aria-hidden="true">
        {category === "Hotels" && <><div className="roomWindow"><PaperSkyline /></div><div className="bed" /><div className="lamp" /></>}
        {category === "Travel Services" && <><div className="clearKiosk">CLEAR</div><div className="scanner" /><div className="plant" /></>}
        {category === "Airport" && <><div className="paperBag">뻥튀기</div><div className="cup">한국김</div><div className="snack" /></>}
        {category === "Flights" && <><div className="paperPlaneRig smallRig"><div className="paperPlane small"><span className="wing"/><span className="tail"/></div></div><div className="cloud cloudA" /></>}
      </div>
      <div className="visualText">
        <h3>{merchant}</h3>
        <p>{title}</p>
        <strong><Currency value={amount} /></strong>
        <span className={`status ${status}`}>{status === "posted" ? "Posted" : status.replace("_", " ")}</span>
      </div>
      <button className="cardArrow" aria-label={`Open ${merchant}`}><ArrowRight size={18}/></button>
    </article>
  );
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<NormalizedExpense[]>(seedTransactions);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const summary = useMemo(() => summarizeTransactions(transactions), [transactions]);
  const total = summary.postedTotal + summary.pendingTotal;
  const latest = [...transactions].slice(0, 4);

  useEffect(() => {
    let active = true;

    async function refresh() {
      const res = await fetch("/api/transactions", { cache: "no-store" });
      if (!res.ok) return;
      const payload = (await res.json()) as {
        generatedAt: string;
        transactions: NormalizedExpense[];
      };
      if (!active) return;
      setTransactions(payload.transactions);
      setGeneratedAt(payload.generatedAt);
    }

    refresh();
    const interval = window.setInterval(refresh, 60_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <main className="appShell">
      <aside className="sidebar">
        <div className="paperLogo"><Plane size={30} /></div>
        <nav>
          <a className="active"><Grid2X2 size={18}/> Dashboard</a>
          <a><ReceiptText size={18}/> Transactions</a>
          <a><ChartPie size={18}/> Categories</a>
          <a><Target size={18}/> Budgets</a>
          <a><MapPin size={18}/> Map</a>
          <a><Settings size={18}/> Settings</a>
        </nav>
        <div className="tripMini"><PaperSkyline /><b>Seoul Trip</b><span>May 29 – Jun 5, 2026</span></div>
        <div className="weather">Sky <b>ICN</b><span>Seoul, KR</span></div>
      </aside>

      <section className="mainPanel">
        <header className="topbar">
          <div className="brand">canyoubuildit.com <span><Lock size={14}/> Protected</span></div>
          <p><i /> {generatedAt ? `Last refresh ${new Date(generatedAt).toLocaleTimeString()}` : "Refreshing every 60 seconds"}</p>
          <div className="user"><Bell size={19}/><span><RefreshCw size={17} /></span> Live</div>
        </header>

        <div className="dashboardHeader">
          <div>
            <h1>Seoul Trip Live Dashboard</h1>
            <p>May 29 – Jun 5, 2026 <span><CalendarDays size={15}/> Private trip finance</span></p>
          </div>
          <PaperSkyline />
        </div>

        <div className="chips">
          {categories.map((c) => <button key={c} className={c === "Flights" ? "selected" : ""}>{iconByCategory[c]} {c}</button>)}
        </div>

        <div className="contentGrid">
          <div className="leftContent">
            <FlightHero transactions={transactions} />
            <div className="cardsGrid">
              {transactions.filter(t => t.category !== "Flights").map((t) => <VisualCard key={t.id} {...t} />)}
            </div>
            <div className="summaryStrip">
              <div><span>Total Trip Spend</span><b>{formatter.format(total)}</b><em className="spark green" /></div>
              <div><span>Receipt Detected</span><b>{formatter.format(summary.detectedReceiptTotal)}</b><em className="spark purple" /></div>
              <div><span>Budget</span><b>{formatter.format(6000)}</b><div className="budget"><i style={{ width: `${Math.min(100, total / 6000 * 100)}%` }} /></div></div>
              <div><span>Transactions</span><b>{transactions.length} <small>Live</small></b><em className="bars" /></div>
            </div>
          </div>

          <aside className="rightContent">
            <section className="panel livePanel">
              <h3>Live Sync <span>• Auto-updating</span></h3>
              {latest.map((t, idx) => <div className="activity" key={t.id}><i style={{ background: colorByCategory[t.category] }}>{iconByCategory[t.category]}</i><div><b>{t.merchant}</b><span>{t.amount ? formatter.format(t.amount) : "Detected"} · {t.category}</span></div><small>{idx === 0 ? "Just now" : `${idx}m ago`}</small></div>)}
            </section>

            <section className="panel categoryPanel">
              <h3>Spending by Category</h3>
              <CategoryDonut summary={summary} />
              <div className="legend">
                {summary.byCategory.map((row) => <p key={row.category}><i style={{ background: colorByCategory[row.category] }} /> {row.category}<b>{formatter.format(row.total)}</b></p>)}
              </div>
            </section>

            <section className="panel timelinePanel">
              <h3>Transaction Timeline</h3>
              {transactions.map((t, idx) => <div className="timelineItem" key={t.id}><i style={{ background: colorByCategory[t.category] }}>{iconByCategory[t.category]}</i><span>{idx === 0 ? "Just now" : `${idx}m ago`}</span><div><b>{t.merchant}</b><small>{t.amount ? formatter.format(t.amount) : "Detecting merchant…"}</small></div><em className={t.status}>{t.status}</em></div>)}
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
