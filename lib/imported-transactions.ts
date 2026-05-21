import "server-only";

import { get, put } from "@vercel/blob";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  categories,
  mergeTransactions,
  normalizeExpense,
  type ExpenseStatus,
  type NormalizedExpense
} from "./trip-data";

type ImportPayload = NormalizedExpense[] | { transactions?: unknown; mode?: "replace" | "merge" };

const BLOB_PATH = process.env.TRANSACTION_IMPORT_BLOB_PATH || "seoul/imported-transactions.json";
const LOCAL_PATH = path.join(process.cwd(), "data", "imported-transactions.json");

const statusValues: ExpenseStatus[] = ["posted", "pending", "receipt_detected", "matched", "refunded"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function blobEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function coerceTransactions(payload: ImportPayload): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (isRecord(payload) && Array.isArray(payload.transactions)) return payload.transactions;
  throw new Error("Expected a JSON array or an object with a transactions array.");
}

export function validateImportedTransactions(payload: unknown): NormalizedExpense[] {
  const rows = coerceTransactions(payload as ImportPayload);
  return rows.map((row, index) => {
    if (!isRecord(row)) throw new Error(`Transaction at index ${index} must be an object.`);
    if (typeof row.id !== "string" || row.id.trim().length === 0) throw new Error(`Transaction at index ${index} is missing id.`);
    if (typeof row.date !== "string" || row.date.trim().length === 0) throw new Error(`Transaction ${row.id} is missing date.`);
    if (typeof row.merchant !== "string" || row.merchant.trim().length === 0) throw new Error(`Transaction ${row.id} is missing merchant.`);
    if (row.amount !== null && row.amount !== undefined && typeof row.amount !== "number") throw new Error(`Transaction ${row.id} amount must be a number or null.`);
    if (row.category !== undefined && !(categories as readonly string[]).includes(String(row.category))) throw new Error(`Transaction ${row.id} has an unsupported category.`);
    if (row.status !== undefined && !statusValues.includes(row.status as ExpenseStatus)) throw new Error(`Transaction ${row.id} has an unsupported status.`);

    return normalizeExpense({
      id: row.id,
      source: typeof row.source === "string" ? row.source : "chatgpt-finance-export",
      date: row.date,
      merchant: row.merchant,
      title: typeof row.title === "string" ? row.title : row.merchant,
      amount: typeof row.amount === "number" ? row.amount : null,
      currency: typeof row.currency === "string" ? row.currency : "USD",
      category: row.category as NormalizedExpense["category"] | undefined,
      confidence:
        row.confidence === "high" || row.confidence === "review" || row.confidence === "pending"
          ? row.confidence
          : "review",
      status: statusValues.includes(row.status as ExpenseStatus) ? (row.status as ExpenseStatus) : "pending",
      notes: typeof row.notes === "string" ? row.notes : "",
      rawSource: isRecord(row.rawSource) ? row.rawSource : {}
    });
  });
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

export async function readImportedTransactions(): Promise<NormalizedExpense[]> {
  if (blobEnabled()) {
    const blob = await get(BLOB_PATH, { access: "private", useCache: false }).catch(() => null);
    if (!blob || blob.statusCode !== 200 || !blob.stream) return [];
    return validateImportedTransactions(JSON.parse(await streamToText(blob.stream)));
  }

  const raw = await readFile(LOCAL_PATH, "utf8").catch(() => "[]");
  return validateImportedTransactions(JSON.parse(raw));
}

export async function writeImportedTransactions(rows: NormalizedExpense[]) {
  const body = JSON.stringify(rows, null, 2);

  if (blobEnabled()) {
    await put(BLOB_PATH, body, {
      access: "private",
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 60
    });
    return { storage: "vercel-blob", path: BLOB_PATH };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("BLOB_READ_WRITE_TOKEN is required for durable production imports.");
  }

  await mkdir(path.dirname(LOCAL_PATH), { recursive: true });
  await writeFile(LOCAL_PATH, `${body}\n`);
  return { storage: "local-file", path: LOCAL_PATH };
}

export async function importTransactions(payload: unknown) {
  const incoming = validateImportedTransactions(payload);
  const mode = isRecord(payload) && payload.mode === "merge" ? "merge" : "replace";
  const current = mode === "merge" ? await readImportedTransactions() : [];
  const imported = mode === "merge" ? mergeTransactions(current, incoming) : incoming;
  const storage = await writeImportedTransactions(imported);

  return {
    imported,
    mode,
    storage
  };
}
