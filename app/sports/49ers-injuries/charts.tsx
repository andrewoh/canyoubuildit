'use client';

import { useRef, useState, type ReactNode, type KeyboardEvent } from 'react';
import data from './data.json';
import { Metric } from './glossary';

const RED = '#b33127', INK = '#22251f', MUTED = '#63675e', GRAY = '#a9aca2', LIGHT = '#d8d7ce';
const WIDTH = 800;
type Profile = (typeof data.profiles.rows)[number];
type Feature = keyof Profile['raw_features'];
const featureKeys = data.profiles.feature_order as Feature[];
const names = Object.fromEntries(data.teams.map(t => [t.code, t.name]));
const num = (n: number, d = 1) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const signed = (n: number, d = 1) => `${n > 0 ? '+' : ''}${num(n, d)}`;
const path = (points: [number, number][]) => points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
function onKey(event: KeyboardEvent<SVGElement>, action: () => void) { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); action(); } }
function Table({ headers, rows, label = 'View the data' }: { headers: string[]; rows: (string | number)[][]; label?: string }) {
  return <details className="sports-view-table"><summary>{label}</summary><div className="sports-table-scroll"><table className="sports-table"><thead><tr>{headers.map((h, i) => <th key={i} scope="col">{h}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i}>{r.map((v, j) => j === 0 ? <th scope="row" key={j}>{v}</th> : <td key={j}>{v}</td>)}</tr>)}</tbody></table></div></details>;
}
function Svg({ height, label, children, minWidth = 640 }: { height: number; label: string; children: ReactNode; minWidth?: number }) {
  return <><p className="sports-scroll-hint">Swipe to explore the full chart →</p><div className="sports-chart-scroll"><svg className="sports-chart" viewBox={`0 0 ${WIDTH} ${height}`} role="group" aria-label={label} data-export-title={label} style={{ minWidth, fontFamily: 'Arial, sans-serif' }}><title>{label}</title>{children}</svg></div></>;
}
function Grid({ ticks, x, y1, y2 }: { ticks: number[]; x: (v: number) => number; y1: number; y2: number }) {
  return <>{ticks.map(t => <g key={t}><line x1={x(t)} x2={x(t)} y1={y1} y2={y2} stroke={t === 100 ? MUTED : LIGHT} strokeDasharray={t === 100 ? '4 4' : undefined} /><text x={x(t)} y={y2 + 23} textAnchor="middle" style={{ fontSize: 13 }}>{t}</text></g>)}</>;
}
function save(blob: Blob, filename: string) { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 2000); }
function exportedSvg(figure: HTMLElement, title: string, source: string, exportNotes = '') {
  const ns = 'http://www.w3.org/2000/svg';
  const root = document.createElementNS(ns, 'svg'); root.setAttribute('width', '800');
  const bg = document.createElementNS(ns, 'rect'); bg.setAttribute('fill', '#ffffff'); bg.setAttribute('width', '800'); root.appendChild(bg);
  function textLine(text: string, x: number, y: number, size: number, weight = '400') { const el = document.createElementNS(ns, 'text'); el.textContent = text; el.setAttribute('x', String(x)); el.setAttribute('y', String(y)); el.setAttribute('fill', INK); el.setAttribute('font-family', 'Arial, sans-serif'); el.setAttribute('font-size', String(size)); el.setAttribute('font-weight', weight); root.appendChild(el); }
  function lines(text: string, width: number) { const words = text.split(' '), result: string[] = []; let line = ''; for (const w of words) { if ((line + ' ' + w).length > width && line) { result.push(line); line = w; } else line += (line ? ' ' : '') + w; } if (line) result.push(line); return result; }
  let y = 34; for (const line of lines(title, 57)) { textLine(line, 25, y, 23, '700'); y += 29; } textLine('CAN YOU BUILD IT · SPORTS / NFL INJURY ANALYSIS', 25, y + 2, 12); y += 25; for (const line of lines(figure.querySelector('.sports-figure-sub')?.textContent || '', 98)) { textLine(line, 25, y + 14, 13); y += 18; } y += 10;
  const svgs = Array.from(figure.querySelectorAll('svg'));
  for (const original of svgs) {
    const box = original.viewBox.baseVal, height = box.height * (750 / box.width);
    { for (const line of lines(original.getAttribute('data-export-title') || '', 91)) { textLine(line, 25, y + 17, 14, '700'); y += 21; } }
    const clone = original.cloneNode(true) as SVGSVGElement;
    const originals = [original, ...Array.from(original.querySelectorAll('*'))], clones = [clone, ...Array.from(clone.querySelectorAll('*'))];
    originals.forEach((el, i) => { const style = getComputedStyle(el); const target = clones[i] as SVGElement; for (const key of ['fill', 'stroke', 'stroke-width', 'font-size', 'font-family', 'font-weight', 'opacity', 'text-anchor', 'stroke-dasharray']) target.style.setProperty(key, style.getPropertyValue(key)); });
    clone.setAttribute('x', '25'); clone.setAttribute('y', String(y)); clone.setAttribute('width', '750'); clone.setAttribute('height', String(height)); clone.style.minWidth = ''; clone.style.width = '750px'; clone.style.height = `${height}px`; clone.style.overflow = 'visible'; root.appendChild(clone); y += height + 22;
  }
  for (const paragraph of [exportNotes, source].filter(Boolean)) { for (const line of lines(paragraph, 107)) { textLine(line, 25, y + 15, 12); y += 17; } y += 8; } y += 14;
  root.setAttribute('height', String(y)); root.setAttribute('viewBox', `0 0 800 ${y}`); bg.setAttribute('height', String(y));
  return { serialized: new XMLSerializer().serializeToString(root), height: y };
}
function Figure({ title, subtitle, number, source, exportNotes = '', children }: { title: string; subtitle: string; number: string; source: string; exportNotes?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null); const [status, setStatus] = useState('');
  async function download(png: boolean) {
    if (!ref.current) return;
    try {
      const result = exportedSvg(ref.current, title, source, exportNotes); const blob = new Blob([result.serialized], { type: 'image/svg+xml;charset=utf-8' }); const filename = `49ers-${number}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '')}`;
      if (!png) save(blob, filename + '.svg');
      else {
        const url = URL.createObjectURL(blob), img = new Image();
        await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('Image export failed')); img.src = url; });
        const canvas = document.createElement('canvas'); canvas.width = 1600; canvas.height = Math.ceil(result.height * 2); const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Canvas unavailable'); ctx.drawImage(img, 0, 0, canvas.width, canvas.height); URL.revokeObjectURL(url);
        const pngBlob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Image export failed')), 'image/png')); save(pngBlob, filename + '.png');
      }
      setStatus(`${png ? 'PNG' : 'SVG'} downloaded.`);
    } catch { setStatus('Image export unavailable in this browser. Try SVG or use the data table.'); }
  }
  return <figure className="sports-figure" ref={ref}><div className="sports-figure-head"><div><span className="sports-figure-num">Figure {number}</span><h3>{title}</h3><p className="sports-figure-sub">{subtitle}</p></div><div className="sports-chart-actions"><button className="sports-quiet-button" onClick={() => download(true)} aria-label={`Download ${title} as PNG`}>Save PNG</button><button className="sports-quiet-button" onClick={() => download(false)} aria-label={`Download ${title} as SVG`}>SVG</button></div></div>{children}<figcaption>{source}</figcaption><span role="status" aria-live="polite" style={{ display: status ? 'block' : 'none', fontSize: 12, color: MUTED }}>{status}</span></figure>;
}

