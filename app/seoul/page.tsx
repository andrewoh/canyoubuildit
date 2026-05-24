"use client";

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowRight, Bell, Briefcase, CalendarDays, Car, Clock, Coffee, CreditCard, ExternalLink, Grid2X2, Hotel, Landmark, Lock, Luggage, MapPin, Plane, RefreshCw, ShieldCheck, ShoppingBag, Sparkles, Trees, Utensils, X } from "lucide-react";
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

type ScheduleItem = {
  time: string;
  plan: string;
  notes: string;
  anchor?: boolean;
};

type ItineraryDay = {
  date: string;
  weekday: string;
  hotel: string;
  theme: string;
  area: string;
  accent: string;
  icon: ReactNode;
  items: ScheduleItem[];
};

const itineraryDays: ItineraryDay[] = [
  {
    date: "6/1",
    weekday: "Sunday",
    hotel: "Four Seasons Seoul",
    theme: "Seocho church, Shinsegae Gangnam, Gangnam Station, Banpo Hangang",
    area: "Seocho → Gangnam → Banpo",
    accent: "#70aeee",
    icon: <Landmark size={19} />,
    items: [
      { time: "Early morning", plan: "Arrive Seoul → Four Seasons Seoul", notes: "Drop bags / check in if possible" },
      { time: "9:30–9:45am", plan: "Leave for Seocho Station area", notes: "Taxi likely easiest" },
      { time: "10:20am", plan: "Church near Seocho Station", notes: "Hard anchor", anchor: true },
      { time: "11:45am–12:20pm", plan: "Head to Shinsegae Gangnam / House of Shinsegae", notes: "Short ride from Seocho" },
      { time: "12:30pm", plan: "Yoon Haeundae Seoul reservation", notes: "Hard anchor", anchor: true },
      { time: "1:45–2:45pm", plan: "Shinsegae Gangnam / Central City shopping", notes: "Mall + department store block" },
      { time: "3:00–4:30pm", plan: "Gangnam Station / Gangnam-daero", notes: "Mainstream shopping block" },
      { time: "5:00pm onward", plan: "Banpo Hangang Park / Sebitseom", notes: "Best Han River fit for this day" },
      { time: "Night", plan: "Return to Four Seasons", notes: "Keep flexible depending on jet lag" }
    ]
  },
  {
    date: "6/2",
    weekday: "Monday",
    hotel: "Four Seasons Seoul",
    theme: "Gwanghwamun, Anguk, Bukchon, Jongno, Cheonggyecheon",
    area: "Anguk → Jongno → Cheonggyecheon",
    accent: "#c3a7ed",
    icon: <Coffee size={19} />,
    items: [
      { time: "Morning", plan: "Artist Bakery Anguk", notes: "Bakery anchor" },
      { time: "Morning", plan: "Bukchon / Samcheong / Anguk walk", notes: "Palace-adjacent neighborhoods" },
      { time: "Late morning", plan: "Fritz Wonseo", notes: "Fritz #1" },
      { time: "1:00pm", plan: "Niuroumianguan Gwanghwamun reservation", notes: "Hard lunch anchor", anchor: true },
      { time: "Backup", plan: "Doughroom Gwanghwamun", notes: "Keep if pivoting to Italian" },
      { time: "2:15–3:15pm", plan: "Insadong / Ikseon-dong", notes: "Light browsing" },
      { time: "3:15–4:30pm", plan: "Jongno Jewelry District / Piccadilly-Jongno 3-ga", notes: "Jewelry district browse" },
      { time: "4:30–5:30pm", plan: "Jayeondo Salt Bread Ikseon-dong", notes: "Salt bread / cafe break" },
      { time: "Evening", plan: "Dinner flexible around Jongno / Euljiro", notes: "Keep easy" },
      { time: "Night", plan: "Cheonggyecheon lit-up walk", notes: "Best night attraction this day" },
      { time: "Optional late", plan: "Dongdaemun / DDP exterior only", notes: "Skip if tired" }
    ]
  },
  {
    date: "6/3",
    weekday: "Tuesday",
    hotel: "Four Seasons Seoul",
    theme: "Namdaemun, Myeongdong duty-free, Yongsan I'Park Mall + CGV",
    area: "Namdaemun → Myeongdong → Yongsan",
    accent: "#ffc6a6",
    icon: <ShoppingBag size={19} />,
    items: [
      { time: "9:00–9:25am", plan: "Gamegol handmade jumbo dumplings", notes: "Dine in if possible", anchor: true },
      { time: "9:30am–12:30pm", plan: "Namdaemun Market + Burdeng children's clothing", notes: "Protected 3-hour shopping block" },
      { time: "12:30–1:15pm", plan: "Snack / quick lunch / reset", notes: "Use as buffer" },
      { time: "1:30–3:30pm", plan: "Myeongdong duty-free loop", notes: "Lotte and Shinsegae duty-free / department stores" },
      { time: "3:30–4:30pm", plan: "Drop bags / reset at Four Seasons", notes: "Important after shopping" },
      { time: "4:30–6:30pm", plan: "Optional Hannam-dong / Hanbang Chicken", notes: "Cut if day is too full" },
      { time: "7:00–9:00pm", plan: "Yongsan I'Park Mall shopping + Pokémon store", notes: "Bake in shopping before movie" },
      { time: "9:00pm+", plan: "CGV Yongsan I'Park Mall movie", notes: "Prioritize IMAX / 4DX / ScreenX" }
    ]
  },
  {
    date: "6/4",
    weekday: "Wednesday",
    hotel: "Signiel Jamsil",
    theme: "Bag drop, Seongsu, Seoul Forest Pokémon, family dinner near Jamsil",
    area: "Jamsil → Seongsu → Seoul Forest",
    accent: "#a7c98f",
    icon: <Trees size={19} />,
    items: [
      { time: "9:30–10:00am", plan: "Check out Four Seasons", notes: "Take luggage with you" },
      { time: "10:00–10:45am", plan: "Taxi to Signiel Jamsil", notes: "Luggage-first redesign" },
      { time: "10:45–11:15am", plan: "Drop bags at Signiel / check in if possible", notes: "Avoid carrying bags all day" },
      { time: "11:15am–12:00pm", plan: "Head to Seongsu", notes: "East Seoul day" },
      { time: "12:00–1:30pm", plan: "Lunch in Seongsu", notes: "Ggupdang Seongsu is a potential pork lunch spot" },
      { time: "1:30–2:30pm", plan: "Obok Rice Cake + Seongsu browsing", notes: "Food + neighborhood anchor" },
      { time: "2:30–3:45pm", plan: "Seoul Forest + Pokémon Secret Forest exhibit", notes: "Key attraction" },
      { time: "3:45–4:30pm", plan: "Standard Bread Seongsu / cafe", notes: "Bakery anchor" },
      { time: "4:30–5:30pm", plan: "Return to Signiel / reset", notes: "Buffer before dinner" },
      { time: "6:00pm", plan: "Family dinner near Jamsil", notes: "Bookmark / soft-hard anchor", anchor: true },
      { time: "After dinner", plan: "Optional Lotte World Mall / Seokchon Lake", notes: "Keep relaxed" }
    ]
  },
  {
    date: "6/5",
    weekday: "Thursday",
    hotel: "Signiel Jamsil",
    theme: "Myeon Seoul, Spa Gogyeol, Hyundai Apgujeong, Wooga",
    area: "Jamsil → Cheongdam → Apgujeong",
    accent: "#f49d96",
    icon: <Sparkles size={19} />,
    items: [
      { time: "9:45–10:00am", plan: "Leave Signiel", notes: "Taxi to Apgujeong/Cheongdam" },
      { time: "10:45am", plan: "Arrive at Myeon Seoul", notes: "Hard arrival target", anchor: true },
      { time: "11:00am–12:15pm", plan: "Myeon Seoul lunch", notes: "Keep pace comfortable" },
      { time: "12:15–1:10pm", plan: "Buffer / coffee / short walk toward spa", notes: "Do not overpack" },
      { time: "1:15pm", plan: "Arrive at Spa Gogyeol Cheongdam", notes: "Check-in buffer" },
      { time: "1:30–3:00pm", plan: "Spa Gogyeol massage", notes: "Hard anchor", anchor: true },
      { time: "3:00–3:30pm", plan: "Change / tea / checkout", notes: "Realistic spa buffer" },
      { time: "3:45–5:15pm", plan: "Hyundai Department Store Apgujeong Main", notes: "Main shopping block" },
      { time: "5:15–5:40pm", plan: "Head toward Wooga / buffer", notes: "Avoid rushing" },
      { time: "6:00pm", plan: "Wooga reservation", notes: "Hard dinner anchor", anchor: true },
      { time: "After dinner", plan: "Optional Cheongdam / Apgujeong Rodeo walk", notes: "Energy-dependent" }
    ]
  },
  {
    date: "6/6",
    weekday: "Friday",
    hotel: "Signiel Jamsil",
    theme: "Jamsil, Lotte World Mall, duty-free, flight",
    area: "Jamsil → ICN",
    accent: "#7dc6be",
    icon: <Plane size={19} />,
    items: [
      { time: "Morning", plan: "Seokchon Lake walk / easy breakfast", notes: "Departure-safe" },
      { time: "9:30–10:30am", plan: "Pack / check out / leave bags if needed", notes: "Keep logistics clean" },
      { time: "10:30am–12:15pm", plan: "Lotte World Mall / Avenuel / Lotte Duty Free World Tower", notes: "Main Jamsil shopping block" },
      { time: "12:15–12:45pm", plan: "Food hall / snacks / final bags", notes: "Last-minute gifts" },
      { time: "12:30–1:00pm", plan: "Leave Signiel for airport", notes: "For 4:50pm flight" },
      { time: "4:50pm", plan: "Flight", notes: "Hard anchor", anchor: true }
    ]
  }
];

