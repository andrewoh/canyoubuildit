import type { Metadata } from 'next';
import HomeFeed from './feed/HomeFeed';

export const metadata: Metadata = {
  title: 'Andrew Oh’s home feed | Can You Build It?',
  description: 'Explore Andrew Oh’s life and work in pins. Director of Data Science at Xero, previously at Pinterest, and builder of personal AI projects.',
  alternates: { canonical: 'https://www.canyoubuildit.com' },
  openGraph: {
    title: 'Andrew Oh’s home feed',
    description: 'Biography, personal AI builds and data science projects, one pin at a time.',
    url: 'https://www.canyoubuildit.com',
    type: 'website',
  },
};

export default function Home() {
  return <HomeFeed />;
}
