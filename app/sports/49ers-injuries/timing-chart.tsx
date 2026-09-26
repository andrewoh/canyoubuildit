"use client";

import { useId, useRef, useState, type ComponentProps, type RefObject } from "react";
import rawData from "./timing-data.json";

import { Metric } from "./glossary";

const PAPER = "#f6f3ec";
const INK = "#22251f";
const MUTED = "#63675e";
const LINE = "#d8d7ce";
const RED = "#b33127";
const WIDTH = 800;
const chartStyle = { minWidth: 680, maxWidth: "100%", height: "auto" };
const pct = (value: number) => `${(value * 100).toFixed(1)}%`;
const pp = (value: number) => `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value * 100).toFixed(1)}`;

function Text(props: ComponentProps<"text">) {
  return <text {...props} style={{ fill: MUTED, stroke: "none", fontFamily: "Arial, Helvetica, sans-serif", fontSize: 15, ...props.style }} />;
}

function wrapText(value: string, maxCharacters: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of value.split(" ")) {
    if (line && `${line} ${word}`.length > maxCharacters) {
      lines.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines;
}

/** Keep the exported chart independent of page CSS, including labels and provenance. */
async function downloadChart(ref: RefObject<SVGSVGElement | null>, title: string, subtitle: string, filename: string, format: "png" | "svg") {
  const original = ref.current;
  if (!original) throw new Error("The chart is not ready yet. Please try again.");
  const clone = original.cloneNode(true) as SVGSVGElement;
  const originals = [original, ...Array.from(original.querySelectorAll("*"))];
  const copies = [clone, ...Array.from(clone.querySelectorAll("*"))];
  originals.forEach((element, index) => {
    const computed = window.getComputedStyle(element);
    const target = copies[index] as SVGElement;
    for (const property of ["fill", "stroke", "stroke-width", "stroke-dasharray", "opacity", "font-family", "font-size", "font-weight", "text-anchor"]) {
      target.style.setProperty(property, computed.getPropertyValue(property));
    }
    target.removeAttribute("tabindex");
  });
  const chartHeight = original.viewBox.baseVal.height;
  const titleLines = wrapText(title, 55);
  const subtitleLines = wrapText(subtitle, 90);
  const sourceLines = wrapText("Source: nflverse play-by-play, 2017–2025. First explicit on-play injury announcement per player-game; not all injuries. canyoubuildit.com/sports/49ers-injuries", 100);
  const top = 34 + titleLines.length * 31 + subtitleLines.length * 21 + 20;
  const height = top + chartHeight + 32 + sourceLines.length * 19;
  const ns = "http://www.w3.org/2000/svg";
  const exportSvg = document.createElementNS(ns, "svg");
  exportSvg.setAttribute("viewBox", `0 0 ${WIDTH + 48} ${height}`);
  exportSvg.setAttribute("width", String((WIDTH + 48) * 2));
  exportSvg.setAttribute("height", String(height * 2));
  const background = document.createElementNS(ns, "rect");
  background.setAttribute("width", "100%");
  background.setAttribute("height", "100%");
  background.setAttribute("fill", PAPER);
  exportSvg.appendChild(background);
  function addLabel(text: string, y: number, size: number, weight = "400", color = MUTED) {
    const element = document.createElementNS(ns, "text");
    element.setAttribute("x", "24");
    element.setAttribute("y", String(y));
    element.setAttribute("font-family", "Arial, Helvetica, sans-serif");
    element.setAttribute("font-size", String(size));
    element.setAttribute("font-weight", weight);
    element.setAttribute("fill", color);
    element.textContent = text;
    exportSvg.appendChild(element);
  }
  titleLines.forEach((line, i) => addLabel(line, 38 + i * 31, 25, "700", INK));
  subtitleLines.forEach((line, i) => addLabel(line, 45 + titleLines.length * 31 + i * 21, 15));
  clone.setAttribute("x", "24");
  clone.setAttribute("y", String(top));
  clone.setAttribute("width", String(WIDTH));
  clone.setAttribute("height", String(chartHeight));
  clone.removeAttribute("class");
  clone.style.removeProperty("min-width");
  clone.style.removeProperty("max-width");
  clone.style.removeProperty("height");
  exportSvg.appendChild(clone);
  sourceLines.forEach((line, i) => addLabel(line, top + chartHeight + 20 + i * 19, 13));
  const svgBlob = new Blob([new XMLSerializer().serializeToString(exportSvg)], { type: "image/svg+xml;charset=utf-8" });
  function saveBlob(blob: Blob, name: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    try { link.click(); }
    finally {
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  }
  if (format === "svg") {
    saveBlob(svgBlob, filename);
    return;
  }
  const sourceUrl = URL.createObjectURL(svgBlob);
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("The PNG could not be rendered. Please try SVG instead."));
      image.src = sourceUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = (WIDTH + 48) * 2;
    canvas.height = height * 2;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser cannot create a PNG. Please try SVG instead.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const png = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("The PNG could not be saved. Please try SVG instead.")), "image/png");
    });
    saveBlob(png, filename.replace(/\.svg$/i, ".png"));
  } finally { URL.revokeObjectURL(sourceUrl); }
}

