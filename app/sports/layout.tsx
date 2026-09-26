import type { ReactNode } from 'react';
import './sports.css';
export default function SportsLayout({children}:{children:ReactNode}) {
  return <div className="sports-site"><a className="sports-skip" href="#sports-content">Skip to the article</a><header className="sports-nav sports-shell"><a className="sports-brand" href="/sports">Andrew’s Sports Analysis Deep Dives<span>Questions worth a closer look</span></a><a className="sports-nav-home" href="/">canyoubuildit.com ↗</a></header>{children}<footer className="sports-footer sports-shell"><span>Andrew’s Sports Analysis Deep Dives · Independent analysis</span><a href="/sports">All deep dives ↗</a><a href="/">Back to canyoubuildit.com ↗</a></footer></div>;
}
