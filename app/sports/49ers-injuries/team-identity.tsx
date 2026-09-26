import logos from "./team-logos.json";

const teamNames: Record<string, string> = {
  "ARI": "Arizona Cardinals",
  "ATL": "Atlanta Falcons",
  "BAL": "Baltimore Ravens",
  "BUF": "Buffalo Bills",
  "CAR": "Carolina Panthers",
  "CHI": "Chicago Bears",
  "CIN": "Cincinnati Bengals",
  "CLE": "Cleveland Browns",
  "DAL": "Dallas Cowboys",
  "DEN": "Denver Broncos",
  "DET": "Detroit Lions",
  "GB": "Green Bay Packers",
  "HOU": "Houston Texans",
  "IND": "Indianapolis Colts",
  "JAX": "Jacksonville Jaguars",
  "KC": "Kansas City Chiefs",
  "LAC": "Los Angeles Chargers",
  "LAR": "Los Angeles Rams",
  "LV": "Las Vegas Raiders",
  "MIA": "Miami Dolphins",
  "MIN": "Minnesota Vikings",
  "NE": "New England Patriots",
  "NO": "New Orleans Saints",
  "NYG": "New York Giants",
  "NYJ": "New York Jets",
  "PHI": "Philadelphia Eagles",
  "PIT": "Pittsburgh Steelers",
  "SEA": "Seattle Seahawks",
  "SF": "San Francisco 49ers",
  "TB": "Tampa Bay Buccaneers",
  "TEN": "Tennessee Titans",
  "WAS": "Washington Commanders"
};
const logoSources: Record<string, string> = logos;
const aliases: Record<string, string> = { LA: "LAR", STL: "LAR", SD: "LAC", OAK: "LV", WSH: "WAS" };
const canonical = (team: string) => aliases[team] ?? team;

/** Decorative identity mark: always pair with a visible team name or abbreviation. */
export function TeamLogo({ team, size = 22 }: { team: string; size?: number }) {
  const src = logoSources[canonical(team)];
  if (!src) return null;
  // An ordinary image preserves the embedded original asset for self-contained chart exports.
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="sports-team-logo" src={src} width={size} height={size} alt="" aria-hidden="true" style={{ width: size, height: size, objectFit: "contain", flexShrink: 0 }} />;
}

export function TeamBadge({ team, label, compact = false }: { team: string; label?: string; compact?: boolean }) {
  const code = canonical(team);
  return <span className={`sports-team-badge${compact ? " sports-team-badge--compact" : ""}`}><TeamLogo team={code} /><span>{label ?? (compact ? code : teamNames[code] ?? code)}</span></span>;
}

/** Data-URI href keeps PNG/SVG downloads independent of remote image permissions. */
export function SvgTeamLogo({ team, x, y, size = 22 }: { team: string; x: number; y: number; size?: number }) {
  const href = logoSources[canonical(team)];
  if (!href) return null;
  return <image href={href} x={x} y={y} width={size} height={size} preserveAspectRatio="xMidYMid meet" aria-hidden="true" />;
}
