import type { Metadata } from 'next';
import Portfolio from './portfolio/Portfolio';
export const metadata: Metadata = {
 title:'Andrew Oh — AI & Data Science Leader | Can You Build It?',
 description:'Director of Data Science at Xero. Explore Andrew Oh’s personal AI products, interactive data science, and the decisions behind the builds.',
 alternates:{canonical:'https://www.canyoubuildit.com'},
 openGraph:{title:'Andrew Oh — Can You Build It?',description:'AI systems. Data science. Working proof. An interactive portfolio by Andrew Oh.',url:'https://www.canyoubuildit.com',type:'website'},
};
export default function Home(){return <Portfolio/>}
