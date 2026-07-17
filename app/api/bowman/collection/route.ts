import { NextResponse } from "next/server";
import {
  addBowmanCollectionCard,
  readBowmanCollection,
  removeBowmanCollectionCard
} from "../../../../lib/bowman-collection";
import { summarizeBowmanCards } from "../../../../lib/bowman-data";

function collectionResponse(collection: Awaited<ReturnType<typeof readBowmanCollection>>) {
  return NextResponse.json({
    collection,
    summary: summarizeBowmanCards(collection.map((item) => item.cardId))
  }, {
    headers: {
      "Cache-Control": "private, no-store"
    }
  });
}

async function readCardId(request: Request) {
  const body = await request.json().catch(() => ({}));
  return typeof body.cardId === "string" ? body.cardId : "";
}

export async function GET() {
  return collectionResponse(await readBowmanCollection());
}

export async function POST(request: Request) {
  try {
    return collectionResponse(await addBowmanCollectionCard(await readCardId(request)));
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : "Unable to save card."
    }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  return collectionResponse(await removeBowmanCollectionCard(await readCardId(request)));
}