const flexibleItems = [
  ["Spa Gogyeol", "Locked Thursday 1:30pm"],
  ["Doughroom Gwanghwamun", "Monday backup if you pivot from Niuroumianguan"],
  ["Ggupdang Seongsu", "Potential Wednesday lunch"],
  ["Hanbang Chicken", "Optional Tuesday before Yongsan movie"],
  ["COEX / Starfield Library", "Only if you cut something else"],
  ["Dongdaemun", "Optional Monday night exterior/DDP only"],
  ["Garosu-gil", "Optional/cut unless Thursday opens up"],
  ["Lotte Cinema World Tower", "Backup movie option; primary movie is CGV Yongsan"]
];

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

function ScheduleIllustration() {
  return (
    <div className="scheduleIllustration" aria-hidden="true">
      <div className="paperSun" />
      <div className="routeLine" />
      <div className="paperRiver" />
      <div className="paperTower tall" />
      <div className="paperTower short" />
      <div className="paperShop" />
      <div className="paperTree left" />
      <div className="paperTree right" />
      <div className="paperSuitcase"><Luggage size={28} /></div>
      <div className="paperPlaneMini"><PaperPlaneSvg small /></div>
    </div>
  );
}

function DayScene({ day }: { day: ItineraryDay }) {
  return (
    <div className="dayScene" style={{ "--day-accent": day.accent } as CSSProperties} aria-hidden="true">
      <span className="sceneSun" />
      <span className="scenePath" />
      <span className="sceneHotel" />
      <span className="sceneShop" />
      <span className="sceneTree" />
      <span className="scenePin"><MapPin size={13} /></span>
    </div>
  );
}

