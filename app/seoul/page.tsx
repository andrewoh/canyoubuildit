"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowRight, Bell, Briefcase, CalendarDays, Car, CreditCard, ExternalLink, Grid2X2, Hotel, Lock, Plane, RefreshCw, ShieldCheck, Utensils, X } from "lucide-react";
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

function rawText(raw: Record<string, unknown>, key: string) {
  const value = raw[key];
  return typeof value === "string" || typeof value === "number" ? String(value) : null;
}

function rawList(raw: Record<string, unknown>, key: string) {
  const value = raw[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function cardInfo(expense: NormalizedExpense) {
  const card = expense.rawSource.card;
  if (card && typeof card === "object" && !Array.isArray(card)) {
    const source = card as Record<string, unknown>;
    return {
      brand: rawText(source, "brand") || "Card",
      product: rawText(source, "product") || rawText(expense.rawSource, "account") || "Card",
      last4: rawText(source, "last4"),
      role: rawText(source, "role") || "Payment"
    };
  }

  const account = rawText(expense.rawSource, "account") || rawText(expense.rawSource, "paymentMethod");
  if (account) return { brand: account.includes("Visa") ? "Visa" : "Card", product: account, last4: null, role: "Payment" };
  return null;
}

function PaymentCardMark({ expense }: { expense: NormalizedExpense }) {
  const card = cardInfo(expense);
  if (!card) return null;
  const isAmex = /american express|amex|platinum/i.test(`${card.brand} ${card.product}`);
  return (
    <div className={`paymentCardMark ${isAmex ? "amex" : "visa"}`} aria-label={`${card.product}${card.last4 ? ` ending ${card.last4}` : ""}`}>
      <span>{isAmex ? "AMEX" : card.brand}</span>
      <b>{isAmex ? "PLATINUM" : card.product}</b>
      {card.last4 && <small>••{card.last4}</small>}
    </div>
  );
}

function detailAmount(expense: NormalizedExpense) {
  if (expense.amount != null) return formatter.format(expense.amount);
  const totalCharges = expense.rawSource.totalCharges;
  const totalCurrency = rawText(expense.rawSource, "totalChargesCurrency") || expense.currency;
  if (typeof totalCharges === "number") return `${new Intl.NumberFormat("en-US").format(totalCharges)} ${totalCurrency}`;
  const receiptTotal = expense.rawSource.receiptTotal;
  if (typeof receiptTotal === "number") return formatter.format(receiptTotal);
  return "Pending";
}

function PaperPlaneSvg({ small = false }: { small?: boolean }) {
  return (
    <svg className={small ? "paperJetSvg small" : "paperJetSvg"} viewBox="0 0 190 88" aria-hidden="true">
      <path className="jetShadow" d="M22 55 C74 76 124 78 167 56" />
      <path className="jetBody" d="M8 47 L170 10 C177 8 182 15 177 21 L58 72 C51 75 43 70 45 63 L50 48 Z" />
      <path className="jetWing" d="M72 43 L121 75 L94 32 Z" />
      <path className="jetTail" d="M42 40 L19 19 L69 34 Z" />
      <path className="jetFold" d="M50 48 L170 10 L76 55" />
      <circle className="jetWindow" cx="111" cy="30" r="4" />
      <circle className="jetWindow" cx="128" cy="26" r="3.7" />
      <circle className="jetWindow" cx="145" cy="22" r="3.4" />
    </svg>
  );
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

function FlightHero({ transactions, onSelect }: { transactions: NormalizedExpense[]; onSelect: (expense: NormalizedExpense) => void }) {
  const flight = transactions.find((row) => row.category === "Flights");
  const receiptTotal =
    typeof flight?.rawSource.receiptTotal === "number" ? flight.rawSource.receiptTotal : null;
  const confirmationCode =
    typeof flight?.rawSource.confirmationCode === "string" ? flight.rawSource.confirmationCode : null;
  return (
    <section className="heroCard flightHero" role="button" tabIndex={0} onClick={() => flight && onSelect(flight)} onKeyDown={(event) => {
      if ((event.key === "Enter" || event.key === " ") && flight) onSelect(flight);
    }}>
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
        <div className="paperJetRig">
          <PaperPlaneSvg />
        </div>
        <svg className="flightPath" viewBox="0 0 700 220" preserveAspectRatio="none">
          <path d="M28 150 C 190 50, 300 210, 495 92 S 645 85, 690 54" />
        </svg>
      </div>
      <div className="revealPanel">
        <span>Receipt total</span>
        <span className="revealIcon" aria-hidden="true"><ArrowRight size={22} /></span>
        <small>Amount</small>
        <div className="dots"><i/><i/><i/><i/><i/></div>
        <b>{flight?.amount == null ? formatter.format(receiptTotal ?? 0) : formatter.format(flight.amount)}</b>
      </div>
      <div className="syncPill"><span>Pending</span> Receipt detected · waiting for card match</div>
    </section>
  );
}

function VisualCard({ expense, onSelect }: { expense: NormalizedExpense; onSelect: (expense: NormalizedExpense) => void }) {
  const { merchant, title, amount, category, status } = expense;
  const cls = category.toLowerCase().replace(/\s+/g, "-");
  return (
    <article className={`visualCard ${cls}`} role="button" tabIndex={0} onClick={() => onSelect(expense)} onKeyDown={(event) => {
      if (event.key === "Enter" || event.key === " ") onSelect(expense);
    }}>
      <div className="cardBadge" style={{ background: colorByCategory[category] }}>{iconByCategory[category]} {category}</div>
      <PaymentCardMark expense={expense} />
      <div className="illustration" aria-hidden="true">
        {category === "Hotels" && <><div className="roomWindow"><PaperSkyline /></div><div className="bed" /><div className="lamp" /></>}
        {category === "Travel Services" && <><div className="clearKiosk">CLEAR</div><div className="scanner" /><div className="plant" /></>}
        {category === "Airport" && <><div className="paperBag">뻥튀기</div><div className="cup">한국김</div><div className="snack" /></>}
        {category === "Flights" && <><div className="paperJetRig smallRig"><PaperPlaneSvg small /></div><div className="cloud cloudA" /></>}
      </div>
      <div className="visualText">
        <h3>{merchant}</h3>
        <p>{title}</p>
        <strong><Currency value={amount} /></strong>
        <span className={`status ${status}`}>{status === "posted" ? "Posted" : status.replace("_", " ")}</span>
      </div>
      <span className="cardArrow" aria-hidden="true"><ArrowRight size={18}/></span>
    </article>
  );
}

function DetailPanel({ expense, onClose }: { expense: NormalizedExpense; onClose: () => void }) {
  const card = cardInfo(expense);
  const rows = [
    ["Date", expense.date],
    ["Status", expense.status.replace("_", " ")],
    ["Source", expense.source],
    ["Payment", rawText(expense.rawSource, "paymentMethod") || rawText(expense.rawSource, "account")],
    ["Booking #", rawText(expense.rawSource, "bookingNumber")],
    ["Confirmation #", rawText(expense.rawSource, "hotelConfirmationNumber") || rawText(expense.rawSource, "reservationNumber") || rawText(expense.rawSource, "confirmationCode")],
    ["Check-in", rawText(expense.rawSource, "checkIn")],
    ["Check-out", rawText(expense.rawSource, "checkOut")],
    ["Room", rawText(expense.rawSource, "roomType")],
    ["Guests", rawText(expense.rawSource, "guests") || (rawText(expense.rawSource, "adults") ? `${rawText(expense.rawSource, "adults")} adults` : null)],
    ["Address", rawText(expense.rawSource, "address")],
    ["Phone", rawText(expense.rawSource, "phone")],
    ["Email", rawText(expense.rawSource, "email")]
  ].filter((row): row is [string, string] => Boolean(row[1]));
  const benefits = rawList(expense.rawSource, "benefits");
  const links = Array.isArray(expense.rawSource.webLinks) ? expense.rawSource.webLinks.filter((link): link is { label: string; url: string } => {
    return Boolean(link) && typeof link === "object" && typeof (link as Record<string, unknown>).label === "string" && typeof (link as Record<string, unknown>).url === "string";
  }) : [];
  const cancellationPolicy = rawText(expense.rawSource, "cancellationPolicy");

  return (
    <div className="detailOverlay" role="dialog" aria-modal="true" aria-label={`${expense.merchant} details`} onClick={onClose}>
      <section className="detailPanel" onClick={(event) => event.stopPropagation()}>
        <button className="detailClose" onClick={onClose} aria-label="Close transaction details"><X size={19} /></button>
        <div className="detailHead">
          <div>
            <span className="detailKicker">{expense.category}</span>
            <h2>{expense.merchant}</h2>
            <p>{expense.title}</p>
          </div>
          <PaymentCardMark expense={expense} />
        </div>

        <div className="detailAmount">
          <span>Tracked amount</span>
          <strong>{detailAmount(expense)}</strong>
          {card && <small><CreditCard size={14} /> {card.role}: {card.product}{card.last4 ? ` ending ${card.last4}` : ""}</small>}
        </div>

        <div className="detailRows">
          {rows.map(([label, value]) => (
            <p key={label}><span>{label}</span><b>{value}</b></p>
          ))}
        </div>

        {benefits.length > 0 && (
          <div className="detailBlock">
            <h3>Included Benefits</h3>
            {benefits.map((benefit) => <p key={benefit}>{benefit}</p>)}
          </div>
        )}

        {cancellationPolicy && (
          <div className="detailBlock">
            <h3>Policy</h3>
            <p>{cancellationPolicy}</p>
          </div>
        )}

        <div className="detailBlock">
          <h3>Notes</h3>
          <p>{expense.notes}</p>
        </div>

        {links.length > 0 && (
          <div className="detailLinks">
            {links.map((link) => (
              <a href={link.url} key={link.url} target="_blank" rel="noreferrer">
                {link.label} <ExternalLink size={14} />
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<NormalizedExpense[]>(seedTransactions);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [selected, setSelected] = useState<NormalizedExpense | null>(null);
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
            <FlightHero transactions={transactions} onSelect={setSelected} />
            <div className="cardsGrid">
              {transactions.filter(t => t.category !== "Flights").map((t) => <VisualCard key={t.id} expense={t} onSelect={setSelected} />)}
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
      {selected && <DetailPanel expense={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}
