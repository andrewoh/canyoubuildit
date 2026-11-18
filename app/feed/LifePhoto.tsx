'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { LifePhotos, LifePhotoSlot } from './photo-slots';
import './life-photo.css';

const photoContext = createContext<LifePhotos>({ portrait: null, career: null });

export function LifePhotoProvider({ photos, children }: { photos: LifePhotos; children: ReactNode }) {
  return <photoContext.Provider value={photos}>{children}</photoContext.Provider>;
}

const labels = {
  portrait: { name: 'Portrait', caption: 'Andrew Oh', detail: 'Director of Data Science at Xero' },
  career: { name: 'Work photo', caption: 'Pinterest → Xero', detail: 'My work history' },
} as const;

export default function LifePhoto({ slot }: { slot: LifePhotoSlot }) {
  const source = useContext(photoContext)[slot];
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const photo = source && source !== failedSource ? source : null;
  const { name, caption, detail } = labels[slot];
  const alt = photo ? name + ' · ' + caption : 'Reserved ' + name.toLowerCase() + ' space for Andrew Oh';
  return (
    <figure className={'life-photo life-photo--' + slot} role="img" aria-label={alt + '. ' + detail}>
      <div className="life-well" aria-hidden="true">
        {photo ? <img src={photo} alt="" decoding="async" loading="lazy" onError={() => setFailedSource(photo)} /> :
          <div className="life-test-card"><span>{name}</span></div>}
      </div>
      <figcaption className="life-lower-third" aria-hidden="true">
        <strong>{caption}</strong><small>{detail}</small>
      </figcaption>
    </figure>
  );
}
