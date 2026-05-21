import { NextResponse } from "next/server";
import { refreshTripExpenses } from "../../../../lib/trip-data.server";

export async function POST() {
  return NextResponse.json(await refreshTripExpenses(), {
    headers: {
      "Cache-Control": "private, no-store"
    }
  });
}
