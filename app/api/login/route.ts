import { NextResponse } from "next/server";
import { createSessionToken, getCookieName, getPassword } from "../../../lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password : "";

  if (password !== getPassword()) {
    return NextResponse.json({ ok: false, error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(getCookieName(), createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
  return response;
}