export function HeroChart() {
  const x = (year: number) => 32 + (year - 2017) / 8 * 716, y = (v: number) => 178 - v / 280 * 160;
  return <div className="sports-hero-graphic"><svg viewBox="0 0 800 205" role="img" aria-label="San Francisco's injury burden across 2017–2025 in red, compared with every other NFL team in gray. 100 is the league average."><title>49ers injury burden, 2017–2025</title><line x1={32} x2={748} y1={y(100)} y2={y(100)} stroke={MUTED} strokeDasharray="3 5" opacity=".5" />{data.teams.filter(t => t.code !== 'SF').map(t => <path key={t.code} d={path(data.agl.rows.filter(r => r.team === t.code).map(r => [x(r.season), y(r.index)]))} fill="none" stroke={GRAY} strokeWidth="1" opacity=".24" />)}<path className="sf-line" d={path(data.agl.rows.filter(r => r.team === 'SF').map(r => [x(r.season), y(r.index)]))} fill="none" stroke={RED} strokeWidth="3" />{data.agl.rows.filter(r => r.team === 'SF').map(r => <circle key={r.season} cx={x(r.season)} cy={y(r.index)} r="3.5" fill={RED} />)}<text className="hero-label" x={32} y={195} fill={MUTED}>2017</text><text className="hero-label" x={748} y={195} textAnchor="end" fill={MUTED}>2025</text><text className="hero-label" x={750} y={y(100) + 14} textAnchor="end" fill={MUTED}>100 = NFL average</text><text className="hero-label" x={x(2020)} y={y(227.4) - 12} textAnchor="middle" fill={RED}>2020</text><text className="hero-label" x={x(2024)} y={y(183.5) - 12} textAnchor="middle" fill={RED}>2024</text></svg></div>;
}

