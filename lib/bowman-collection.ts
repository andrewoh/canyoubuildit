import "server-only";

import { get, put } from "@vercel/blob";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getBowmanCard } from "./bowman-data";

export type BowmanCollectionItem = {
  cardId: string;
  addedAt: string;
};

const BLOB_PATH = process.env.BOWMAN_COLLECTION_BLOB_PATH || "bowman/collection.json";
const LOCAL_PATH = path.join(process.cwd(), "data", "bowman-collection.json");

function blobEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validateCollection(payload: unknown): BowmanCollectionItem[] {
  if (!Array.isArray(payload)) return [];

  return payload
    .filter((item): item is BowmanCollectionItem => {
      if (!isRecord(item)) return false;
      return typeof item.cardId === "string" && typeof item.addedAt === "string" && Boolean(getBowmanCard(item.cardId));
    })
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt));
}

async function streamToText(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.length;
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder().decode(bytes);
}

export async function readBowmanCollection() {
  if (blobEnabled()) {
    const blob = await get(BLOB_PATH, { access: "private", useCache: false }).catch(() => null);
    if (!blob || blob.statusCode !== 200 || !blob.stream) return [];
    return validateCollection(JSON.parse(await streamToText(blob.stream)));
  }

  const raw = await readFile(LOCAL_PATH, "utf8").catch(() => "[]");
  return validateCollection(JSON.parse(raw));
}

async function writeBowmanCollection(items: BowmanCollectionItem[]) {
  const body = JSON.stringify(validateCollection(items), null, 2);

  if (blobEnabled()) {
    await put(BLOB_PATH, body, {
      access: "private",
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 60
    });
    return;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("BLOB_READ_WRITE_TOKEN is required for durable production collection storage.");
  }

  await mkdir(path.dirname(LOCAL_PATH), { recursive: true });
  await writeFile(LOCAL_PATH, `${body}\n`);
}

export async function addBowmanCollectionCard(cardId: string) {
  const card = getBowmanCard(cardId);
  if (!card) throw new Error("Unknown Bowman card.");

  const current = await readBowmanCollection();
  if (current.some((item) => item.cardId === cardId)) return current;

  const next = [{ cardId, addedAt: new Date().toISOString() }, ...current];
  await writeBowmanCollection(next);
  return next;
}

export async function removeBowmanCollectionCard(cardId: string) {
  const current = await readBowmanCollection();
  const next = current.filter((item) => item.cardId !== cardId);
  await writeBowmanCollection(next);
  return next;
}
