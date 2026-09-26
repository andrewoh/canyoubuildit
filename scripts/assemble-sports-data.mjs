import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const source = new URL('../assets/sports-repro/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('manifest.json', source), 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const parts = [];
for (const part of manifest.parts) {
  const bytes = await readFile(new URL(part.name, source));
  if (bytes.length !== part.bytes || hash(bytes) !== part.sha256) throw new Error(`Sports data checksum failed: ${part.name}`);
  parts.push(bytes);
}
const archive = Buffer.concat(parts);
if (archive.length !== manifest.bytes || hash(archive) !== manifest.sha256) throw new Error('Sports archive checksum failed');
const destination = new URL('../public/sports/49ers/', import.meta.url);
await mkdir(destination, { recursive: true });
await writeFile(new URL('reproducibility.zip', destination), archive);
console.log('Verified and assembled the sports analysis download.');
