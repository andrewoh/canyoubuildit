"use client";

import { useEffect, useMemo, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
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
  art: string;
  artLabel: string;
  anchor?: boolean;
};

type EventRecommendation = {
  title: string;
  tips: string[];
  note: string;
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

function scheduleItem(time: string, plan: string, notes: string, art: string, artLabel: string, anchor = false): ScheduleItem {
  return { time, plan, notes, art, artLabel, ...(anchor ? { anchor: true } : {}) };
}

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
      scheduleItem("Early morning", "Arrive Seoul → Four Seasons Seoul", "Drop bags / check in if possible", "four-seasons-arrival", "FS"),
      scheduleItem("9:30–9:45am", "Leave for Seocho Station area", "Taxi likely easiest", "seocho-taxi", "Seocho"),
      scheduleItem("10:20am", "Church near Seocho Station", "Hard anchor", "seocho-church", "Church", true),
      scheduleItem("11:45am–12:20pm", "Head to Shinsegae Gangnam / House of Shinsegae", "Short ride from Seocho", "shinsegae-approach", "Shinsegae"),
      scheduleItem("12:30pm", "Yoon Haeundae Seoul reservation", "Hard anchor", "yoon-haeundae", "Yoon", true),
      scheduleItem("1:45–2:45pm", "Shinsegae Gangnam / Central City shopping", "Mall + department store block", "central-city", "Central"),
      scheduleItem("3:00–4:30pm", "Gangnam Station / Gangnam-daero", "Mainstream shopping block", "gangnam-daero", "Gangnam"),
      scheduleItem("5:00pm onward", "Banpo Hangang Park / Sebitseom", "Best Han River fit for this day", "banpo-hangang", "Banpo"),
      scheduleItem("Night", "Return to Four Seasons", "Keep flexible depending on jet lag", "four-seasons-night", "FS")
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
      scheduleItem("Morning", "Artist Bakery Anguk", "Bakery anchor", "artist-bakery", "Artist"),
      scheduleItem("Morning", "Bukchon / Samcheong / Anguk walk", "Palace-adjacent neighborhoods", "bukchon-hanok", "Bukchon"),
      scheduleItem("Late morning", "Fritz Wonseo", "Fritz #1", "fritz-wonseo", "Fritz"),
      scheduleItem("1:00pm", "Niuroumianguan Gwanghwamun reservation", "Hard lunch anchor", "niuroumianguan", "Noodle", true),
      scheduleItem("Backup", "Doughroom Gwanghwamun", "Keep if pivoting to Italian", "doughroom", "Dough"),
      scheduleItem("2:15–3:15pm", "Insadong / Ikseon-dong", "Light browsing", "insadong-ikseon", "Ikseon"),
      scheduleItem("3:15–4:30pm", "Jongno Jewelry District / Piccadilly-Jongno 3-ga", "Jewelry district browse", "jongno-jewelry", "Jongno"),
      scheduleItem("4:30–5:30pm", "Jayeondo Salt Bread Ikseon-dong", "Salt bread / cafe break", "jayeondo-salt", "Salt"),
      scheduleItem("Evening", "Dinner flexible around Jongno / Euljiro", "Keep easy", "euljiro-dinner", "Euljiro"),
      scheduleItem("Night", "Cheonggyecheon lit-up walk", "Best night attraction this day", "cheonggyecheon", "Stream"),
      scheduleItem("Optional late", "Dongdaemun / DDP exterior only", "Skip if tired", "ddp-exterior", "DDP")
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
      scheduleItem("9:00–9:25am", "Gamegol handmade jumbo dumplings", "Dine in if possible", "gamegol-dumplings", "Gamegol", true),
      scheduleItem("9:30am–12:30pm", "Namdaemun Market + Burdeng children's clothing", "Protected 3-hour shopping block", "namdaemun-burdeng", "Namdaemun"),
      scheduleItem("12:30–1:15pm", "Snack / quick lunch / reset", "Use as buffer", "namdaemun-snack", "Snack"),
      scheduleItem("1:30–3:30pm", "Myeongdong duty-free loop", "Lotte and Shinsegae duty-free / department stores", "myeongdong-dutyfree", "Duty Free"),
      scheduleItem("3:30–4:30pm", "Drop bags / reset at Four Seasons", "Important after shopping", "four-seasons-reset", "FS"),
      scheduleItem("4:30–6:30pm", "Optional Hannam-dong / Hanbang Chicken", "Cut if day is too full", "hanbang-chicken", "Hanbang"),
      scheduleItem("7:00–9:00pm", "Yongsan I'Park Mall shopping + Pokémon store", "Bake in shopping before movie", "yongsan-pokemon", "Yongsan"),
      scheduleItem("9:00pm+", "CGV Yongsan I'Park Mall movie", "Prioritize IMAX / 4DX / ScreenX", "cgv-yongsan", "CGV")
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
      scheduleItem("9:30–10:00am", "Check out Four Seasons", "Take luggage with you", "four-seasons-checkout", "FS"),
      scheduleItem("10:00–10:45am", "Taxi to Signiel Jamsil", "Luggage-first redesign", "taxi-signiel", "Jamsil"),
      scheduleItem("10:45–11:15am", "Drop bags at Signiel / check in if possible", "Avoid carrying bags all day", "signiel-bagdrop", "Signiel"),
      scheduleItem("11:15am–12:00pm", "Head to Seongsu", "East Seoul day", "seongsu-arrival", "Seongsu"),
      scheduleItem("12:00–1:30pm", "Lunch in Seongsu", "Ggupdang Seongsu is a potential pork lunch spot", "ggupdang-seongsu", "Ggupdang"),
      scheduleItem("1:30–2:30pm", "Obok Rice Cake + Seongsu browsing", "Food + neighborhood anchor", "obok-ricecake", "Obok"),
      scheduleItem("2:30–3:45pm", "Seoul Forest + Pokémon Secret Forest exhibit", "Key attraction", "seoul-forest-pokemon", "Forest"),
      scheduleItem("3:45–4:30pm", "Standard Bread Seongsu / cafe", "Bakery anchor", "standard-bread", "Bread"),
      scheduleItem("4:30–5:30pm", "Return to Signiel / reset", "Buffer before dinner", "signiel-reset", "Signiel"),
      scheduleItem("6:00pm", "Family dinner near Jamsil", "Bookmark / soft-hard anchor", "jamsil-family-dinner", "Jamsil", true),
      scheduleItem("After dinner", "Optional Lotte World Mall / Seokchon Lake", "Keep relaxed", "seokchon-lotte", "Lake")
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
      scheduleItem("9:45–10:00am", "Leave Signiel", "Taxi to Apgujeong/Cheongdam", "signiel-depart", "Signiel"),
      scheduleItem("10:45am", "Arrive at Myeon Seoul", "Hard arrival target", "myeon-seoul", "Myeon", true),
      scheduleItem("11:00am–12:15pm", "Myeon Seoul lunch", "Keep pace comfortable", "myeon-lunch", "Myeon"),
      scheduleItem("12:15–1:10pm", "Buffer / coffee / short walk toward spa", "Do not overpack", "cheongdam-buffer", "Cheongdam"),
      scheduleItem("1:15pm", "Arrive at Spa Gogyeol Cheongdam", "Check-in buffer", "spa-gogyeol-arrival", "Spa"),
      scheduleItem("1:30–3:00pm", "Spa Gogyeol massage", "Hard anchor", "spa-gogyeol", "Gogyeol", true),
      scheduleItem("3:00–3:30pm", "Change / tea / checkout", "Realistic spa buffer", "spa-tea", "Tea"),
      scheduleItem("3:45–5:15pm", "Hyundai Department Store Apgujeong Main", "Main shopping block", "hyundai-apgujeong", "Hyundai"),
      scheduleItem("5:15–5:40pm", "Head toward Wooga / buffer", "Avoid rushing", "wooga-approach", "Wooga"),
      scheduleItem("6:00pm", "Wooga reservation", "Hard dinner anchor", "wooga", "Wooga", true),
      scheduleItem("After dinner", "Optional Cheongdam / Apgujeong Rodeo walk", "Energy-dependent", "apgujeong-rodeo", "Rodeo")
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
      scheduleItem("Morning", "Seokchon Lake walk / easy breakfast", "Departure-safe", "seokchon-morning", "Lake"),
      scheduleItem("9:30–10:30am", "Pack / check out / leave bags if needed", "Keep logistics clean", "signiel-checkout", "Signiel"),
      scheduleItem("10:30am–12:15pm", "Lotte World Mall / Avenuel / Lotte Duty Free World Tower", "Main Jamsil shopping block", "lotte-world-mall", "Lotte"),
      scheduleItem("12:15–12:45pm", "Food hall / snacks / final bags", "Last-minute gifts", "lotte-foodhall", "Foodhall"),
      scheduleItem("12:30–1:00pm", "Leave Signiel for airport", "For 4:50pm flight", "airport-taxi", "ICN"),
      scheduleItem("4:50pm", "Flight", "Hard anchor", "icn-flight", "ICN", true)
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

const eventArtImages: Partial<Record<string, string>> = {
  "four-seasons-arrival": "/seoul-art/four-seasons-seoul-arrival.jpg",
  "four-seasons-night": "/seoul-art/four-seasons-seoul-arrival.jpg",
  "four-seasons-reset": "/seoul-art/four-seasons-seoul-arrival.jpg",
  "four-seasons-checkout": "/seoul-art/four-seasons-seoul-arrival.jpg",
  "seocho-taxi": "/seoul-art/seocho-church.jpg",
  "seocho-church": "/seoul-art/seocho-church.jpg",
  "shinsegae-approach": "/seoul-art/shinsegae-gangnam.jpg",
  "central-city": "/seoul-art/shinsegae-gangnam.jpg",
  "gangnam-daero": "/seoul-art/shinsegae-gangnam.jpg",
  "banpo-hangang": "/seoul-art/banpo-hangang-sebitseom.jpg",
  "yoon-haeundae": "/seoul-art/yoon-haeundae.jpg",
  "artist-bakery": "/seoul-art/artist-bakery-anguk.jpg",
  "bukchon-hanok": "/seoul-art/bukchon-anguk-hanok.jpg",
  "fritz-wonseo": "/seoul-art/fritz-wonseo-cafe.jpg",
  "niuroumianguan": "/seoul-art/niuroumianguan-gwanghwamun.jpg",
  "doughroom": "/seoul-art/myeon-seoul-cheongdam.jpg",
  "insadong-ikseon": "/seoul-art/bukchon-anguk-hanok.jpg",
  "jongno-jewelry": "/seoul-art/jongno-jewelry-district.jpg",
  "jayeondo-salt": "/seoul-art/artist-bakery-anguk.jpg",
  "euljiro-dinner": "/seoul-art/yoon-haeundae.jpg",
  "cheonggyecheon": "/seoul-art/cheonggyecheon-night.jpg",
  "ddp-exterior": "/seoul-art/bukchon-anguk-hanok.jpg",
  "gamegol-dumplings": "/seoul-art/gamegol-dumplings.jpg",
  "namdaemun-burdeng": "/seoul-art/namdaemun-burdeng.jpg",
  "namdaemun-snack": "/seoul-art/gamegol-dumplings.jpg",
  "myeongdong-dutyfree": "/seoul-art/myeongdong-duty-free.jpg",
  "hanbang-chicken": "/seoul-art/yoon-haeundae.jpg",
  "yongsan-pokemon": "/seoul-art/yongsan-mall-cinema.jpg",
  "cgv-yongsan": "/seoul-art/yongsan-mall-cinema.jpg",
  "taxi-signiel": "/seoul-art/signiel-jamsil-lotte-tower.jpg",
  "signiel-bagdrop": "/seoul-art/signiel-jamsil-lotte-tower.jpg",
  "seongsu-arrival": "/seoul-art/seongsu-cafes-ricecake.jpg",
  "ggupdang-seongsu": "/seoul-art/yoon-haeundae.jpg",
  "obok-ricecake": "/seoul-art/seongsu-cafes-ricecake.jpg",
  "seoul-forest-pokemon": "/seoul-art/seoul-forest-collectible-exhibit.jpg",
  "standard-bread": "/seoul-art/seongsu-cafes-ricecake.jpg",
  "signiel-reset": "/seoul-art/signiel-jamsil-lotte-tower.jpg",
  "jamsil-family-dinner": "/seoul-art/wooga-kbbq.jpg",
  "seokchon-lotte": "/seoul-art/lotte-world-mall-seokchon.jpg",
  "signiel-depart": "/seoul-art/signiel-jamsil-lotte-tower.jpg",
  "myeon-seoul": "/seoul-art/myeon-seoul-cheongdam.jpg",
  "myeon-lunch": "/seoul-art/myeon-seoul-cheongdam.jpg",
  "cheongdam-buffer": "/seoul-art/myeon-seoul-cheongdam.jpg",
  "spa-gogyeol-arrival": "/seoul-art/spa-gogyeol-cheongdam.jpg",
  "spa-gogyeol": "/seoul-art/spa-gogyeol-cheongdam.jpg",
  "spa-tea": "/seoul-art/spa-gogyeol-cheongdam.jpg",
  "hyundai-apgujeong": "/seoul-art/hyundai-apgujeong.jpg",
  "wooga-approach": "/seoul-art/wooga-kbbq.jpg",
  "wooga": "/seoul-art/wooga-kbbq.jpg",
  "apgujeong-rodeo": "/seoul-art/hyundai-apgujeong.jpg",
  "seokchon-morning": "/seoul-art/lotte-world-mall-seokchon.jpg",
  "signiel-checkout": "/seoul-art/signiel-jamsil-lotte-tower.jpg",
  "lotte-world-mall": "/seoul-art/lotte-world-mall-seokchon.jpg",
  "lotte-foodhall": "/seoul-art/lotte-world-mall-seokchon.jpg",
  "airport-taxi": "/seoul-art/icn-flight-departure.jpg",
  "icn-flight": "/seoul-art/icn-flight-departure.jpg"
};

const eventRecommendations: Record<string, EventRecommendation> = {
  "four-seasons-arrival": { title: "Arrival playbook", tips: ["Ask the front desk to text when the room is ready.", "Leave one small day bag accessible before handing off luggage.", "Use the lobby restroom and water reset before heading to Seocho."], note: "If the room is not ready, treat the hotel as a luggage base and keep moving." },
  "seocho-taxi": { title: "Taxi strategy", tips: ["Use the hotel taxi stand if available for easier destination handling.", "Have Seocho Station and the church address saved in Korean.", "Budget a little extra buffer for Sunday traffic around Gangnam."], note: "This leg is about removing friction, not saving a few minutes." },
  "seocho-church": { title: "Church arrival tips", tips: ["Arrive 10 minutes early so the taxi drop-off does not feel rushed.", "Keep bags minimal and phones quiet before entering.", "After service, request the next stop as Shinsegae Gangnam or Central City."], note: "This is a hard anchor, so protect it from breakfast or shopping drift." },
  "shinsegae-approach": { title: "Shinsegae entry plan", tips: ["Start with House of Shinsegae before the broader mall.", "Photo anything you may want to compare later.", "Confirm the lunch route before browsing."], note: "Use this as a polished warm-up, not a full shopping sprint." },
  "yoon-haeundae": { title: "What to order", tips: ["Prioritize the signature grilled seafood or fish set if available.", "Add a soup or stew if the table wants something soothing post-flight.", "Keep the meal steady so the afternoon shopping block does not slip."], note: "Good first proper meal: satisfying without being too heavy." },
  "central-city": { title: "Shopping priorities", tips: ["Use Central City for compact department-store browsing.", "Save receipts together for easier tax-refund handling later.", "Set a hard exit time before Gangnam Station."], note: "This is best as a focused pass, not a treasure hunt." },
  "gangnam-daero": { title: "Gangnam-daero pass", tips: ["Browse mainstream beauty, fashion, and quick accessories first.", "Keep purchases light because Banpo is next.", "Use underground or side-street routes if the main street feels crowded."], note: "This stop works best when it stays casual and exploratory." },
  "banpo-hangang": { title: "Banpo river tips", tips: ["Aim for golden hour into dusk if energy holds.", "Pick up drinks or snacks before settling by the river.", "Sebitseom is the better visual anchor for photos."], note: "Cut this short if jet lag hits. It should feel restful." },
  "four-seasons-night": { title: "Hotel reset", tips: ["Ask housekeeping for extra water before sleeping.", "Set out tomorrow's light walking clothes now.", "Charge battery packs and confirm Monday lunch reservation details."], note: "Tonight is about making Monday easy." },
  "artist-bakery": { title: "Bakery order list", tips: ["Try milk bread or salt bread-style items first.", "Choose one laminated pastry to share while it is fresh.", "Buy a small extra item for later instead of over-ordering breakfast."], note: "Go early; the best pastry cases look very different after the rush." },
  "bukchon-hanok": { title: "Walk route tips", tips: ["Keep voices low in residential hanok lanes.", "Prioritize small alleys and roofline views over checking every shop.", "Use Anguk as the anchor if you need to reset or call a taxi."], note: "This is one of the best slow-photo windows of the trip." },
  "fritz-wonseo": { title: "Cafe move", tips: ["Order one coffee and one baked item to share.", "Use the cafe stop to check walking distance to lunch.", "If crowded, take the coffee to-go and keep the neighborhood walk going."], note: "Treat it as a recharge, not a long sit-down." },
  "niuroumianguan": { title: "Noodle table picks", tips: ["Get the signature beef noodle soup if it is your first visit.", "Add cucumber or a bright side to cut the richness.", "Keep one lighter backup dish if the morning pastries were filling."], note: "Hard lunch anchor: arrive a few minutes early." },
  "doughroom": { title: "Backup pivot", tips: ["Use this only if the noodle plan falls through or cravings change.", "Pick a pasta that contrasts with Korean food-heavy days.", "Do not let the backup add extra transit time."], note: "A backup should simplify the day, not create a new plan." },
  "insadong-ikseon": { title: "Browsing tips", tips: ["Look for small ceramics, paper goods, and gifts here.", "Keep the route light because Jongno Jewelry is protected next.", "Use Ikseon-dong as the snack-and-photo portion."], note: "This is a pleasant filler block, not a must-complete checklist." },
  "jongno-jewelry": { title: "Jewelry district tips", tips: ["Compare two or three shops before getting serious.", "Ask about resizing timing before falling for a piece.", "Photograph item details and prices for decision clarity."], note: "Best approached calmly; the value is in comparison." },
  "jayeondo-salt": { title: "Salt bread stop", tips: ["Try the classic salt bread first before sweeter options.", "Buy only what you can eat fresh that day.", "Use this as the pre-evening reset before the lit stream walk."], note: "Simple is the point here." },
  "euljiro-dinner": { title: "Flexible dinner", tips: ["Pick something close to wherever you finish browsing.", "Favor a place with minimal wait over a famous detour.", "Keep room for the Cheonggyecheon walk afterward."], note: "The win is an easy dinner that preserves the night." },
  "cheonggyecheon": { title: "Night walk tips", tips: ["Enter near a well-lit central access point.", "Walk one section slowly instead of trying to cover the whole stream.", "Use bridges and stepping stones for the best photos."], note: "Great low-effort night attraction if everyone still has energy." },
  "ddp-exterior": { title: "DDP optional", tips: ["Keep this exterior-only if it is late.", "Use it for architecture photos, not shopping.", "Skip without guilt if Cheonggyecheon feels like enough."], note: "Optional means truly optional." },
  "gamegol-dumplings": { title: "Dumpling order", tips: ["Go for the handmade jumbo dumplings first.", "Dine in if seating is reasonable to avoid messy takeout.", "Order modestly because Namdaemun browsing starts right after."], note: "Early arrival is the whole trick." },
  "namdaemun-burdeng": { title: "Market shopping plan", tips: ["Start with children's clothing while decision energy is high.", "Photograph sizes and prices before buying multiples.", "Keep purchases consolidated in one tote."], note: "This is the protected shopping block; do not rush it." },
  "namdaemun-snack": { title: "Snack reset", tips: ["Choose something portable and not too filling.", "Use the buffer to organize bags and receipts.", "Check duty-free store hours before leaving the area."], note: "A reset block protects the rest of Tuesday." },
  "myeongdong-dutyfree": { title: "Duty-free priorities", tips: ["Start with known beauty or skincare targets.", "Keep passport/payment card easy to access.", "Compare Lotte and Shinsegae only on items that matter."], note: "The goal is efficient buying, not browsing every floor." },
  "four-seasons-reset": { title: "Bag drop reset", tips: ["Separate fragile purchases before heading back out.", "Refill water and battery packs.", "Decide now whether Hannam is still realistic."], note: "This stop prevents Tuesday from becoming a carry-everything day." },
  "hanbang-chicken": { title: "Optional chicken call", tips: ["Only go if the shopping day stayed on schedule.", "Order the signature chicken or soup-style dish if available.", "Skip if it compresses Yongsan movie time."], note: "This is the easiest cut item Tuesday." },
  "yongsan-pokemon": { title: "Yongsan mall plan", tips: ["Do the collectible store before the movie so it does not close on you.", "Check theater format and showtime before browsing.", "Use the mall for any last easy snacks."], note: "This block should orbit the movie time." },
  "cgv-yongsan": { title: "Cinema tips", tips: ["Prioritize IMAX, 4DX, or ScreenX if the showtime works.", "Buy snacks before the final boarding rush into the theater.", "Leave enough time after the movie for an easy taxi back."], note: "Make the format the reason to go." },
  "four-seasons-checkout": { title: "Checkout move", tips: ["Pack purchases into luggage before breakfast energy fades.", "Do a room sweep for chargers and passports.", "Keep one small bag with essentials for the transfer."], note: "The goal is a clean hotel change, not an elegant morning." },
  "taxi-signiel": { title: "Transfer strategy", tips: ["Go luggage-first to Signiel before Seongsu.", "Confirm the destination as Lotte World Tower or Signiel Seoul.", "Use the taxi ride to review the Seongsu route."], note: "This is the redesign that keeps Wednesday sane." },
  "signiel-bagdrop": { title: "Signiel arrival tips", tips: ["Ask whether early check-in is possible without waiting around.", "Leave bags and confirm evening return logistics.", "Take note of the elevator/lobby route for later."], note: "Do not carry luggage into Seongsu." },
  "seongsu-arrival": { title: "Seongsu route", tips: ["Choose one main cafe/shopping street instead of zigzagging.", "Save Seoul Forest for the dedicated exhibit block.", "Keep lunch close to the browsing path."], note: "Seongsu rewards wandering, but only inside a loose boundary." },
  "ggupdang-seongsu": { title: "Pork lunch tips", tips: ["Order the signature pork cut and one shared side.", "Keep lunch early enough to leave room for bakery stops.", "If the wait is long, pivot quickly rather than burning the afternoon."], note: "This is a candidate, not a day-breaker." },
  "obok-ricecake": { title: "Rice cake stop", tips: ["Try one fresh rice cake item before buying boxed gifts.", "Ask what travels best if you want to bring some back.", "Pair it with a short browse nearby, not a long detour."], note: "Fresh texture matters here." },
  "seoul-forest-pokemon": { title: "Forest exhibit tips", tips: ["Check entry timing before leaving Seongsu browsing.", "Use Seoul Forest paths for a calmer break after shops.", "Prioritize photos and the exhibit over trying to add another neighborhood."], note: "This is the reason Wednesday stays Seongsu-focused." },
  "standard-bread": { title: "Bakery reset", tips: ["Pick one signature bread and one drink if energy dips.", "Use the cafe stop to decide return timing to Signiel.", "Avoid overbuying before family dinner."], note: "This is a buffer disguised as a treat." },
  "signiel-reset": { title: "Pre-dinner reset", tips: ["Check in fully if the room is ready.", "Freshen up and repack any Seongsu purchases.", "Confirm dinner address before leaving again."], note: "Protect this buffer before the family dinner." },
  "jamsil-family-dinner": { title: "Dinner notes", tips: ["Arrive a little early because Jamsil complexes can be confusing.", "Choose shareable dishes if family ordering is flexible.", "Save nearby mall or lake walk as a post-dinner option."], note: "Soft-hard anchor: keep the evening relaxed around it." },
  "seokchon-lotte": { title: "After-dinner options", tips: ["Walk Seokchon Lake if the weather is good.", "Use Lotte World Mall for low-effort browsing.", "Skip extra shopping if Thursday needs an early start."], note: "This is a wind-down, not another mission." },
  "signiel-depart": { title: "Morning departure", tips: ["Leave Signiel with enough Cheongdam taxi buffer.", "Keep spa clothes or comfortable outfit in mind.", "Bring only what you need for the Apgujeong day."], note: "Thursday has hard anchors; start clean." },
  "myeon-seoul": { title: "Myeon arrival tips", tips: ["Arrive at 10:45am and do not squeeze in another stop first.", "Ask what the signature noodle dish is that day.", "Keep lunch comfortable because spa follows soon after."], note: "This is a hard arrival target." },
  "myeon-lunch": { title: "What to order", tips: ["Start with the signature noodle or broth-focused dish.", "Add one simple side rather than over-ordering.", "Finish with enough time for a calm spa transfer."], note: "Pace matters more than maximizing dishes." },
  "cheongdam-buffer": { title: "Buffer use", tips: ["Coffee or a short walk is enough.", "Confirm Spa Gogyeol travel time before sitting down.", "Avoid shopping bags before the massage."], note: "The buffer exists so the spa feels calm." },
  "spa-gogyeol-arrival": { title: "Spa check-in", tips: ["Arrive early enough for forms and changing.", "Mention pressure preferences before the treatment starts.", "Silence notifications and make this a true reset."], note: "This is one of the trip's best slow blocks." },
  "spa-gogyeol": { title: "Massage tips", tips: ["Ask for lower pressure if travel soreness is high.", "Drink water afterward before shopping.", "Do not schedule a tight taxi immediately after the treatment."], note: "Let the spa actually decompress the day." },
  "spa-tea": { title: "Post-spa buffer", tips: ["Use the tea/check-out time instead of rushing out.", "Reorient before Hyundai Apgujeong.", "Keep receipts and valuables together before shopping again."], note: "A slow exit protects the rest of the evening." },
  "hyundai-apgujeong": { title: "Hyundai shopping tips", tips: ["Start with the floors or brands you already care about.", "Use the food/cafe areas only if dinner timing allows.", "Keep Wooga travel time visible."], note: "This is the main Thursday shopping block." },
  "wooga-approach": { title: "Pre-dinner move", tips: ["Leave Hyundai before you feel rushed.", "Check traffic around Apgujeong/Cheongdam.", "Arrive near Wooga early and walk nearby if needed."], note: "This transition protects the 6pm reservation." },
  "wooga": { title: "Korean BBQ order", tips: ["Prioritize the signature beef cuts first.", "Add one stew or rice dish if the table wants comfort food.", "Let staff handle grill timing if offered."], note: "Hard dinner anchor: do not arrive hungry and rushed." },
  "apgujeong-rodeo": { title: "After-dinner walk", tips: ["Keep it to a short atmosphere walk unless energy is high.", "Use this for window shopping and photos.", "Taxi back if the day feels complete."], note: "A graceful optional ending." },
  "seokchon-morning": { title: "Departure-safe morning", tips: ["Keep the lake walk short and close to the hotel.", "Do breakfast nearby rather than adding transit.", "Check weather before committing to the loop."], note: "Friday is about protecting the flight." },
  "signiel-checkout": { title: "Checkout checklist", tips: ["Pack gifts where they will survive the flight.", "Confirm airport departure time before leaving bags.", "Do one passport/charger sweep."], note: "Clean logistics beat last-minute sightseeing." },
  "lotte-world-mall": { title: "Final shopping pass", tips: ["Prioritize Avenuel, duty-free, and specific gifts.", "Keep purchases carry-on friendly.", "Set a departure alarm before entering the mall."], note: "This is the last controlled shopping window." },
  "lotte-foodhall": { title: "Food hall strategy", tips: ["Buy sturdy snacks and gifts, not messy fresh food.", "Eat something light before the airport ride.", "Leave time to retrieve bags without rushing."], note: "Small wins only; the airport clock is real." },
  "airport-taxi": { title: "Airport transfer", tips: ["Leave closer to 12:30pm if bags or traffic feel uncertain.", "Keep passports and flight info outside packed luggage.", "Use the ride to check terminal, bags, and seats."], note: "For a 4:50pm flight, the early side is the comfortable side." },
  "icn-flight": { title: "Flight checklist", tips: ["Arrive with time for tax refund or duty-free pickup if needed.", "Buy water after security and settle snacks before boarding.", "Keep baby/travel essentials reachable at the seat."], note: "The goal is a calm exit from Seoul." }
};

function EventPaperArt({ item, accent, large = false }: { item: ScheduleItem; accent: string; large?: boolean }) {
  const image = eventArtImages[item.art];

  if (large && image) {
    return (
      <div className="eventPhotoArt" style={{ "--event-accent": accent } as CSSProperties} aria-hidden="true">
        <img src={image} alt="" loading="lazy" />
        <span>{item.artLabel}</span>
      </div>
    );
  }

  return (
    <div className={`eventPaperArt ${large ? "large" : ""} art-${item.art}`} style={{ "--event-accent": accent } as CSSProperties} aria-hidden="true">
      <span className="paperBackdrop" />
      <span className="paperWater" />
      <span className="paperRoute" />
      <span className="paperLandmark" />
      <span className="paperDetail one" />
      <span className="paperDetail two" />
      <span className="paperDetail three" />
      <span className="paperLabel">{item.artLabel}</span>
    </div>
  );
}

function EventCard({ item, day, index }: { item: ScheduleItem; day: ItineraryDay; index: number }) {
  const [flipped, setFlipped] = useState(false);
  const recommendation = eventRecommendations[item.art];
  const label = flipped ? `Show art for ${item.plan}` : `Show recommendations for ${item.plan}`;
  const toggle = () => setFlipped((value) => !value);
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    }
  };

  return (
    <article
      aria-label={label}
      aria-pressed={flipped}
      className={`eventCard ${item.anchor ? "anchor" : ""} ${flipped ? "flipped" : ""}`}
      onClick={toggle}
      onKeyDown={handleKeyDown}
      role="button"
      style={{ "--day-accent": day.accent, "--delay": `${index * 45}ms` } as CSSProperties}
      tabIndex={0}
    >
      <div className="eventCardInner">
        <div className="eventCardFace eventCardFront">
          <EventPaperArt item={item} accent={day.accent} large />
          <span className="flipCue"><Sparkles size={13} /> Flip for tips</span>
          <div className="eventCardBody">
            <div className="eventMeta">
              <time>{item.time}</time>
              {item.anchor && <span>Fixed anchor</span>}
            </div>
            <h3>{item.plan}</h3>
            <p>{item.notes}</p>
          </div>
        </div>
        <div className="eventCardFace eventCardBack" aria-hidden={!flipped}>
          <div className="recommendationPaper">
            <div className="eventMeta">
              <time>{item.time}</time>
              <span>{item.artLabel}</span>
            </div>
            <span className="recKicker"><Sparkles size={14} /> Recommendations</span>
            <h3>{recommendation.title}</h3>
            <ul>
              {recommendation.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
            <p>{recommendation.note}</p>
            <small>Tap or press Enter to return to the art.</small>
          </div>
        </div>
      </div>
    </article>
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
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const selectedDay = itineraryDays[selectedDayIndex];
  const selectedAnchors = selectedDay.items.filter((item) => item.anchor);
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

      <section className="daySelector" aria-label="Select itinerary day">
        {itineraryDays.map((day, index) => (
          <button
            className={index === selectedDayIndex ? "active" : ""}
            key={day.date}
            onClick={() => setSelectedDayIndex(index)}
            style={{ "--day-accent": day.accent } as CSSProperties}
            type="button"
          >
            <span>{day.weekday.slice(0, 3)} {day.date}</span>
            <b>{day.hotel}</b>
            <small>{day.area}</small>
          </button>
        ))}
      </section>

      <section className="selectedDayPanel" style={{ "--day-accent": selectedDay.accent } as CSSProperties}>
        <div className="selectedDayHeader">
          <div className="dateLeaf">
            <span>{selectedDay.weekday}</span>
            <b>{selectedDay.date}</b>
          </div>
          <div className="selectedDayCopy">
            <span>{selectedDay.icon} {selectedDay.hotel}</span>
            <h2>{selectedDay.theme}</h2>
            <p><MapPin size={15} /> {selectedDay.area}</p>
          </div>
          <DayScene day={selectedDay} />
          {selectedAnchors.length > 0 && (
            <div className="selectedAnchorRibbon">
              <Clock size={15} />
              <span>{selectedAnchors.length} fixed {selectedAnchors.length === 1 ? "anchor" : "anchors"}</span>
            </div>
          )}
        </div>
        <div className="eventCardsGrid">
          {selectedDay.items.map((item, index) => (
            <EventCard day={selectedDay} index={index} item={item} key={`${selectedDay.date}-${item.time}-${item.plan}`} />
          ))}
        </div>
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
