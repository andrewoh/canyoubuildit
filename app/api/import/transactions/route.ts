import { NextResponse } from "next/server";
import { importTransactions, readImportedTransactions } from "../../../../lib/imported-transactions";
import { mergeTransactions, summarizeTransactions, transactions } from "../../../../lib/trip-data";

function isAuthorized(request: Request) {
  const secret = process.env.IMPORT_SECRET;
  const header = request.headers.get("authorization") || "";
  return Boolean(secret) && header === `Bearer ${secret}`;
}

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return unauthorized();

  const imported = await readImportedTransactions();
  const merged = mergeTransactions(transactions, imported);
  return NextResponse.json({
    ok: true,
    imported,
    merged,
    summary: summarizeTransactions(merged)
  }, {
    headers: {
      "Cache-Control": "private, no-store"
    }
  });
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) return unauthorized();

  try {
    const payload = await request.json();
    const result = await importTransactions(payload);
    const merged = mergeTransactions(transactions, result.imported);

    return NextResponse.json({
      ok: true,
      accepted: result.imported.length,
      mode: result.mode,
      storage: result.storage,
      summary: summarizeTransactions(merged),
      transactions: merged
    }, {
      headers: {
        "Cache-Control": "private, no-store"
      }
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : "Import failed"
    }, { status: 400 });
  }
}