function getEventVariant(item: ScheduleItem) {
  const text = `${item.plan} ${item.notes}`.toLowerCase();
  if (/flight|airport|icn/.test(text)) return "flight";
  if (/taxi|head to|leave for|leave signiel|toward/.test(text)) return "transit";
  if (/church/.test(text)) return "church";
  if (/spa|massage/.test(text)) return "spa";
  if (/movie|cgv|cinema|imax|4dx|screenx/.test(text)) return "movie";
  if (/forest|pokémon|pokemon|seokchon|tree/.test(text)) return "forest";
  if (/river|hangang|cheonggyecheon|lake/.test(text)) return "river";
  if (/jewelry|piccadilly/.test(text)) return "jewelry";
  if (/duty-free|shopping|shinsegae|gangnam|namdaemun|burdeng|myeongdong|lotte|hyundai|avenuel|mall|store/.test(text)) return "shopping";
  if (/dumpling|lunch|dinner|wooga|myeon|niuroumianguan|chicken|food|snack|ggupdang/.test(text)) return "dining";
  if (/bakery|fritz|cafe|coffee|salt bread|standard bread|artist bakery|obok/.test(text)) return "cafe";
  if (/bag|luggage|check out|check in|pack|reset|return/.test(text)) return "luggage";
  if (/walk|bukchon|samcheong|anguk|insadong|ikseon|dongdaemun|ddp|garosu|rodeo/.test(text)) return "walk";
  return "place";
}

