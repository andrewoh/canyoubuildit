import type { ReactNode } from 'react';
import type { FeedPin } from './pins';
import './pin-art.css';

const jersey = '/feed/niners-jersey.webp';

// SF season indices from data/portfolio-injuries.json, 2017–2025. The
// cover needs only nine points. The full dataset loads in the open pin.
const sfSeries = [131.3, 131.25, 126.32, 227.42, 147.79, 118.36, 50.39, 183.46, 140.1];
const sparkPoints = sfSeries.map((value, i) =>
  `${4 + i * 12},${31 - value * 0.12}`
).join(' ');

function InjuryCover() {
  return <>
    <span className="injury-masthead">San Francisco <span>2017–2025</span></span>
    <strong className="injury-team">49ers</strong>
    <img className="injury-jersey" src={jersey} alt="" draggable="false" />
    <div className="injury-colophon"><span>Injury burden<br />by season</span>
      <svg viewBox="0 0 104 34"><path d="M1 19H103" stroke="currentColor" strokeOpacity=".45" strokeDasharray="2 3" fill="none" />
        <polyline points={sparkPoints} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      </svg>
    </div>
  </>;
}

function SchoolNote() {
  return <div className="school-slip">
    <span className="note-tape" />
    <small>Sample school note</small>
    <strong>Science fair</strong>
    <span className="school-when">Friday, <i>3 pm.</i></span>
    <span className="school-bring">Bring the poster.</span>
  </div>;
}

function FeedPhoto({ image, className }: { image: string; className: string }) {
  return <img
    className={className}
    src={`/feed/${image}-400.webp`}
    srcSet={`/feed/${image}-400.webp 400w, /feed/${image}-780.webp 780w`}
    sizes="auto, (max-width: 670px) 50vw, (max-width: 1020px) 33vw, 360px"
    alt=""
    loading="lazy"
    decoding="async"
    draggable="false"
  />;
}

function CallingCard() {
  return <>
    <span className="calling-field">Data science &amp; AI</span>
    <svg className="calling-mark" viewBox="-16 -16 32 32" fill="none" stroke="currentColor" strokeWidth="1.1">
      {[0, 90, 180, 270].map((turn) =>
        <path key={turn} transform={`rotate(${turn})`} d="M0 0C-5-1-11-5-11-10C-11-15-5-16-2-12C1-7 0-3 0 0Z" />)}
    </svg>
    <strong className="calling-name">Andrew<br /><i>Oh<span>.</span></i></strong>
    <span className="calling-address">Director of Data Science at Xero</span>
  </>;
}

function CareerPath() {
  return <>
    <div className="career-stop career-former"><small>Previously</small><strong>Pinterest</strong></div>
    <svg className="career-path" viewBox="0 0 210 94" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M10 7C15 32 53 23 72 35C89 46 78 61 68 58C48 52 70 29 94 38S120 79 190 74" />
      <path d="m179 68 13 6-11 8" />
    </svg>
    <div className="career-stop career-current"><small>Currently</small><strong>Xero</strong></div>
  </>;
}

function SparkCover() {
  return <>
    <svg className="spark-flare" viewBox="0 0 100 100" fill="currentColor">
      <path d="m48 1 6 29 18-24-7 28 26-13-19 22 27 3-26 9 23 17-29-6 10 27-19-21-2 28-9-27-14 25 5-29-26 15 19-23-29-2 26-11L3 38l29 3-12-27 20 21z" />
    </svg>
    <span className="spark-cover-title">Spark</span>
    <span className="spark-cover-sub">A collection of AI ideas</span>
  </>;
}

function ReadingTiles() {
  return <>
    <div className="reading-book"><span /><span /></div>
    <div className="reading-sounds"><b>p</b><b>a</b><b>ck</b></div>
    <strong className="reading-title">PokéRead</strong>
  </>;
}

function TendSlip() {
  return <>
    <span className="tend-envelope-back" />
    <div className="tend-letter"><small>Follow-up</small><span>Save it for<br />review.</span></div>
    <span className="tend-envelope-front" />
    <strong className="tend-word">Tend</strong>
  </>;
}

function TradeReceipt() {
  return <div className="trade-receipt">
    <strong>DropAlpha</strong>
    <small>Unit economics</small>
    <div className="receipt-line"><span>Sale price</span><b>+</b></div>
    <div className="receipt-line"><span>Cost basis</span><b>−</b></div>
    <div className="receipt-line"><span>Fees</span><b>−</b></div>
    <div className="receipt-out"><span>Net profit</span></div>
  </div>;
}

function CaseField() {
  const arrows: ReactNode[] = [];
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 8; col++) {
      const angle = 18 * col - 14 * row - 45;
      arrows.push(<path key={`${row}-${col}`} d="M-5 0H5M2 -3L5 0 2 3"
        transform={`translate(${12+24*col} ${10+18*row}) rotate(${angle})`} />);
    }
  }
  return <>
    <div className="case-field-title">Vectorfield</div>
    <svg className="case-arrows" viewBox="0 0 192 110" fill="none" stroke="currentColor" strokeWidth="1.1">{arrows}</svg>
    <span className="case-field-note">48 cases for data science directors</span>
  </>;
}

const art: Record<FeedPin['art'], ReactNode> = {
  bio: <CallingCard />,
  career: <CareerPath />,
  spark: <SparkCover />,
  reading: <ReadingTiles />,
  injury: <InjuryCover />,
  family: <SchoolNote />,
  wardrobe: <FeedPhoto className="wardrobe-image" image="linen" />,
  boards: <FeedPhoto className="card-fan-image" image="card-fan" />,
  tend: <TendSlip />,
  economics: <TradeReceipt />,
  cases: <CaseField />,

};

export default function PinArt({ pin }: { pin: FeedPin }) {
  return <figure className={`pin-art cover-${pin.art}`} role="img" aria-label={pin.alt}>
    <div className="cover-canvas" aria-hidden="true">{art[pin.art]}</div>
  </figure>;
}
