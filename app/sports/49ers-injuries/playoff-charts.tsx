"use client";

import { useId, useRef, useState, type ComponentProps, type RefObject } from "react";
import data from "./data.json";

import { Metric } from "./glossary";
import { TeamBadge, SvgTeamLogo } from "./team-identity";
import { BurdenComparison, DirectionKey } from "./comparison";

const PAPER = "#f6f3ec";
const INK = "#22251f";
const MUTED = "#63675e";
const LINE = "#d8d7ce";
const RED = "#b33127";
const TEAL = "#246b5a";
const PRIOR = "#8c9185";
const WIDTH = 800;
const chartStyle = { minWidth: 680, maxWidth: "100%", height: "auto" };
const fmt = (value: number) => value.toFixed(1);
const signed = (value: number) => `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value).toFixed(1)}`;
const burdenChange = (value: number) => `${value > 0 ? "↑" : value < 0 ? "↓" : "→"} ${fmt(Math.abs(value))} pts ${value > 0 ? "more" : value < 0 ? "less" : "same"} burden`;
const burdenColor = (change: number) => change > 0 ? RED : change < 0 ? TEAL : MUTED;

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
  const sourceLines = wrapText("Source: Football Outsiders / FTN adjusted games lost; nflverse schedules and snaps. Analysis: canyoubuildit.com/sports/49ers-injuries", 100);
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

