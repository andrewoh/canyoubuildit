import { NextResponse } from "next/server";
import { refreshTripExpenses } from "../../../lib/trip-data";

export async function GET() {
  return NextResponse.json(await refreshTripExpenses(), {
    headers: {
      "Cache-Control": "private, no-store"
    }
  });
}