export function LeagueChart() {
  const [team, setTeam] = useState('SF'), [mode, setMode] = useState<'annual' | 'rank'>('annual'), [omit, setOmit] = useState(false), [detailYear, setDetailYear] = useState(2024);
  const annual = data.agl.rows.filter(r => !omit || ![2020, 2021].includes(r.season));
  const selected = annual.filter(r => r.team === team);
  const ranking = data.teams.map(t => { const values = annual.filter(r => r.team === t.code); return { team: t.code, index: values.reduce((a, r) => a + r.index, 0) / values.length }; }).sort((a, b) => b.index - a.index);
  const rank = ranking.findIndex(r => r.team === team) + 1, mean = ranking[rank - 1].index;
  const detail = selected.find(r => r.season === detailYear) || selected[selected.length - 1];
  const xYear = (year: number) => 70 + (year - 2017) / 8 * 650, y = (v: number) => 300 - v / 280 * 250;
  const years = Array.from(new Set(annual.map(r => r.season)));
  const xr = (v: number) => 83 + v / 165 * 626;
  return <Figure number="01" title="Where each team sits in the injury table" subtitle="Injury burden relative to that season’s league. Higher is worse; 100 is the NFL average." source="Sources: Football Outsiders / FTN adjusted games lost, 2017–2025. Era ranking averages annual indexes equally. Excluding 2020–21 tests pandemic-era sensitivity; direct COVID absences were already excluded from those AGL tables.">
    <div className="sports-controls"><label className="sports-control">Team<select value={team} onChange={e => setTeam(e.target.value)}>{data.teams.map(t => <option key={t.code} value={t.code}>{t.name}</option>)}</select></label><div className="sports-toggle" aria-label="Chart view"><button aria-pressed={mode === 'annual'} onClick={() => setMode('annual')}>By season</button><button aria-pressed={mode === 'rank'} onClick={() => setMode('rank')}>Era ranking</button></div><label className="sports-control">Seasons<select value={omit ? 'omit' : 'all'} onChange={e => setOmit(e.target.value === 'omit')}><option value="all">2017–2025 · all nine</option><option value="omit">Exclude 2020 and 2021</option></select></label></div>
    <div className="sports-key"><span><i style={{ background: RED }} />{names[team]}</span><span><i style={{ background: GRAY }} />Other NFL teams</span><span>Dashed line: 100 = league average</span></div>
    {mode === 'annual' ? <Svg height={345} label={`${names[team]} annual injury index${omit ? ', excluding 2020–2021' : ''}`}>
      {[0, 50, 100, 150, 200, 250].map(t => <g key={t}><line x1={70} x2={730} y1={y(t)} y2={y(t)} stroke={t === 100 ? MUTED : LIGHT} strokeDasharray={t === 100 ? '4 4' : undefined} /><text x={56} y={y(t) + 4} textAnchor="end">{t}</text></g>)}
      {data.teams.filter(t => t.code !== team).map(t => <path key={t.code} d={path(annual.filter(r => r.team === t.code).map(r => [xYear(r.season), y(r.index)]))} fill="none" stroke={GRAY} strokeWidth="1" opacity=".24" />)}
      <path d={path(selected.map(r => [xYear(r.season), y(r.index)]))} fill="none" stroke={RED} strokeWidth="3" />
      {selected.map(r => <g key={r.season} className="plot-target" tabIndex={0} role="button" aria-label={`${r.season}: injury index ${num(r.index)}`} onMouseEnter={() => setDetailYear(r.season)} onFocus={() => setDetailYear(r.season)} onClick={() => setDetailYear(r.season)} onKeyDown={e => onKey(e, () => setDetailYear(r.season))}><circle cx={xYear(r.season)} cy={y(r.index)} r="12" fill="transparent" /><circle cx={xYear(r.season)} cy={y(r.index)} r={detail.season === r.season ? 6 : 4} fill={RED} stroke="#f6f3ec" strokeWidth="2" /><text x={xYear(r.season)} y={y(r.index) - 12} textAnchor="middle" className="chart-red">{num(r.index, 0)}</text></g>)}
      {years.map(t => <text key={t} x={xYear(t)} y={327} textAnchor="middle">{t}</text>)}
    </Svg> : <Svg height={826} label={`NFL era injury ranking${omit ? ', excluding 2020–2021' : ', 2017–2025'}`}>
      <Grid ticks={[0, 50, 100, 150]} x={xr} y1={15} y2={782} />
      {ranking.map((r, i) => <g key={r.team} className="plot-target" tabIndex={0} role="button" aria-label={`${names[r.team]}, rank ${i + 1}, injury index ${num(r.index)}`} onClick={() => setTeam(r.team)} onKeyDown={e => onKey(e, () => setTeam(r.team))}><text x={69} y={28 + i * 24} textAnchor="end" className={r.team === team ? 'chart-red' : ''}>{r.team}</text><rect x={xr(0)} y={16 + i * 24} width={xr(r.index) - xr(0)} height="15" fill={r.team === team ? RED : GRAY} /><text x={xr(r.index) + 8} y={28 + i * 24} className={r.team === team ? 'chart-red' : ''}>{num(r.index)}</text></g>)}
    </Svg>}
    <div className="sports-chart-detail" aria-live="polite"><strong>{names[team]}</strong>: {num(mean)} across {omit ? 'seven selected' : 'nine'} seasons, rank {rank} of 32 from most injured. {mode === 'annual' && <>{detail.season}: {num(detail.index)} ({num(detail.agl)} adjusted games lost).</>}</div>
    <Table headers={mode === 'annual' ? ['Season', 'Team', 'Adjusted games lost', 'Injury index', 'Healthiest rank'] : ['Injury rank', 'Team', 'Mean injury index']} rows={mode === 'annual' ? selected.map(r => [r.season, names[r.team], num(r.agl), num(r.index), r.rank_healthiest]) : ranking.map((r, i) => [i + 1, names[r.team], num(r.index)])} />
  </Figure>;
}

