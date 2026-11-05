'use client';

import { useId, useState } from 'react';
import injuryData from '../../data/portfolio-injuries.json';
import './data-lab.css';

const { seasons, teams } = injuryData;
const left = 46;
const right = 718;
const top = 26;
const bottom = 252;
const ceiling = Math.ceil(Math.max(...teams.flatMap(team => team.index)) / 50) * 50;
const x = (i: number) => left + (i / (seasons.length - 1)) * (right - left);
const y = (value: number) => bottom - (value / ceiling) * (bottom - top);
const pathFor = (values: number[]) => values.map((value, i) => `${i ? 'L' : 'M'}${x(i)},${y(value)}`).join(' ');
const average = (values: number[]) => values.reduce((total, value) => total + value, 0) / values.length;

export default function DataLab() {
  const [teamCode, setTeamCode] = useState('SF');
  const [comparisonCode, setComparisonCode] = useState('league');
  const [selectedYear, setSelectedYear] = useState(seasons.length - 1);
  const id = useId().replace(/:/g, '');
  const team = teams.find(item => item.code === teamCode)!;
  const comparison = teams.find(item => item.code === comparisonCode);
  const mean = average(team.index);
  const current = team.index[selectedYear];
  const difference = mean - 100;
  const comparisonValue = comparison ? comparison.index[selectedYear] : 100;
  const note = Math.abs(difference) < 0.05
    ? 'at the league average across these nine seasons'
    : `${Math.abs(difference).toFixed(1)}% ${difference > 0 ? 'above' : 'below'} the league average across these nine seasons`;

  return <div className="data-lab">
    <div className="data-lab-topline">
      <p>2017–2025 · adjusted games lost</p>
      <span><i aria-hidden="true" /> REAL DATA / EXPLORE IT</span>
    </div>
    <div className="data-lab-controls">
      <label htmlFor={`${id}-team`}>Choose a team
        <select id={`${id}-team`} value={teamCode} onChange={event => setTeamCode(event.target.value)}>
          {teams.map(item => <option key={item.code} value={item.code}>{item.name}</option>)}
        </select>
      </label>
      <label htmlFor={`${id}-comparison`}>Compare with
        <select id={`${id}-comparison`} value={comparisonCode} onChange={event => setComparisonCode(event.target.value)}>
          <option value="league">NFL average</option>
          {teams.map(item => <option key={item.code} value={item.code}>{item.name}</option>)}
        </select>
      </label>
      <div className="data-lab-mean" aria-live="polite" aria-atomic="true">
        <strong>{mean.toFixed(1)}</strong><span>nine-season<br />mean index</span>
      </div>
    </div>
    <div className="data-lab-chart-header">
      <div className="data-lab-legend">
        <span><i className="data-lab-key-primary" />{team.name}</span>
        {comparison && <span><i className="data-lab-key-comparison" />{comparison.name}</span>}
        <span><i className="data-lab-key-average" />NFL average = 100</span>
      </div>
      <span className="data-lab-chart-unit">HIGHER = MORE AVAILABILITY LOST</span>
    </div>
    <div className="data-lab-chart">
      <svg viewBox="0 0 760 290" role="group" aria-labelledby={`${id}-title ${id}-description`}>
        <title id={`${id}-title`}>{`${team.name} injury burden from 2017 to 2025`}</title>
        <desc id={`${id}-description`}>Season-normalized adjusted games lost index. League average is 100. Each point can be focused or selected. Use the season slider below to inspect the same data.</desc>
        <defs>
          <linearGradient id={`${id}-fill`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#d7fd78" stopOpacity=".16" />
            <stop offset="100%" stopColor="#d7fd78" stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({length: ceiling / 50 + 1}, (_,i) => i * 50).map(tick => <g key={tick}>
          <line x1={left} x2={right} y1={y(tick)} y2={y(tick)} className={tick === 100 ? 'data-lab-baseline' : 'data-lab-gridline'} />
          <text x={left - 13} y={y(tick) + 4} textAnchor="end" className="data-lab-axis-label">{tick}</text>
        </g>)}
        <path d={`${pathFor(team.index)} L${right},${bottom} L${left},${bottom} Z`} fill={`url(#${id}-fill)`} />
        {comparison && <path d={pathFor(comparison.index)} className="data-lab-comparison-line" />}
        <path d={pathFor(team.index)} className="data-lab-main-line" />
        <line x1={x(selectedYear)} x2={x(selectedYear)} y1={top} y2={bottom} className="data-lab-cursor" />
        {comparison && <circle cx={x(selectedYear)} cy={y(comparisonValue)} r="5" className="data-lab-comparison-point" />}
        {team.index.map((value,i) => <g key={seasons[i]}>
          <circle cx={x(i)} cy={y(value)} r={selectedYear===i ? 7 : 4} className="data-lab-point" />
          <circle cx={x(i)} cy={y(value)} r="18" className="data-lab-hit" tabIndex={0} role="button"
            aria-label={`${seasons[i]}: ${value.toFixed(1)} injury burden index`}
            aria-pressed={selectedYear===i}
            onMouseEnter={()=>setSelectedYear(i)} onFocus={()=>setSelectedYear(i)} onClick={()=>setSelectedYear(i)}
            onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();setSelectedYear(i)} }} />
          <text x={x(i)} y={bottom+26} textAnchor="middle" className={`data-lab-axis-label ${selectedYear===i?'data-lab-year-active':''}`}>{seasons[i]}</text>
        </g>)}
      </svg>
    </div>
    <div className="data-lab-readout">
      <div className="data-lab-season-control">
        <label htmlFor={`${id}-season`}><span>Explore a season</span><strong>{seasons[selectedYear]}</strong></label>
        <input id={`${id}-season`} type="range" min={0} max={seasons.length-1} step={1} value={selectedYear}
          aria-valuetext={`${seasons[selectedYear]}, ${team.name} index ${current.toFixed(1)}`}
          onChange={event=>setSelectedYear(Number(event.target.value))} />
        <div className="data-lab-range-labels"><span>2017</span><span>2025</span></div>
      </div>
      <div className="data-lab-selected-value" aria-live="polite" aria-atomic="true">
        <span>{team.code} / {seasons[selectedYear]}</span>
        <strong>{current.toFixed(1)}<small>index</small></strong>
        <p>{comparison ? `${comparison.code}: ${comparisonValue.toFixed(1)}` : `${Math.abs(current-100).toFixed(1)}% ${current >= 100 ? 'above' : 'below'} NFL average`}</p>
      </div>
    </div>
    <div className="data-lab-insight" aria-live="polite" aria-atomic="true"><p><strong>{team.name}</strong> averaged <strong>{note}</strong>.</p></div>
    <div className="data-lab-footnote"><p>Index = 100 × team adjusted games lost / same-season NFL mean. This measures availability burden, not medical injury incidence. Descriptive comparisons do not establish causes.</p><a href="/sports/49ers-injuries">Full analysis &amp; sources <span aria-hidden="true">↗</span></a></div>
  </div>;
}