function EventPaperArt({ item, accent }: { item: ScheduleItem; accent: string }) {
  const variant = getEventVariant(item);
  return (
    <div className={`eventPaperArt ${variant}`} style={{ "--event-accent": accent } as CSSProperties} aria-hidden="true">
      <span className="eventGround" />
      <span className="eventSun" />
      <span className="eventCloud one" />
      <span className="eventCloud two" />
      {variant === "flight" && <span className="eventPlane"><PaperPlaneSvg small /></span>}
      {variant === "transit" && <><span className="eventCar" /><span className="eventRoad" /></>}
      {variant === "church" && <><span className="eventBuilding churchShape" /><span className="eventCross" /></>}
      {variant === "spa" && <><span className="eventBath" /><span className="eventSteam one" /><span className="eventSteam two" /></>}
      {variant === "movie" && <><span className="eventScreen" /><span className="eventSeats" /></>}
      {variant === "forest" && <><span className="eventTree big" /><span className="eventTree small" /><span className="eventBall" /></>}
      {variant === "river" && <><span className="eventRiver" /><span className="eventBridge" /></>}
      {variant === "jewelry" && <><span className="eventGem" /><span className="eventGem small" /><span className="eventCounter" /></>}
      {variant === "shopping" && <><span className="eventShop" /><span className="eventBag one" /><span className="eventBag two" /></>}
      {variant === "dining" && <><span className="eventBowl" /><span className="eventChopsticks" /><span className="eventPlate" /></>}
      {variant === "cafe" && <><span className="eventCup" /><span className="eventPastry" /></>}
      {variant === "luggage" && <><span className="eventSuitcase" /><span className="eventTag" /></>}
      {variant === "walk" && <><span className="eventPath" /><span className="eventPin" /><span className="eventTree small" /></>}
      {variant === "place" && <><span className="eventBuilding" /><span className="eventPin" /></>}
    </div>
  );
}

function ScheduleCard({ day, index }: { day: ItineraryDay; index: number }) {
  const anchors = day.items.filter((item) => item.anchor);
  return (
    <article className="scheduleDayCard" style={{ "--day-accent": day.accent, "--delay": `${index * 60}ms` } as CSSProperties}>
      <div className="scheduleDayTop">
        <div className="dateLeaf">
          <span>{day.weekday}</span>
          <b>{day.date}</b>
        </div>
        <DayScene day={day} />
      </div>
      <div className="scheduleDayTitle">
        <span>{day.icon} {day.hotel}</span>
        <h2>{day.theme}</h2>
        <p><MapPin size={15} /> {day.area}</p>
      </div>
      <div className="scheduleTimeline">
        {day.items.map((item) => (
          <div className={`scheduleRow ${item.anchor ? "anchor" : ""}`} key={`${day.date}-${item.time}-${item.plan}`}>
            <time>{item.time}</time>
            <EventPaperArt item={item} accent={day.accent} />
            <div>
              <b>{item.plan}</b>
              <span>{item.notes}</span>
            </div>
          </div>
        ))}
      </div>
      {anchors.length > 0 && (
        <div className="anchorRibbon">
          <Clock size={15} />
          <span>{anchors.length} fixed {anchors.length === 1 ? "anchor" : "anchors"}</span>
        </div>
      )}
    </article>
  );
}

