'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import mix from './injury-mix-data.json';
import league from './data.json';
import { Metric } from './glossary';

const RED = '#b33127', INK = '#22251f', MUTED = '#63675e', GRAY = '#9b9f95', LINE = '#d8d7ce';
const fmt = (value: number, decimals = 1) => value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
const sign = (value: number) => `${value > 0 ? '+' : ''}${fmt(value)}`;
const names = Object.fromEntries(league.teams.map(team => [team.code, team.name]));
function activate(event: KeyboardEvent<SVGElement>, callback: () => void) { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); callback(); } }
function save(blob: Blob, filename: string) { const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 2000); }

function exportChart(figure: HTMLElement, title: string, context: string, notes: string) {
  const namespace = 'http://www.w3.org/2000/svg';
  const root = document.createElementNS(namespace, 'svg'); root.setAttribute('width', '800');
  const background = document.createElementNS(namespace, 'rect'); background.setAttribute('width', '800'); background.setAttribute('fill', '#ffffff'); root.appendChild(background);
  let top = 35;
  const wrap = (text: string, limit: number) => { const result: string[] = []; let line = ''; for (const word of text.split(' ')) { if (line && (line + ' ' + word).length > limit) { result.push(line); line = word; } else line += (line ? ' ' : '') + word; } if (line) result.push(line); return result; };
  const paragraph = (text: string, size: number, bold = false) => { for (const line of wrap(text, size >= 20 ? 59 : 107)) { const node = document.createElementNS(namespace, 'text'); node.textContent = line; node.setAttribute('x', '25'); node.setAttribute('y', String(top)); node.setAttribute('font-family', 'Arial, sans-serif'); node.setAttribute('font-size', String(size)); node.setAttribute('font-weight', bold ? '700' : '400'); node.setAttribute('fill', INK); root.appendChild(node); top += size + 6; } };
  paragraph(title, 23, true); paragraph('CAN YOU BUILD IT · SPORTS / NFL INJURY ANALYSIS', 12); top += 5; paragraph(context, 13); top += 8;
  const original = figure.querySelector('svg'); if (!original) throw new Error('Chart unavailable');
  const clone = original.cloneNode(true) as SVGSVGElement;
  const originalNodes = [original, ...Array.from(original.querySelectorAll('*'))], cloneNodes = [clone, ...Array.from(clone.querySelectorAll('*'))];
  originalNodes.forEach((node, index) => { const computed = getComputedStyle(node), target = cloneNodes[index] as SVGElement; for (const key of ['fill', 'stroke', 'stroke-width', 'font-size', 'font-family', 'font-weight', 'opacity', 'text-anchor', 'stroke-dasharray']) target.style.setProperty(key, computed.getPropertyValue(key)); });
  const plotHeight = original.viewBox.baseVal.height * 750 / 800;
  clone.setAttribute('x', '25'); clone.setAttribute('y', String(top)); clone.setAttribute('width', '750'); clone.setAttribute('height', String(plotHeight)); clone.style.minWidth = ''; clone.style.width = '750px'; clone.style.height = `${plotHeight}px`; root.appendChild(clone); top += plotHeight + 23;
  paragraph(notes, 12); top += 20; background.setAttribute('height', String(top)); root.setAttribute('height', String(top)); root.setAttribute('viewBox', `0 0 800 ${top}`);
  return { svg: new XMLSerializer().serializeToString(root), height: top };
}

