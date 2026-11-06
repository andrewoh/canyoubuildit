import 'server-only';

import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';

export type LifePhotoSlot = 'portrait' | 'career';
export type LifePhotos = Record<LifePhotoSlot, string | null>;

const directory = path.join(process.cwd(), 'public', 'feed', 'photos');
const extensions = ['webp', 'jpg', 'jpeg', 'png'];

function findPhoto(slot: LifePhotoSlot): string | null {
  for (const extension of extensions) {
    const name = slot + '.' + extension;
    const file = path.join(directory, name);
    if (!statSync(file, { throwIfNoEntry: false })?.isFile()) continue;

    // Updating a photo under the same name gets it a fresh URL.
    const version = createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 12);
    return '/feed/photos/' + name + '?v=' + version;
  }
  return null;
}

export function getLifePhotos(): LifePhotos {
  return { portrait: findPhoto('portrait'), career: findPhoto('career') };
}