function ExportButton({ svg, title, subtitle, filename }: { svg: RefObject<SVGSVGElement | null>; title: string; subtitle: string; filename: string }) {
  const [busy, setBusy] = useState<"png" | "svg" | null>(null);
  const [error, setError] = useState<string | null>(null);
  async function download(format: "png" | "svg") {
    setBusy(format);
    setError(null);
    try { await downloadChart(svg, title, subtitle, filename, format); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "The download failed. Please try again."); }
    finally { setBusy(null); }
  }
  return <div style={{ flexShrink: 0 }}>
    <div className="sports-chart-actions" aria-label="Download chart">
      <button className="sports-quiet-button" type="button" disabled={busy !== null} onClick={() => void download("png")} aria-label={`Download ${title} as a PNG image`}>{busy === "png" ? "Preparing…" : "PNG ↓"}</button>
      <button className="sports-quiet-button" type="button" disabled={busy !== null} onClick={() => void download("svg")} aria-label={`Download ${title} as an SVG image`}>{busy === "svg" ? "Preparing…" : "SVG ↓"}</button>
    </div>
    {error && <p className="sports-mini-caption" role="alert" style={{ maxWidth: 225, marginTop: 8 }}>{error}</p>}
  </div>;
}

type Comparison = {
  games: number;
  counts: number[];
  regulation_events: number;
  second_share: number;
  second_ci: number[];
  rest_counts: number[];
  rest_regulation_events: number;
  rest_second_share: number;
  rest_second_ci: number[];
  difference: number;
  difference_ci: number[];
  bootstrap_reps: number;
  bootstrap_nonempty_reps: number;
};
type TimingData = {
  teams: { code: string; name: string }[];
  periods: { key: string; label: string; seasons: number[] }[];
  comparisons: Record<string, Record<string, Comparison>>;
};
const data = rawData as TimingData;