export function ProfilesChart() {
  const [year, setYear] = useState(2024), [team, setTeam] = useState('SF');
  const all = data.profiles.rows, seasonRows = all.filter(r => r.season === year), selected = seasonRows.find(r => r.team === team)!;
  const distance = (row: Profile) => Math.sqrt(row.standardized_features.reduce((sum, v, i) => sum + (v - selected.standardized_features[i]) ** 2, 0));
  const peers = seasonRows.filter(r => r.team !== team).map(r => ({ ...r, distance: distance(r) })).sort((a, b) => a.distance - b.distance).slice(0, 5);
  const displayPeers = [selected, ...peers];
  const percentile = (f: Feature) => (seasonRows.filter(r => r.raw_features[f] < selected.raw_features[f]).length + .5 * seasonRows.filter(r => r.raw_features[f] === selected.raw_features[f]).length) / seasonRows.length * 100;
  const clusterName = data.profiles.centroids.find(c => c.cluster === selected.cluster)!.label;
  const xMin = Math.floor(Math.min(...all.map(r => r.pca[0]))), xMax = Math.ceil(Math.max(...all.map(r => r.pca[0]))), yMin = Math.floor(Math.min(...all.map(r => r.pca[1]))), yMax = Math.ceil(Math.max(...all.map(r => r.pca[1])));
  const x = (v: number) => 72 + (v - xMin) / (xMax - xMin) * 660, y = (v: number) => 340 - (v - yMin) / (yMax - yMin) * 285;
  const percentX = (v: number) => 292 + v / 100 * 355;
  const maxBurden = Math.max(200, Math.ceil(Math.max(...displayPeers.map(r => r.index)) / 50) * 50), peerX = (v: number) => 120 + v / maxBurden * 580;
  const formatFeature = (f: Feature, value: number) => ['same_team_returner_snap_share', 'top22_snap_share', 'run_share'].includes(f) ? `${num(value * 100)}%` : num(value, f === 'snap_weighted_age' ? 2 : 0);
  const shortLabels = ['Snap-weighted age', 'Roster continuity', 'Regular-player concentration', 'Regular-season playing volume', 'Recent playoff exposure', 'Offensive run share'];
  const centroidGroups = [...data.profiles.centroids].sort((a, b) => a.cluster - b.cluster);
  const centroidValue = (f: Feature, value: number) => ['same_team_returner_snap_share', 'top22_snap_share', 'run_share'].includes(f) ? `${num(value * 100)}%` : num(value, f === 'scrimmage_player_snaps_per_game' ? 1 : 2);
  return <Figure number="06" exportNotes={`Map markers: filled gray = established contenders; hollow gray = less established rosters; red = selected team. Features describe the ${selected.feature_season} regular season; playoff exposure spans ${year - 3}–${year - 1}. Continuity is the share of ${selected.feature_season} snaps played by players who also recorded a same-club scrimmage snap in ${year - 2}; it does not measure retention into ${year}. Percentile fingerprints compare all 32 clubs entering ${year}.`} title="How similar teams fared" subtitle="Choose a season and team to explore broad roster profiles, then compare the five closest teams in all six measured attributes." source="Sources: nflverse snaps, schedules, player birth dates and team statistics; Football Outsiders / FTN AGL. All attributes precede the injury season. Injury index: 100 = that season’s NFL average. Injury outcomes were excluded from clustering. Nearest profiles use all six standardized attributes; they are comparisons, not causal controls.">
    <div className="sports-controls"><label className="sports-control">Injury season<select value={year} onChange={e => setYear(Number(e.target.value))}>{Array.from({ length: 8 }, (_, i) => 2018 + i).map(y => <option key={y}>{y}</option>)}</select></label><label className="sports-control">Team<select value={team} onChange={e => setTeam(e.target.value)}>{data.teams.map(t => <option key={t.code} value={t.code}>{t.name}</option>)}</select></label></div>
    <div className="sports-key"><span><i style={{ background: RED }} />Selected team</span><span><i style={{ background: MUTED }} />Established contenders</span><span><i style={{ background: 'transparent', border: `1.5px solid ${MUTED}` }} />Less established rosters</span></div>
    <Svg height={390} label={`${year} team profiles: two-dimensional overview`}>
      {Array.from({ length: xMax - xMin + 1 }, (_, i) => xMin + i).filter(v => v % 2 === 0).map(v => <g key={v}><line x1={x(v)} x2={x(v)} y1={55} y2={340} stroke={LIGHT} strokeDasharray={v === 0 ? '4 4' : undefined} /><text x={x(v)} y={361} textAnchor="middle">{v}</text></g>)}
      {Array.from({ length: yMax - yMin + 1 }, (_, i) => yMin + i).filter(v => v % 2 === 0).map(v => <g key={v}><line x1={72} x2={732} y1={y(v)} y2={y(v)} stroke={LIGHT} /><text x={58} y={y(v) + 4} textAnchor="end">{v}</text></g>)}
      <text x={72} y={25} style={{ fontSize: 13 }}>Overlapping profiles, not distinct team types</text><text x={402} y={385} textAnchor="middle">Profile direction 1 · 30.6% of variation</text><text x={14} y={198} transform="rotate(-90 14 198)" textAnchor="middle">Direction 2 · 22.9%</text>
      {[...seasonRows.filter(r => r.team !== team), selected].map(r => <g key={r.team} className="plot-target" role="button" tabIndex={0} aria-label={`${names[r.team]}, ${data.profiles.centroids[r.cluster].label}, injury index ${num(r.index)}. Select team.`} aria-pressed={r.team === team} onClick={() => setTeam(r.team)} onKeyDown={e => onKey(e, () => setTeam(r.team))}><title>{`${names[r.team]} · injury index ${num(r.index)}`}</title><circle cx={x(r.pca[0])} cy={y(r.pca[1])} r={r.team === team ? 8 : 5.5} fill={r.team === team ? RED : r.cluster === 1 ? MUTED : '#f6f3ec'} stroke={r.team === team ? RED : MUTED} strokeWidth={1.4} />{r.team === team && <text x={x(r.pca[0]) + (x(r.pca[0]) > 675 ? -13 : 13)} y={y(r.pca[1]) - 9} textAnchor={x(r.pca[0]) > 675 ? 'end' : 'start'} className="chart-red">{r.team}</text>}</g>)}
    </Svg>
    <p className="sports-mini-caption">This projection retains 53.4% of feature variation. The grouping has weak separation (silhouette 0.181); distances on this map are not the distances used to select peers.</p>
    <div className="sports-chart-detail" aria-live="polite"><strong>{names[team]}, {year}</strong> falls in “{clusterName.toLowerCase()}.” Broad-group membership is retained in {num(selected.membership_stability * 100, 0)}% of franchise bootstrap fits. Its injury index is <strong>{num(selected.index)}</strong>; 100 is the league average.</div>
    <details className="sports-view-table"><summary>Compare the two group profiles</summary><p className="sports-mini-caption">Established contenders tend to be older, more continuous, and have greater recent playoff exposure; regular-season playing volume is almost identical. These are pooled descriptive means across all 256 team-seasons, not injury-risk importance scores.</p><div className="sports-table-scroll"><table className="sports-table"><thead><tr><th scope="col">Attribute</th>{centroidGroups.map(c => <th scope="col" key={c.cluster}>{c.label}</th>)}</tr></thead><tbody><tr><th scope="row">Team-seasons in group</th>{centroidGroups.map(c => <td key={c.cluster}>{c.n}</td>)}</tr>{featureKeys.map((f, i) => <tr key={f}><th scope="row">{shortLabels[i]}{f === 'post_games_3yr' ? ' (games / 3 years)' : f === 'scrimmage_player_snaps_per_game' ? ' (player snaps / game)' : f === 'snap_weighted_age' ? ' (years)' : ''}</th>{centroidGroups.map(c => <td key={c.cluster}>{centroidValue(f, c.raw_features[f])}</td>)}</tr>)}</tbody><tfoot><tr><th scope="row">Following-season injury index (100 = NFL average)</th>{centroidGroups.map(c => <td key={c.cluster}>{num(c.index)}</td>)}</tr></tfoot></table></div><p className="sports-mini-caption">The following-season injury index was excluded from grouping. The difference in health between the two groups is not statistically clear.</p></details>
    <h4 className="sports-profile-heading">What the team looked like entering {year}</h4><p className="sports-mini-caption">Percentiles among 32 teams that year. Values describe {selected.feature_season}, except playoff exposure, which covers the preceding three seasons. Higher percentile means more of that attribute, not more injury risk.</p>
    <p className="sports-mini-caption"><Metric term="age">Age</Metric> gives more weight to players who played more. <Metric term="continuity">Continuity</Metric> asks how much of the previous season’s playing time came from players already on that team a year earlier. <Metric term="concentration">Concentration</Metric> is the share handled by its 22 most-used players.</p>
    <p className="sports-mini-caption">A <Metric term="playerSnaps">player-snap</Metric> means one player taking part in one play: an ordinary offensive play contributes about 11 player-snaps. Playing volume adds offense and defense. <Metric term="runShare">Run share</Metric> is the percentage of offensive plays recorded as runs, including quarterback scrambles and kneel-downs.</p>
    <details className="sports-view-table"><summary>What these attributes mean</summary><dl>{data.profiles.feature_definitions.map(f => <div key={f.key} style={{ margin: '12px 0' }}><dt style={{ fontWeight: 700 }}>{f.label}</dt><dd style={{ margin: '4px 0 0', lineHeight: 1.6 }}>{f.definition}</dd></div>)}</dl></details>
    <Svg height={278} label={`${names[team]} entering ${year}: six-attribute percentile fingerprint`}>
      {[0, 50, 100].map(v => <g key={v}><line x1={percentX(v)} x2={percentX(v)} y1={27} y2={236} stroke={LIGHT} strokeDasharray={v === 50 ? '4 4' : undefined} /><text x={percentX(v)} y={260} textAnchor="middle">{v === 50 ? '50th' : v === 100 ? '100th' : '0th'}</text></g>)}<text x={770} y={19} textAnchor="end">Actual value</text>
      {featureKeys.map((f, i) => <g key={f}><text x={12} y={48 + i * 36} className="chart-strong">{shortLabels[i]}</text><line x1={percentX(0)} x2={percentX(100)} y1={43 + i * 36} y2={43 + i * 36} stroke={LIGHT} strokeWidth={3} /><circle cx={percentX(percentile(f))} cy={43 + i * 36} r="5.5" fill={RED} /><text x={percentX(percentile(f))} y={33 + i * 36} textAnchor="middle" className="chart-red">{num(percentile(f), 0)}</text><text x={770} y={48 + i * 36} textAnchor="end" className="chart-strong">{formatFeature(f, selected.raw_features[f])}</text></g>)}
    </Svg>
    <h4 className="sports-profile-heading">The nearest profiles do not necessarily share its injuries</h4><p className="sports-mini-caption">The five nearest teams in the same season, ranked by distance across all six standardized attributes. Selected team appears first. 100 = that season’s NFL injury burden.</p>
    <Svg height={272} label={`${year} injury burden: ${names[team]} and its five closest profiles (100 = NFL average)`}>
      <Grid ticks={Array.from({ length: maxBurden / 50 + 1 }, (_, i) => i * 50)} x={peerX} y1={17} y2={233} />
      {displayPeers.map((r, i) => <g key={r.team}><text x={104} y={41 + i * 35} textAnchor="end" className={r.team === team ? 'chart-red' : ''}>{r.team}{i > 0 ? ` ·${i}` : ''}</text><rect x={peerX(0)} y={27 + i * 35} width={peerX(r.index) - peerX(0)} height={19} fill={r.team === team ? RED : GRAY} /><text x={peerX(r.index) + 8} y={41 + i * 35} className={r.team === team ? 'chart-red' : ''}>{num(r.index)}</text></g>)}
    </Svg>
    <Table label={`View all ${year} profiles and distances`} headers={['Team', 'Group', 'Injury index', 'Age', 'Continuity', 'Top 22 share', 'Player snaps/game', 'Playoff games/3 years', 'Run share', 'Distance to selection']} rows={[...seasonRows].sort((a, b) => distance(a) - distance(b)).map(r => [names[r.team], data.profiles.centroids[r.cluster].label, num(r.index), ...featureKeys.map(f => formatFeature(f, r.raw_features[f])), num(distance(r), 3)])} />
  </Figure>;
}