export function PlayoffDepthChart() {
  const svg = useRef<SVGSVGElement>(null);
  const id = useId();
  const rows = [...data.playoffs.depth_summary].sort((a, b) => a.sort_order - b.sort_order);
  const title = "Healthy runs, more ordinary follow-ups";
  const subtitle = "Average injury burden by the previous season’s playoff finish. Index 100 = NFL average; lower is healthier.";
  const x = (value: number) => 254 + ((value - 40) / 130) * 510;
  return <figure className="sports-figure" aria-labelledby={`${id}-heading`}>
    <div className="sports-figure-head">
      <div><span className="sports-figure-num">Figure 03</span><h3 id={`${id}-heading`}>{title}</h3><p className="sports-figure-sub">{subtitle}</p></div>
      <ExportButton svg={svg} title={title} subtitle={`${subtitle} Open dots = run year; filled dots = following year. Red = more burden than the run year; teal = less. Thin intervals = 95% confidence intervals for next-year means. 256 follow-ups, 2018–2025.`} filename="playoff-depth-and-next-season-injuries.svg" />
    </div>
    <div className="sports-key" aria-label="Chart legend">
      <span><i style={{ background: PAPER, border: `2px solid ${PRIOR}` }} />Season of the playoff finish</span>
      <span><i style={{ background: INK }} />Following season</span>
      <span>Thin interval = 95% confidence interval for the following-season mean</span>
    </div>
    <p className="sports-mini-caption"><span style={{ color: TEAL, fontWeight: 700 }}>↓ Less burden than the run year</span> · <span style={{ color: RED, fontWeight: 700 }}>↑ More burden than the run year</span></p>
    <p className="sports-scroll-hint">Swipe the chart horizontally to see the full comparison →</p>
    <div className="sports-chart-scroll" tabIndex={0} role="region" aria-label="Playoff depth chart; scroll horizontally on small screens">
      <svg ref={svg} className="sports-chart" style={chartStyle} viewBox="0 0 800 414" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
        <title id={`${id}-title`}>{title}</title>
        <desc id={`${id}-desc`}>Five groups of 256 team-season transitions. Super Bowl teams average 71.2 during the run and 106.1 the following season. Lines show uncertainty in following-season group means, not the spread of individual team outcomes. Full data is available in the table below.</desc>
        {[50, 75, 100, 125, 150].map(tick => <g key={tick}>
          <line x1={x(tick)} x2={x(tick)} y1={33} y2={350} stroke={tick === 100 ? MUTED : LINE} strokeDasharray={tick === 100 ? "4 5" : undefined} />
          <Text x={x(tick)} y={377} textAnchor="middle" style={{ fill: tick === 100 ? INK : MUTED, fontWeight: tick === 100 ? 700 : 400 }}>{tick}</Text>
        </g>)}
        <Text x={x(100)} y={20} textAnchor="middle" style={{ fontWeight: 700, fill: INK }}>NFL average</Text>
        {rows.map((row, i) => {
          const y = 71 + i * 62;
          const isSuperBowl = row.category === "Super Bowl";
          const change = row.next_agl_index - row.prior_agl_index;
          const changeColor = burdenColor(change);
          return <g key={row.category}>
            <Text x={0} y={y - 5} style={{ fill: INK, fontWeight: isSuperBowl ? 700 : 400 }}>{row.category === "Conference runner-up" ? "Conference title-game loss" : row.category}</Text>
            <Text x={0} y={y + 14} style={{ fontSize: 13 }}>{row.n} follow-up seasons</Text>
            <Text x={0} y={y + 32} style={{ fill: changeColor, fontSize: 13, fontWeight: 700 }}>{burdenChange(change)}</Text>
            <line x1={x(row.prior_agl_index)} x2={x(row.next_agl_index)} y1={y} y2={y} stroke={changeColor} strokeWidth={2} />
            <line x1={x(row.mean_lo)} x2={x(row.mean_hi)} y1={y + 14} y2={y + 14} stroke={INK} strokeWidth={1.5} opacity={0.65} />
            <line x1={x(row.mean_lo)} x2={x(row.mean_lo)} y1={y + 10} y2={y + 18} stroke={INK} opacity={0.65} />
            <line x1={x(row.mean_hi)} x2={x(row.mean_hi)} y1={y + 10} y2={y + 18} stroke={INK} opacity={0.65} />
            <circle cx={x(row.prior_agl_index)} cy={y} r={5.5} fill={PAPER} stroke={PRIOR} strokeWidth={2} />
            <circle cx={x(row.next_agl_index)} cy={y} r={6} fill={changeColor} stroke={PAPER} strokeWidth={1.5} />
            <title>{`${row.category}: ${fmt(row.prior_agl_index)} during the run, ${fmt(row.next_agl_index)} next season; next-season mean 95% interval ${fmt(row.mean_lo)} to ${fmt(row.mean_hi)}; n=${row.n}.`}</title>
          </g>;
        })}
        <Text x={254} y={405} style={{ fill: TEAL, fontWeight: 700 }}>← Less injury burden</Text>
        <Text x={764} y={405} textAnchor="end" style={{ fill: RED, fontWeight: 700 }}>More injury burden →</Text>
      </svg>
    </div>
    <figcaption>2017–2024 playoff finishes → 2018–2025 regular-season injuries. Intervals resample franchises to account for repeat observations. Health helps teams reach the playoffs; a before/after rise alone does not identify the effect of extra games.</figcaption>
    <details className="sports-view-table"><summary>View data and uncertainty</summary><div className="sports-table-scroll"><table className="sports-table">
      <caption className="sports-mini-caption">Injury index; each season’s NFL mean = 100.</caption>
      <thead><tr><th scope="col">Previous season’s finish</th><th scope="col">Follow-ups</th><th scope="col">During run</th><th scope="col">Next season</th><th scope="col">Change from run year</th><th scope="col">Next-season mean 95% CI</th></tr></thead>
      <tbody>{rows.map(row => <tr key={row.category}><th scope="row">{row.category}</th><td>{row.n}</td><td>{fmt(row.prior_agl_index)}</td><td>{fmt(row.next_agl_index)}</td><td style={{ color: burdenColor(row.next_agl_index - row.prior_agl_index), fontWeight: 700 }}>{burdenChange(row.next_agl_index - row.prior_agl_index)}</td><td>{fmt(row.mean_lo)} to {fmt(row.mean_hi)}</td></tr>)}</tbody>
    </table></div></details>
  </figure>;
}