export function TimingChart() {
  const id = useId();
  const svg = useRef<SVGSVGElement>(null);
  const [team, setTeam] = useState("SF");
  const [period, setPeriod] = useState("all");
  const [view, setView] = useState<"halves" | "quarters">("halves");
  const selected = data.comparisons[period][team];
  const teamName = data.teams.find(item => item.code === team)?.name ?? team;
  const periodLabel = data.periods.find(item => item.key === period)?.label ?? period;
  const rows = view === "halves" ? [
    { label: "First half", note: "Q1 + Q2", team: selected.counts[0] + selected.counts[1], rest: selected.rest_counts[0] + selected.rest_counts[1], ci: [1 - selected.second_ci[1], 1 - selected.second_ci[0]], restCi: [1 - selected.rest_second_ci[1], 1 - selected.rest_second_ci[0]] },
    { label: "Second half", note: "Q3 + Q4", team: selected.counts[2] + selected.counts[3], rest: selected.rest_counts[2] + selected.rest_counts[3], ci: selected.second_ci, restCi: selected.rest_second_ci },
  ] : [0, 1, 2, 3].map(quarter => ({ label: `Quarter ${quarter + 1}`, note: quarter < 2 ? "First half" : "Second half", team: selected.counts[quarter], rest: selected.rest_counts[quarter], ci: [] as number[], restCi: [] as number[] }));
  const maximum = Math.min(1, Math.max(view === "halves" ? 0.7 : 0.4, Math.ceil(Math.max(...rows.flatMap(row => [row.team / selected.regulation_events, row.rest / selected.rest_regulation_events, ...row.ci, ...row.restCi])) * 10) / 10));
  const LEFT = 190;
  const RIGHT = 636;
  const rowGap = view === "halves" ? 112 : 102;
  const height = rows.length * rowGap + 80;
  const x = (value: number) => LEFT + (value / maximum) * (RIGHT - LEFT);
  const ticks = Array.from({ length: Math.round(maximum / (maximum > 0.8 ? 0.2 : 0.1)) + 1 }, (_, i) => i * (maximum > 0.8 ? 0.2 : 0.1)).filter(value => value <= maximum + 0.001);
  const title = "Do injury announcements pile up after halftime?";
  const exportTitle = `When injury announcements occur: ${team}, ${periodLabel}`;
  const exportSubtitle = `Regular-season on-play announcements, not all clinical injuries. Red = ${team}; dark gray = the other 31 franchises. Percentages exclude overtime. ${view === "halves" ? "Thin lines show game-bootstrap 95% confidence intervals." : "Quarter splits are descriptive."} Second-half share: ${pct(selected.second_share)} vs ${pct(selected.rest_second_share)}; difference ${pp(selected.difference)} percentage points (95% interval ${pp(selected.difference_ci[0])} to ${pp(selected.difference_ci[1])}).`;
  return <figure className="sports-figure" aria-labelledby={`${id}-heading`}>
    <div className="sports-figure-head">
      <div><span className="sports-figure-num">Figure 08</span><h3 id={`${id}-heading`}>{title}</h3><p className="sports-figure-sub">First explicit on-play injury announcement per player-game. These records capture a subset of injuries; overtime is counted separately.</p></div>
      <ExportButton svg={svg} title={exportTitle} subtitle={exportSubtitle} filename={`injury-timing-${team.toLowerCase()}-${period}-${view}.svg`} />
    </div>
    <div className="sports-controls">
      <label className="sports-control" htmlFor={`${id}-team`}>Team<select id={`${id}-team`} value={team} onChange={event => setTeam(event.target.value)}>{data.teams.map(item => <option key={item.code} value={item.code}>{item.name}</option>)}</select></label>
      <label className="sports-control" htmlFor={`${id}-period`}>Seasons<select id={`${id}-period`} value={period} onChange={event => setPeriod(event.target.value)}>{data.periods.map(item => <option key={item.key} value={item.key}>{item.label}</option>)}</select></label>
      <div className="sports-toggle" role="group" aria-label="Group game timing"><button type="button" aria-pressed={view === "halves"} onClick={() => setView("halves")}>Halves</button><button type="button" aria-pressed={view === "quarters"} onClick={() => setView("quarters")}>Quarters</button></div>
    </div>
    <div className="sports-key" aria-label="Chart legend"><span><i style={{ background: RED }} />{teamName}</span><span><i style={{ background: INK }} />Other 31 franchises</span>{view === "halves" && <span>Thin line = <Metric term="interval">95% uncertainty range</Metric></span>}</div>
    <p className="sports-scroll-hint">Swipe the chart horizontally to see the full comparison →</p>
    <div className="sports-chart-scroll" tabIndex={0} role="region" aria-label="Injury announcement timing chart; scroll horizontally on small screens">
      <svg ref={svg} className="sports-chart" style={chartStyle} viewBox={`0 0 800 ${height}`} role="img" aria-labelledby={`${id}-title ${id}-desc`}>
        <title id={`${id}-title`}>{exportTitle}</title>
        <desc id={`${id}-desc`}>{`${teamName} has ${selected.regulation_events} first recorded on-play injury announcements in regulation across ${selected.games} games in ${periodLabel}. Its second-half share is ${pct(selected.second_share)}, versus ${pct(selected.rest_second_share)} for the other teams. The difference is ${pp(selected.difference)} percentage points, with a 95% interval from ${pp(selected.difference_ci[0])} to ${pp(selected.difference_ci[1])}. Full counts are in the table below.`}</desc>
        <Text x={LEFT} y={23} style={{ fill: INK, fontWeight: 700 }}>Share of regulation announcements</Text>
        <Text x={785} y={23} textAnchor="end" style={{ fill: INK, fontWeight: 700 }}>Share (count)</Text>
        {ticks.map(tick => <g key={tick}><line x1={x(tick)} x2={x(tick)} y1={39} y2={height - 46} stroke={LINE} /><Text x={x(tick)} y={height - 21} textAnchor="middle">{`${Math.round(tick * 100)}%`}</Text></g>)}
        {rows.map((row, i) => {
          const y = 67 + i * rowGap;
          const share = row.team / selected.regulation_events;
          const restShare = row.rest / selected.rest_regulation_events;
          return <g key={row.label}>
            <Text x={0} y={y + 6} style={{ fill: INK, fontWeight: 700 }}>{row.label}</Text><Text x={0} y={y + 30}>{row.note}</Text>
            <Text x={LEFT - 12} y={y + 5} textAnchor="end" style={{ fill: RED, fontWeight: 700 }}>{team}</Text>
            <Text x={LEFT - 12} y={y + 39} textAnchor="end">Others</Text>
            <rect x={LEFT} y={y - 8} width={x(share) - LEFT} height={17} fill={RED} />
            <rect x={LEFT} y={y + 26} width={x(restShare) - LEFT} height={17} fill={INK} />
            {view === "halves" && <>
              <line x1={x(row.ci[0])} x2={x(row.ci[1])} y1={y + 16} y2={y + 16} stroke={RED} strokeWidth={1.6} />
              {[row.ci[0], row.ci[1]].map((edge, index) => <line key={`team-${index}`} x1={x(edge)} x2={x(edge)} y1={y + 12} y2={y + 20} stroke={RED} />)}
              <line x1={x(row.restCi[0])} x2={x(row.restCi[1])} y1={y + 50} y2={y + 50} stroke={INK} strokeWidth={1.6} />
              {[row.restCi[0], row.restCi[1]].map((edge, index) => <line key={`rest-${index}`} x1={x(edge)} x2={x(edge)} y1={y + 46} y2={y + 54} stroke={INK} />)}
            </>}
            <Text x={785} y={y + 5} textAnchor="end" style={{ fill: RED, fontWeight: 700 }}>{`${pct(share)} (${row.team.toLocaleString("en-US")})`}</Text>
            <Text x={785} y={y + 39} textAnchor="end" style={{ fill: INK }}>{`${pct(restShare)} (${row.rest.toLocaleString("en-US")})`}</Text>
          </g>;
        })}
      </svg>
    </div>
    <div className="sports-chart-detail" aria-live="polite" aria-atomic="true"><strong>{`${team}, ${periodLabel}: ${pct(selected.second_share)} after halftime.`}</strong>{" "}{`Other teams: ${pct(selected.rest_second_share)}. Difference: ${pp(selected.difference)} percentage points; 95% interval ${pp(selected.difference_ci[0])} to ${pp(selected.difference_ci[1])}. `}{selected.difference_ci[0] <= 0 && selected.difference_ci[1] >= 0 ? "That range includes no difference." : selected.difference_ci[0] > 0 ? "The observed share is higher in this comparison." : "The observed share is lower in this comparison."}{selected.regulation_events < 30 && ` This filter contains only ${selected.regulation_events} regulation announcements, so the annual split is imprecise.`}</div>
    <figcaption>Counts identify when a player was first explicitly reported injured during a play; they do not capture every injury, establish its severity, or measure fatigue. Status and return updates are excluded because they do not timestamp the injury. {`${selected.counts[4]} ${team} and ${selected.rest_counts[4]} other overtime announcements are outside the displayed percentages.`} Confidence intervals resample whole games and preserve the season mix; they cannot correct missing or inconsistently recorded injuries. <a href="https://nflreadr.nflverse.com/reference/load_pbp.html" target="_blank" rel="noreferrer">Source documentation</a>.</figcaption>
    <details className="sports-view-table"><summary>View counts, uncertainty, and exclusions</summary><div className="sports-table-scroll"><table className="sports-table">
      <caption className="sports-mini-caption">{`${periodLabel}. One first explicit on-play announcement per player per game; regular season only.`}</caption>
      <thead><tr><th scope="col">Group</th><th scope="col">Q1</th><th scope="col">Q2</th><th scope="col">Q3</th><th scope="col">Q4</th><th scope="col">First half</th><th scope="col">Second half</th><th scope="col">Second-half share</th><th scope="col">95% interval</th><th scope="col">OT (separate)</th></tr></thead>
      <tbody>{[{ label: teamName, counts: selected.counts, share: selected.second_share, ci: selected.second_ci }, { label: "Other 31 franchises", counts: selected.rest_counts, share: selected.rest_second_share, ci: selected.rest_second_ci }].map(item => <tr key={item.label}><th scope="row">{item.label}</th>{item.counts.slice(0, 4).map((count, index) => <td key={index}>{count.toLocaleString("en-US")}</td>)}<td>{(item.counts[0] + item.counts[1]).toLocaleString("en-US")}</td><td>{(item.counts[2] + item.counts[3]).toLocaleString("en-US")}</td><td>{pct(item.share)}</td><td>{`${pct(item.ci[0])}–${pct(item.ci[1])}`}</td><td>{item.counts[4]}</td></tr>)}</tbody>
    </table></div><p className="sports-mini-caption">Updates, nonspecific injury timeouts, and reports without an explicit player/team on-play clause are excluded. Practice and offseason injuries have no game-half assignment. Repeated announcements for the same player in a game are counted only at the first recorded occurrence. Filters are descriptive comparisons; viewing many teams or seasons is not a test of a preselected medical hypothesis.</p></details>
  </figure>;
}