const importanceLabels: Record<string, string> = {
  'Earlier snap workload': 'Playing time in earlier games',
  'Prior injury-report history': 'Earlier injury reports',
  'Schedule / recovery': 'Schedule and recovery',
  'Team identity': 'Which team',
  'Position': 'Player position',
  'Age': 'Age',
  'Home / away': 'Home or away',
  'Previous-game surface': 'Playing surface'
};
const importanceNotes: Record<string, string> = {
  'Earlier snap workload': 'Player role and earlier playing exposure supplied substantial predictive information. Earlier snap share mattered more than the trailing 28-day total. This is not a test of prior-year workload and does not establish overtraining.',
  'Prior injury-report history': 'Players with earlier public injury or physical-condition reports were more likely to appear on another report. Repeated listings can reflect a lingering problem; they are not independent injury diagnoses.',
  'Schedule / recovery': 'Most of this group’s signal came from days until the next game and calendar week. Rest before the index game contributed approximately zero. Recovery and reporting timing can both affect this pattern.',
  'Team identity': 'Knowing the team added little predictive information after measured attributes. The uncertainty interval crosses zero. This does not rule out differences in staff, practices or reporting behavior.',
  'Position': 'Position adds some predictive information, but position, role and snap exposure overlap. Permutation importance does not isolate an independent medical effect.',
  'Age': 'Age contributed little to this particular weekly reporting model. That does not establish that age has no effect on injuries or on season-long availability.',
  'Home / away': 'Home or away status contributed almost no additional information in this selected report-prediction sample. It is not a causal test of travel or recovery.',
  'Previous-game surface': 'The model found no reliable incremental predictive contribution. The public-report target misses major direct-to-IR injuries and cannot settle whether turf causes injuries.'
};
export function ImportanceChart() {
  const [group, setGroup] = useState('Earlier snap workload');
  const importance = data.report_model.importance;
  const x = (v: number) => 286 + (v + .3) / 4.1 * 435;
  return <Figure number="07" title="Predictive clues are not causes" subtitle="Longer bars show which kinds of information helped the model predict another injury-report appearance. They do not show what caused injuries." source="Sources: nflverse; original 2024–2025 held-out next-report model, 41,858 eligible player-game transitions. Bars are grouped permutation importance in AP percentage points (100 × change in average precision). Whiskers are conditional 95% game-cluster bootstrap intervals. The outcome is a new public physical-condition report, not injury incidence or season-long games lost.">
    <div className="sports-key"><span><i style={{ background: RED }} />Selected feature group</span><span><i style={{ background: GRAY }} />Other groups</span><span>Whiskers: <Metric term="interval">95% uncertainty ranges</Metric></span></div>
    <p className="sports-mini-caption">The score is the drop in <Metric term="precision">average precision</Metric> after we scramble that information. Bigger drops mean more useful clues; they are not percentages of injuries explained.</p><Svg height={388} label="Held-out feature importance: AP percentage points lost after shuffling">
      {[-.25, 0, 1, 2, 3].map(v => <g key={v}><line x1={x(v)} x2={x(v)} y1={18} y2={335} stroke={v === 0 ? MUTED : LIGHT} strokeDasharray={v === 0 ? '4 4' : undefined} /><text x={x(v)} y={358} textAnchor="middle">{v}</text></g>)}
      {importance.map((r, i) => { const cy = 39 + i * 40, value = r.ap_drop_points, [lo, hi] = r.ap_bootstrap_ci_points, active = r.feature_group === group; return <g key={r.feature_group} tabIndex={0} role="button" aria-pressed={active} aria-label={`${importanceLabels[r.feature_group]}: ${num(value, 3)} AP percentage points; 95% interval ${num(lo, 3)} to ${num(hi, 3)}. Show interpretation.`} className="plot-target" onClick={() => setGroup(r.feature_group)} onKeyDown={e => onKey(e, () => setGroup(r.feature_group))}><rect x={5} y={cy - 17} width={774} height={35} fill="transparent" /><text x={260} y={cy + 5} textAnchor="end" className={active ? 'chart-red' : ''}>{importanceLabels[r.feature_group]}</text><rect x={Math.min(x(0), x(value))} y={cy - 9} width={Math.max(1, Math.abs(x(value) - x(0)))} height={18} fill={active ? RED : GRAY} /><line x1={x(lo)} x2={x(hi)} y1={cy} y2={cy} stroke={INK} strokeWidth={1.5} /><line x1={x(lo)} x2={x(lo)} y1={cy - 5} y2={cy + 5} stroke={INK} /><line x1={x(hi)} x2={x(hi)} y1={cy - 5} y2={cy + 5} stroke={INK} /><text x={774} y={cy + 5} textAnchor="end" className={active ? 'chart-red' : ''}>{signed(value, 2)}</text></g>; })}
      <text x={505} y={384} textAnchor="middle">Average precision lost · percentage points</text>
    </Svg>
    <div className="sports-chart-detail" aria-live="polite"><strong>{group === 'Earlier snap workload' ? <Metric term="workload">{importanceLabels[group]}</Metric> : group === 'Prior injury-report history' ? <Metric term="history">{importanceLabels[group]}</Metric> : importanceLabels[group]}.</strong> {importanceNotes[group]}</div>
    <p className="sports-mini-caption">The model offers modest clues; it cannot explain San Francisco’s season-long injury burden. Select a bar to see what that information can—and cannot—tell us.</p>
    <details className="sports-view-table"><summary>How prediction was checked</summary><p>The model trained on 2017–2022, was selected using 2023, then was refit through 2023 and tested on 2024–2025. It predicts a new public physical-condition report before the next game among eligible active players, not a medical injury diagnosis or total time lost.</p><p>Its held-out AUC was 0.663; average precision (AP) was 0.151 versus a baseline of 0.091. These scores indicate modest predictive ability. The bars show AP percentage points: 100 × the change in average precision after related information is shuffled. A 2.79-point drop means 0.0279 on the 0–1 AP scale. Whiskers are conditional 95% intervals from resampling games; they omit some other uncertainty.</p></details>
    <Table headers={['Feature group', 'AP percentage points lost', 'Conditional 95% lower (pp)', 'Conditional 95% upper (pp)']} rows={importance.map(r => [importanceLabels[r.feature_group], num(r.ap_drop_points, 3), num(r.ap_bootstrap_ci_points[0], 3), num(r.ap_bootstrap_ci_points[1], 3)])} />
  </Figure>;
}