export function InjuryMixChart() {
  const [team, setTeam] = useState('SF'), [season, setSeason] = useState(0), [mode, setMode] = useState<'shares' | 'difference'>('shares'), [category, setCategory] = useState('Knee'), [status, setStatus] = useState('');
  const figure = useRef<HTMLElement>(null);
  const rows = mix.comparisons.filter(row => row.team === team && row.season_filter === season);
  const selected = rows.find(row => row.category === category)!;
  const primary = team === 'SF' && season === 0;
  const interval = (key: string) => mix.primary.categories.find(row => row.category === key)!;
  const period = season === 0 ? '2017–2025' : String(season);
  const shareMax = Math.max(25, Math.ceil(Math.max(...rows.flatMap(r => [r.share, r.other_standardized_share])) * 100 / 5) * 5);
  const differenceMax = Math.max(5, Math.ceil(Math.max(...rows.map(r => Math.max(Math.abs(r.adjusted_difference_pp), ...(primary ? [Math.abs(interval(r.category).simultaneous_lo_pp), Math.abs(interval(r.category).simultaneous_hi_pp)] : [])))) / 5) * 5);
  const x = (value: number) => mode === 'shares' ? 216 + value / shareMax * 429 : 216 + (value + differenceMax) / (differenceMax * 2) * 429;
  const ticks = mode === 'shares' ? Array.from({ length: shareMax / 5 + 1 }, (_, i) => i * 5) : [-differenceMax, -differenceMax / 2, 0, differenceMax / 2, differenceMax];
  const source = 'Source: nflverse public regular-season injury/practice reports, 2017–2025. These are physical player-game report listings, not unique injuries, missed games or clinical diagnoses.';
  const intervalNote = primary ? 'Difference whiskers are approximate simultaneous 95% uncertainty ranges across all 11 categories. Every range includes zero.' : 'This team/year selection is descriptive. Uncertainty ranges were calculated only for the full-era SF comparison.';
  const exportNotes = `${source} Each physical player-game listing contributes one unit, divided among its different body regions. Repeat weekly reports count again. Other 31 shares are matched to the selected team's season and listed-position mix. ${mode === 'shares' ? 'Red dot: selected team. Gray dot: matched other 31 teams.' : 'Red dot: selected team minus matched other 31 teams.'} ${primary && mode === 'shares' ? 'The approximate simultaneous 95% ranges for differences across all 11 categories include zero; ranges are not shown in this share view.' : intervalNote} Knee does not identify ACL tears; Calf/Achilles does not identify ruptures.`;
  async function download(png: boolean) {
    if (!figure.current) return;
    try {
      const result = exportChart(figure.current, 'What appears on injury reports?', `${names[team]}, ${period}. ${mode === 'shares' ? 'Share of physical injury/condition report listings (%).' : 'Difference versus matched other 31 teams (percentage points).'} Season/position-standardized comparison.`, exportNotes);
      const svgBlob = new Blob([result.svg], { type: 'image/svg+xml;charset=utf-8' });
      const filename = `injury-report-mix-${team.toLowerCase()}-${season || '2017-2025'}-${mode}`;
      if (!png) save(svgBlob, filename + '.svg');
      else {
        const url = URL.createObjectURL(svgBlob), image = new Image();
        try {
          await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error('Image export failed')); image.src = url; });
          const canvas = document.createElement('canvas'); canvas.width = 1600; canvas.height = Math.ceil(result.height * 2); const context = canvas.getContext('2d'); if (!context) throw new Error('Canvas unavailable'); context.drawImage(image, 0, 0, canvas.width, canvas.height);
          const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('PNG unavailable')), 'image/png')); save(blob, filename + '.png');
        } finally { URL.revokeObjectURL(url); }
      }
      setStatus(`${png ? 'PNG' : 'SVG'} downloaded.`);
    } catch { setStatus('Image export unavailable. Try SVG or use the data table.'); }
  }
  return <figure className="sports-figure" ref={figure}>
    <div className="sports-figure-head"><div><span className="sports-figure-num">Figure 02</span><h3>What appears on injury reports?</h3><p className="sports-figure-sub">Compare the mix of body regions mentioned, not how often players get hurt. One lingering problem can appear in several weeks; players sent directly to injured reserve may be missing.</p></div><div className="sports-chart-actions"><button className="sports-quiet-button" onClick={() => download(true)} aria-label="Download injury-report breakdown as PNG">Save PNG</button><button className="sports-quiet-button" onClick={() => download(false)} aria-label="Download injury-report breakdown as SVG">SVG</button></div></div>
    <div className="sports-controls"><label className="sports-control">Team<select value={team} onChange={e => setTeam(e.target.value)}>{league.teams.map(row => <option value={row.code} key={row.code}>{row.name}</option>)}</select></label><label className="sports-control">Seasons<select value={season} onChange={e => setSeason(Number(e.target.value))}><option value={0}>2017–2025 · all nine</option>{mix.seasons.map(year => <option value={year} key={year}>{year}</option>)}</select></label><div className="sports-toggle" aria-label="Report-mix chart view"><button aria-pressed={mode === 'shares'} onClick={() => setMode('shares')}>Report shares</button><button aria-pressed={mode === 'difference'} onClick={() => setMode('difference')}>Differences</button></div></div>
    <p className="sports-mini-caption"><Metric term="mix">Share of injury reports</Metric> means the percentage of physical report-listing weight assigned to a body region. A knee-and-ankle listing gives half a unit to each, so the categories add to 100%.</p>
    <p className="sports-mini-caption">The other 31 comparison is <strong>matched by season and listed position</strong>: it shows what the rest of the league’s mix would look like with this team’s mix of seasons and player positions.</p>
    <div className="sports-key"><span><i style={{ background: RED }} />{names[team]}</span>{mode === 'shares' ? <span><i style={{ background: GRAY }} />Matched other 31 teams</span> : <span>{primary ? 'Whiskers: simultaneous 95% ranges across 11 categories' : 'Descriptive differences · no uncertainty ranges'}</span>}</div>
    <p className="sports-scroll-hint">Swipe to explore the full chart →</p>
    <div className="sports-chart-scroll"><svg className="sports-chart" viewBox="0 0 800 570" style={{ minWidth: 700 }} role="group" aria-label={`${names[team]}, ${period}: ${mode === 'shares' ? 'body-region report shares' : 'differences in report share'}`}><title>{`${names[team]}, ${period}: physical injury-report body-region mix`}</title>
      {ticks.map(tick => <g key={tick}><line x1={x(tick)} x2={x(tick)} y1={44} y2={512} stroke={tick === 0 ? MUTED : LINE} strokeDasharray={tick === 0 && mode === 'difference' ? '4 4' : undefined} /><text x={x(tick)} y={535} textAnchor="middle">{mode === 'shares' ? `${fmt(tick, 0)}%` : fmt(tick, Number.isInteger(tick) ? 0 : 1)}</text></g>)}
      {mode === 'shares' ? <><text x={707} y={26} textAnchor="end" className="chart-red">{team}</text><text x={780} y={26} textAnchor="end">Other 31</text></> : <text x={780} y={26} textAnchor="end">Gap (pp)</text>}
      {rows.map((row, index) => { const cy = 62 + index * 44, active = row.category === category, ci = interval(row.category); return <g key={row.category} className="plot-target" role="button" tabIndex={0} aria-pressed={active} aria-label={`${row.category}: ${fmt(row.share * 100)}% for ${names[team]}, ${fmt(row.other_standardized_share * 100)}% for matched other 31 teams; difference ${sign(row.adjusted_difference_pp)} percentage points. Show listing details.`} onClick={() => setCategory(row.category)} onKeyDown={e => activate(e, () => setCategory(row.category))}>
        <title>{`${row.category}: ${fmt(row.fractional_listings)} weighted listings / ${fmt(row.physical_listing_rows, 0)} physical player-game listings`}</title><rect x={8} y={cy - 20} width={775} height={40} fill={active ? '#eceae2' : 'transparent'} opacity={active ? .65 : 1} /><text x={200} y={cy + 4} textAnchor="end" className={active ? 'chart-red' : ''}>{row.category}</text>
        {mode === 'shares' ? <><line x1={x(row.share * 100)} x2={x(row.other_standardized_share * 100)} y1={cy} y2={cy} stroke={GRAY} strokeWidth={2} /><circle cx={x(row.other_standardized_share * 100)} cy={cy} r={5.5} fill={GRAY} stroke="#f6f3ec" strokeWidth={1.5} /><circle cx={x(row.share * 100)} cy={cy} r={5.5} fill={RED} stroke="#f6f3ec" strokeWidth={1.5} /><text x={707} y={cy + 4} textAnchor="end" className="chart-red">{fmt(row.share * 100)}%</text><text x={780} y={cy + 4} textAnchor="end">{fmt(row.other_standardized_share * 100)}%</text></> : <>{primary && <><line x1={x(ci.simultaneous_lo_pp)} x2={x(ci.simultaneous_hi_pp)} y1={cy} y2={cy} stroke={GRAY} strokeWidth={2} /><line x1={x(ci.simultaneous_lo_pp)} x2={x(ci.simultaneous_lo_pp)} y1={cy - 5} y2={cy + 5} stroke={GRAY} /><line x1={x(ci.simultaneous_hi_pp)} x2={x(ci.simultaneous_hi_pp)} y1={cy - 5} y2={cy + 5} stroke={GRAY} /></>}<circle cx={x(row.adjusted_difference_pp)} cy={cy} r={5.5} fill={RED} /><text x={780} y={cy + 4} textAnchor="end" className="chart-red">{sign(row.adjusted_difference_pp)}</text></>}
      </g>; })}
      <text x={430} y={562} textAnchor="middle">{mode === 'shares' ? 'Share of physical injury/condition report listings' : 'Difference vs. other 31 teams · percentage points'}</text>
    </svg></div>
    <div className="sports-chart-detail" aria-live="polite"><strong>{names[team]} · {category} · {period}:</strong> {fmt(selected.fractional_listings)} weighted listings out of {fmt(selected.physical_listing_rows, 0)} physical player-game listings: <strong>{fmt(selected.share * 100)}%</strong>, versus {fmt(selected.other_standardized_share * 100)}% in the matched comparison. The gap is {sign(selected.adjusted_difference_pp)} percentage points. These are listing weights, not counts of separate injuries.</div>
    <p className="sports-mini-caption">{intervalNote} {primary && mode === 'shares' && 'Choose Differences to see those ranges.'}</p>
    <details className="sports-view-table"><summary>How this comparison works</summary><p>Each listed player contributes one unit per game report. Different body regions on the same listing split that unit equally. Repeated weekly reports still contribute repeatedly, so a region’s share can reflect how long problems linger and how teams report them.</p><p>The other 31 teams are reweighted to match the selected team’s distribution of listed positions within each season. This compares the composition of reports conditional on being listed; it does not estimate risk per player, snap or game.</p><p>For San Francisco over 2017–2025, uncertainty was estimated by resampling SF player histories and other franchises 4,000 times. The displayed ranges allow for examining all 11 categories together. None excludes zero. Other team/year selections show point estimates without uncertainty ranges.</p><p>“Knee” cannot distinguish a torn ACL from soreness. “Calf / Achilles” does not establish an Achilles rupture. “Concussion-related” includes evaluation, clearance and protocol mentions, not just confirmed concussions. “Other physical condition” includes specified remaining regions and conditions such as ribs, quadriceps, abdomen and dehydration; it is not a bucket of guessed vague entries.</p></details>
    <details className="sports-view-table"><summary>View the data for {names[team]}, {period}</summary><div className="sports-table-scroll"><table className="sports-table"><thead><tr><th scope="col">Body region / condition</th><th scope="col">Weighted listings</th><th scope="col">Physical player-game listings</th><th scope="col">Team share</th><th scope="col">Matched other 31 share</th><th scope="col">Difference (pp)</th>{primary && <><th scope="col">Simultaneous 95% lower</th><th scope="col">Simultaneous 95% upper</th></>}</tr></thead><tbody>{rows.map(row => <tr key={row.category}><th scope="row">{row.category}</th><td>{fmt(row.fractional_listings)}</td><td>{fmt(row.physical_listing_rows, 0)}</td><td>{fmt(row.share * 100)}%</td><td>{fmt(row.other_standardized_share * 100)}%</td><td>{sign(row.adjusted_difference_pp)}</td>{primary && <><td>{sign(interval(row.category).simultaneous_lo_pp)}</td><td>{sign(interval(row.category).simultaneous_hi_pp)}</td></>}</tr>)}</tbody></table></div></details>
    <figcaption><a href={mix.sources.injuries} target="_blank" rel="noreferrer">nflverse public injury/practice reports</a>, regular seasons 2017–2025; existing frozen snapshots. Physical listings exclude illness-only, rest and administrative entries. No partial 2026 data. Comparison standardized by season and listed position. Public reports omit important direct-to-IR cases.</figcaption>
    <span role="status" aria-live="polite" style={{ display: status ? 'block' : 'none', color: MUTED, fontSize: 12 }}>{status}</span>
  </figure>;
}
