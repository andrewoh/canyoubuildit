import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const alt = 'After Hours with Andrew Oh, Director of Data Science at Xero. A red television shows an Eevee pack from his PokéRead reading game.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/jpeg';
export const dynamic = 'force-static';

export default async function Image() {
  const cover = await readFile(join(process.cwd(), 'assets', 'metadata', 'after-hours.jpg'));
  return new Response(new Uint8Array(cover), { headers: { 'Content-Type': contentType } });
}