export function SuperBowlChart() {
  const svg = useRef<SVGSVGElement>(null);
  const id = useId();
  const [showPrior, setShowPrior] = useState(false);
  const [selectedKey, setSelectedKey] = useState("SF-2024");
  const rows = [...data.playoffs.super_bowl_followups].sort((a, b) => b.agl_index - a.agl_index);
  const selected = rows.find(row => `${row.team}-${row.season}` === selectedKey) ?? rows[0];
  const teamName = data.teams.find(team => team.code === selected.team)?.name ?? selected.team;
  const title = "The 49ers’ Super Bowl follow-ups stand out";
  const subtitle = "All 16 follow-up seasons after the 2017–2024 Super Bowls, ranked by next-season injury burden. Index 100 = NFL average.";
  const x = (value: number) => 190 + (value / 250) * 550;
  const height = 738;
  return <figure className="sports-figure" aria-labelledby={`${id}-heading`}>
    <div className="sports-figure-head">
      <div><span className="sports-figure-num">Figure 05</span><h3 id={`${id}-heading`}>{title}</h3><p className="sports-figure-sub">{subtitle}</p></div>
      <ExportButton svg={svg} title={title} subtitle={`${subtitle} Red dots = more burden than NFL average; teal = less. Filled dots = next season.${showPrior ? " Open dots = Super Bowl season. Row arrows and connectors show change from the Super Bowl season in injury-index points; their colors compare with that season, not the NFL mean." : ""} 16 observations from seven franchises.`} filename="all-super-bowl-injury-followups.svg" />
    </div>
    <div className="sports-controls">
      <button type="button" className="sports-quiet-button" aria-pressed={showPrior} onClick={() => setShowPrior(!showPrior)}>{showPrior ? "Hide" : "Show"} the Super Bowl season</button>
      <span className="sports-mini-caption">Select a row for the full comparison.</span>
    </div>
    <DirectionKey kind="burden" />
    <div className="sports-key" aria-label="Season markers">
      <span><i style={{ background: INK }} />Following season</span>
      {showPrior && <span><i style={{ background: PAPER, border: `2px solid ${PRIOR}` }} />Super Bowl season</span>}
    </div>
    <p className="sports-mini-caption">Dot colors compare with the NFL average.{showPrior && " Row arrows show the change from the Super Bowl season, in injury-index points."}</p>
    <p className="sports-scroll-hint">Swipe the chart horizontally to see the full comparison →</p>
    <div className="sports-chart-scroll" tabIndex={0} role="region" aria-label="Ranked Super Bowl follow-ups; scroll horizontally on small screens">
      <svg ref={svg} className="sports-chart" style={chartStyle} viewBox={`0 0 800 ${height}`} role="group" aria-labelledby={`${id}-title ${id}-desc`}>
        <title id={`${id}-title`}>{title}</title>
        <desc id={`${id}-desc`}>San Francisco in 2020 is highest at 227.4. The Rams in 2022 are second at 184.8. San Francisco in 2024 is third at 183.5. Select any row with a click, tap, or Enter key to inspect its before/after values. The accessible table lists all 16 observations.</desc>
        <Text x={0} y={24} style={{ fill: INK, fontWeight: 700 }}>Team · next season</Text>
        <Text x={x(100)} y={24} textAnchor="middle" style={{ fill: INK, fontWeight: 700 }}>NFL average</Text>
        <Text x={785} y={24} textAnchor="end" style={{ fill: INK, fontWeight: 700 }}>Index</Text>
        <rect x={x(0)} y={39} width={x(100) - x(0)} height={626} fill={TEAL} opacity={0.035} />
        <rect x={x(100)} y={39} width={x(250) - x(100)} height={626} fill={RED} opacity={0.035} />
        {[0, 50, 100, 150, 200, 250].map(tick => <g key={tick}>
          <line x1={x(tick)} x2={x(tick)} y1={39} y2={665} stroke={tick === 100 ? MUTED : LINE} strokeDasharray={tick === 100 ? "4 5" : undefined} />
          <Text x={x(tick)} y={693} textAnchor="middle" style={{ fontWeight: tick === 100 ? 700 : 400, fill: tick === 100 ? INK : MUTED }}>{tick}</Text>
        </g>)}
        {rows.map((row, i) => {
          const y = 58 + i * 39;
          const key = `${row.team}-${row.season}`;
          const active = selectedKey === key;
          const color = burdenColor(row.agl_index - 100);
          const changeColor = burdenColor(row.delta_index);
          return <g key={key} className="plot-target" role="button" tabIndex={0} aria-pressed={active}
            aria-label={`${row.team}, ${row.season}: injury index ${fmt(row.agl_index)}, ${fmt(Math.abs(row.agl_index - 100))}% ${row.agl_index >= 100 ? "more" : "less"} burden than NFL average. ${fmt(Math.abs(row.delta_index))} index points ${row.delta_index >= 0 ? "more" : "less"} than the ${row.exposure_season} Super Bowl season. Select for details.`}
            onClick={() => setSelectedKey(key)} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedKey(key); } }}>
            <rect x={0} y={y - 17} width={799} height={35} rx={2} fill={active ? "#e8e7df" : "transparent"} />
            <SvgTeamLogo team={row.team} x={0} y={y - 12} size={24} />
            <Text x={32} y={y + (showPrior ? -2 : 5)} style={{ fill: INK, fontWeight: row.team === "SF" || active ? 700 : 400 }}>{row.team} · {row.season}</Text>
            {showPrior && <><Text x={32} y={y + 14} style={{ fill: changeColor, fontSize: 11.5, fontWeight: 700 }}>{burdenChange(row.delta_index)}</Text><line x1={x(row.prior_agl_index)} x2={x(row.agl_index)} y1={y} y2={y} stroke={changeColor} strokeWidth={1.6} /><circle cx={x(row.prior_agl_index)} cy={y} r={4.5} fill={PAPER} stroke={PRIOR} strokeWidth={1.7} /></>}
            <circle cx={x(row.agl_index)} cy={y} r={row.team === "SF" ? 6 : 5} fill={color} stroke={PAPER} strokeWidth={1.3} />
            <Text x={785} y={y + 5} textAnchor="end" style={{ fill: color, fontWeight: row.team === "SF" || active ? 700 : 400 }}>{fmt(row.agl_index)}</Text>
          </g>;
        })}
        <Text x={190} y={721} style={{ fill: TEAL, fontWeight: 700 }}>← Less injury burden</Text>
        <Text x={740} y={721} textAnchor="end" style={{ fill: RED, fontWeight: 700 }}>More injury burden →</Text>
      </svg>
    </div>
    <div className="sports-chart-detail" aria-live="polite" aria-atomic="true">
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px 14px", marginBottom: 12 }}><TeamBadge team={selected.team} label={teamName} /><strong>{selected.exposure_season} → {selected.season}</strong></div>
      <BurdenComparison value={selected.agl_index} period={String(selected.season)} />
      <p style={{ margin: "12px 0 0" }}>Injury index {fmt(selected.prior_agl_index)} → {fmt(selected.agl_index)}: <strong style={{ color: burdenColor(selected.delta_index) }}>{burdenChange(selected.delta_index)}</strong> than the Super Bowl season. The team played {selected.prior_post_games} postseason games; the following regular season recorded {fmt(selected.agl)} adjusted games lost.</p>
    </div>
    <figcaption>These are 16 observations from seven franchises, including five Kansas City follow-ups. San Francisco’s 2020 and 2024 seasons rank first and third. All 16 average 106.1; the 14 excluding SF average 91.9. Excluding SF illustrates its influence and does not establish that fatigue is harmless elsewhere.</figcaption>
    <details className="sports-view-table"><summary>View all 16 follow-up seasons</summary><div className="sports-table-scroll"><table className="sports-table">
      <caption className="sports-mini-caption">Injury index; 100 = each season’s NFL average. Sorted by following-season burden.</caption>
      <thead><tr><th scope="col">Team</th><th scope="col">Super Bowl season</th><th scope="col">Following season</th><th scope="col">Run-year index</th><th scope="col">Next-year index</th><th scope="col">Change</th><th scope="col">Postseason games</th></tr></thead>
      <tbody>{rows.map(row => <tr key={`${row.team}-${row.season}`}><th scope="row"><TeamBadge team={row.team} compact /></th><td>{row.exposure_season}</td><td>{row.season}</td><td>{fmt(row.prior_agl_index)}</td><td style={{ color: burdenColor(row.agl_index - 100), fontWeight: 700 }}>{fmt(row.agl_index)}</td><td style={{ color: burdenColor(row.delta_index), fontWeight: 700 }}>{burdenChange(row.delta_index)}</td><td>{row.prior_post_games}</td></tr>)}</tbody>
    </table></div></details>
  </figure>;
}