function ScheduleHome() {
  const hardAnchors = itineraryDays.flatMap((day) => day.items.filter((item) => item.anchor).map((item) => ({
    day: `${day.weekday} ${day.date}`,
    accent: day.accent,
    ...item
  })));

  return (
    <div className="scheduleHome">
      <section className="scheduleHero">
        <div className="scheduleHeroCopy">
          <span className="scheduleKicker"><CalendarDays size={15} /> Sunday–Friday Seoul itinerary</span>
          <h1>Seoul Trip Schedule</h1>
          <p>Four Seasons first, Signiel second, with the shopping, food, luggage, and family anchors laid out by day.</p>
          <div className="scheduleStats">
            <span><b>6</b> days</span>
            <span><b>2</b> hotels</span>
            <span><b>{hardAnchors.length}</b> anchors</span>
          </div>
        </div>
        <ScheduleIllustration />
      </section>

      <section className="scheduleOverview" aria-label="High-level trip structure">
        {itineraryDays.map((day) => (
          <a className="overviewChip" href={`#day-${day.date.replace("/", "-")}`} key={day.date} style={{ "--day-accent": day.accent } as CSSProperties}>
            <span>{day.weekday.slice(0, 3)} {day.date}</span>
            <b>{day.hotel}</b>
            <small>{day.area}</small>
          </a>
        ))}
      </section>

      <section className="scheduleGrid">
        {itineraryDays.map((day, index) => (
          <div id={`day-${day.date.replace("/", "-")}`} key={day.date}>
            <ScheduleCard day={day} index={index} />
          </div>
        ))}
      </section>

      <section className="scheduleSupport">
        <div className="hardAnchorsPanel">
          <h2>Hard Anchors</h2>
          <div className="hardAnchorList">
            {hardAnchors.map((anchor) => (
              <div className="hardAnchor" key={`${anchor.day}-${anchor.time}-${anchor.plan}`}>
                <i style={{ background: anchor.accent }} />
                <span>{anchor.day}</span>
                <time>{anchor.time}</time>
                <b>{anchor.plan}</b>
              </div>
            ))}
          </div>
        </div>

        <div className="flexPanel">
          <h2>Flexible Items</h2>
          {flexibleItems.map(([item, placement]) => (
            <p key={item}><b>{item}</b><span>{placement}</span></p>
          ))}
        </div>
      </section>
    </div>
  );
}

function BudgetDashboard({
  transactions,
  generatedAt,
  summary,
  total,
  latest,
  onSelect
}: {
  transactions: NormalizedExpense[];
  generatedAt: string | null;
  summary: TripSummary;
  total: number;
  latest: NormalizedExpense[];
  onSelect: (expense: NormalizedExpense) => void;
}) {
  return (
    <div className="budgetDashboard">
      <div className="dashboardHeader">
        <div>
          <h1>Budget Check</h1>
          <p>Live Seoul trip finance tracker <span><RefreshCw size={15}/> {generatedAt ? `Last refresh ${new Date(generatedAt).toLocaleTimeString()}` : "Refreshing every 60 seconds"}</span></p>
        </div>
        <PaperSkyline />
      </div>

      <div className="chips">
        {categories.map((c) => <button key={c} className={c === "Flights" ? "selected" : ""}>{iconByCategory[c]} {c}</button>)}
      </div>

      <div className="contentGrid">
        <div className="leftContent">
          <FlightHero transactions={transactions} onSelect={onSelect} />
          <div className="cardsGrid">
            {transactions.filter(t => t.category !== "Flights").map((t) => <VisualCard key={t.id} expense={t} onSelect={onSelect} />)}
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
    </div>
  );
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<NormalizedExpense[]>(seedTransactions);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [selected, setSelected] = useState<NormalizedExpense | null>(null);
  const [activeTab, setActiveTab] = useState<"schedule" | "budget">("schedule");
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
          <div className="brand">Seoul Trip <span><Lock size={14}/> Protected</span></div>
          <div className="siteTabs" role="tablist" aria-label="Seoul dashboard sections">
            <button type="button" role="tab" aria-selected={activeTab === "schedule"} className={activeTab === "schedule" ? "active" : ""} onClick={() => setActiveTab("schedule")}><CalendarDays size={16} /> Schedule</button>
            <button type="button" role="tab" aria-selected={activeTab === "budget"} className={activeTab === "budget" ? "active" : ""} onClick={() => setActiveTab("budget")}><CreditCard size={16} /> Budget check</button>
          </div>
          <div className="user"><Bell size={19}/><span><RefreshCw size={17} /></span> Live</div>
        </header>

        {activeTab === "schedule" ? (
          <ScheduleHome />
        ) : (
          <BudgetDashboard
            transactions={transactions}
            generatedAt={generatedAt}
            summary={summary}
            total={total}
            latest={latest}
            onSelect={setSelected}
          />
        )}
      </section>
      {selected && <DetailPanel expense={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}
