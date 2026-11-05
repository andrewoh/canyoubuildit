import type { Metadata } from 'next';
import { App } from '../showcase';
export const metadata: Metadata = {title:'Build archive — Andrew Oh'};
export default function Archive(){return <><div style={{padding:'14px 5%',background:'#d7fd78',color:'#17200e',fontFamily:'Arial, sans-serif',fontSize:12,display:'flex',justifyContent:'space-between',gap:20}}><a href="/" style={{color:'inherit'}}>← Andrew Oh · Interactive portfolio</a><span>Archive snapshot · September 2026</span></div><App/></>}