const effectLabels: Record<string, { title: string; contrast: string }> = {
  prior_post_games: { title: "One more playoff game", contrast: "In the previous season" },
  prior_sb: { title: "Reaching the Super Bowl", contrast: "Versus all other teams" },
  prior_plays_1000: { title: "1,000 more player snaps", contrast: "Offense + defense, including playoffs" },
};

export function EffectChart() {
  const svg = useRef<SVGSVGElement>(null);
  const id = useId();
  const rows = data.playoffs.primary_effects.filter(row => Object.hasOwn(effectLabels, row.feature));
  const title = "The estimates remain uncertain";
  const subtitle = "Adjusted differences in next-season injury-index points. Every 95% confidence interval includes zero.";
  const x = (value: number) => 335 + ((value + 30) / 95) * 445;
  return <figure className="sports-figure" aria-labelledby={`${id}-heading`}>
    <div className="sports-figure-head">
      <div><span className="sports-figure-num">Figure 04</span><h3 id={`${id}-heading`}>{title}</h3><p className="sports-figure-sub">{subtitle}</p></div>
      <ExportButton svg={svg} title={title} subtitle={`${subtitle} Separate models adjust for prior health, wins, age and outcome year; intervals account for repeated franchises. Associations, not causal effects. Index 100 = NFL average.`} filename="playoff-workload-adjusted-associations.svg" />
    </div>
    <div className="sports-key"><span><i style={{ background: INK }} />Point estimate</span><span>Horizontal line = <Metric term="interval">95% uncertainty range</Metric></span></div>
    <p className="sports-mini-caption"><strong>Direction remains uncertain:</strong> every range extends into both less and more injury burden.</p>
    <p className="sports-scroll-hint">Swipe the chart horizontally to see the full comparison →</p>
    <div className="sports-chart-scroll" tabIndex={0} role="region" aria-label="Adjusted association chart; scroll horizontally on small screens">
      <svg ref={svg} className="sports-chart" style={chartStyle} viewBox="0 0 800 407" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
        <title id={`${id}-title`}>{title}</title>
        <desc id={`${id}-desc`}>One additional playoff game: plus 3.5 index points, interval minus 3.4 to plus 10.3. Super Bowl appearance: plus 17.6, interval minus 21.6 to plus 56.7. One thousand additional player snaps: plus 0.1, interval minus 3.7 to plus 4.0. Wide uncertainty does not rule out meaningful harm. The full table includes p-values.</desc>
        <rect x={335} y={39} width={x(0) - 335} height={299} fill={TEAL} opacity={0.04} />
        <rect x={x(0)} y={39} width={780 - x(0)} height={299} fill={RED} opacity={0.04} />
        {[-20, 0, 20, 40, 60].map(tick => <g key={tick}>
          <line x1={x(tick)} x2={x(tick)} y1={39} y2={338} stroke={tick === 0 ? INK : LINE} strokeDasharray={tick === 0 ? "4 5" : undefined} />
          <Text x={x(tick)} y={363} textAnchor="middle" style={{ fill: tick === 0 ? INK : MUTED, fontWeight: tick === 0 ? 700 : 400 }}>{tick > 0 ? `+${tick}` : String(tick).replace("-", "−")}</Text>
        </g>)}
        <Text x={x(0)} y={24} textAnchor="middle" style={{ fill: INK, fontWeight: 700 }}>No association</Text>
        {rows.map((row, i) => {
          const y = 83 + i * 108;
          return <g key={row.feature}>
            <Text x={0} y={y - 10} style={{ fill: INK, fontWeight: 700 }}>{effectLabels[row.feature].title}</Text>
            <Text x={0} y={y + 13}>{effectLabels[row.feature].contrast}</Text>
            <Text x={0} y={y + 36} style={{ fill: INK }}>{signed(row.coef)} ({signed(row.lo)} to {signed(row.hi)})</Text>
            <line x1={x(row.lo)} x2={x(row.hi)} y1={y + 4} y2={y + 4} stroke={INK} strokeWidth={2} />
            <line x1={x(row.lo)} x2={x(row.lo)} y1={y - 2} y2={y + 10} stroke={INK} strokeWidth={1.5} />
            <line x1={x(row.hi)} x2={x(row.hi)} y1={y - 2} y2={y + 10} stroke={INK} strokeWidth={1.5} />
            <circle cx={x(row.coef)} cy={y + 4} r={6} fill={INK} stroke={PAPER} strokeWidth={1.5} />
          </g>;
        })}
        <Text x={335} y={395} style={{ fill: TEAL, fontSize: 16, fontWeight: 700 }}>← Less injury burden</Text><Text x={780} y={395} textAnchor="end" style={{ fill: RED, fontSize: 16, fontWeight: 700 }}>More injury burden →</Text>
      </svg>
    </div>
    <figcaption>256 team-season transitions, 2018–2025. Separate models adjust for the previous season’s injury burden, regular-season winning percentage, snap-weighted age, and outcome year. Confidence intervals account for repeated franchise observations. Effects use different exposure units, so their sizes are not feature-importance scores. A +10-point difference equals 10% of the season’s mean AGL, not a 10% change in injury probability. The intervals allow both lower burden and meaningful harm.</figcaption>
    <details className="sports-view-table"><summary>View estimates and model uncertainty</summary><div className="sports-table-scroll"><table className="sports-table">
      <caption className="sports-mini-caption">Adjusted injury-index point differences. All three models include 256 observations across 32 franchises.</caption>
      <thead><tr><th scope="col">Previous-season exposure</th><th scope="col">Estimate</th><th scope="col">95% CI</th><th scope="col">Clustered p-value</th><th scope="col">Wild-bootstrap p-value</th></tr></thead>
      <tbody>{rows.map(row => <tr key={row.feature}><th scope="row">{effectLabels[row.feature].title}</th><td>{signed(row.coef)}</td><td>{signed(row.lo)} to {signed(row.hi)}</td><td>{row.p.toFixed(3)}</td><td>{row.wild_bootstrap_p?.toFixed(3) ?? "—"}</td></tr>)}</tbody>
    </table></div></details>
  </figure>;
}
