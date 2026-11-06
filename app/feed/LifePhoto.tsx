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
      <div className="life-print" aria-hidden="true">
        <div className="life-well">
          {photo ? (
            <img
              src={photo} alt="" decoding="async"
              loading={slot === 'portrait' ? 'eager' : 'lazy'}
              onError={() => setFailedSource(photo)}
            />
          ) : (
            <div className="life-registration">
              <svg viewBox="0 0 96 68" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M2 18V2h16m60 0h16v16m0 32v16H78m-60 0H2V50M41 34h14m-7-7v14" />
              </svg>
              <span>{name}</span>
            </div>
          )}
        </div>
        <div className="life-caption">
          <strong>{caption}</strong>
          <small>{detail}</small>
        </div>
      </div>
    </figure>
  );
}
