import type { Metadata } from 'next';
import HomeFeed from './feed/HomeFeed';
import { LifePhotoProvider } from './feed/LifePhoto';
import { getLifePhotos } from './feed/photo-slots';

const title = 'After Hours with Andrew Oh | AI and data science';
const description = 'Explore Injury Report, Tend, and SPARK with Andrew Oh, Director of Data Science at Xero and previously at Pinterest.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: 'https://www.canyoubuildit.com' },
  icons: { icon: { url: '/feed/studio/after-hours-icon.svg', type: 'image/svg+xml', sizes: 'any' } },
  openGraph: {
    title,
    description,
    url: 'https://www.canyoubuildit.com',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

export default function Home() {
  return <LifePhotoProvider photos={getLifePhotos()}><HomeFeed /></LifePhotoProvider>;
}
