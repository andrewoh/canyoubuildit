import { TeamBadge } from './team-identity';

const number = (value: number) => Math.abs(value).toFixed(1);
export function BurdenComparison({value,baseline=100,reference='NFL average',team,period}:{value:number;baseline?:number;reference?:string;team?:string;period?:string|number}) {
  const difference=value-baseline;
  const equal=Math.abs(difference)<0.05;
  const direction=equal?'same':difference>0?'worse':'better';
  const relative=baseline>0?difference/baseline*100:null;
  return <div className={`sports-comparison sports-comparison-${direction}`} aria-live="polite" aria-atomic="true">
    {team&&<TeamBadge team={team}/>}
    <span className="sports-comparison-reading"><strong><span aria-hidden="true">{equal?'≈':difference>0?'↑':'↓'} </span>{equal?'About the same injury burden':`${number(relative??difference)}${relative===null?' index points':'%'} ${difference>0?'more':'less'} injury burden`}</strong><span>than {reference}{period!==undefined?` · ${period}`:''}. Injury index {value.toFixed(1)} vs. {baseline.toFixed(1)}.</span></span>
  </div>;
}
export function ShareComparison({difference,label,reference='the other 31 teams',team,period}:{difference:number;label:string;reference?:string;team:string;period?:string|number}) {
  const equal=Math.abs(difference)<0.05;
  return <div className="sports-comparison sports-comparison-neutral" aria-live="polite" aria-atomic="true"><TeamBadge team={team}/><span className="sports-comparison-reading"><strong><span aria-hidden="true">{equal?'≈':difference>0?'↑':'↓'} </span>{label}: {equal?'about the same share':`${number(difference)} percentage points ${difference>0?'higher':'lower'}`}</strong><span>Compared with {reference}{period!==undefined?` · ${period}`:''}. This describes the distribution, not the chance of injury.</span></span></div>;
}
export function DirectionKey({kind='burden'}:{kind?:'burden'|'share'|'timing'|'profile'}) {
  if(kind==='burden')return <div className="sports-direction-key"><span className="sports-direction-better">↓ Less injury burden / healthier</span><span className="sports-direction-worse">↑ More injury burden / worse availability</span></div>;
  return <p className="sports-direction-note">{kind==='share'?'Higher or lower describes the share of reports, not a better or worse injury rate.':kind==='timing'?'Higher or lower describes when announcements occur, not which team is healthier.':'Higher roster percentiles mean more of that attribute, not better health.'}</p>;
}
