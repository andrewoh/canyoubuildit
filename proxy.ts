import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "seoul_trip_session";

async function hmac(message: string, secret: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function isValid(token: string | undefined) {
  if (!token) return false;
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return false;
  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);
  if (!payload.startsWith("authenticated:")) return false;
  const issuedAt = Number(payload.split(":")[1]);
  if (!Number.isFinite(issuedAt)) return false;
  if (Date.now() - issuedAt > 30 * 24 * 60 * 60 * 1000) return false;
  const expected = await hmac(payload, process.env.SESSION_SECRET || "local-development-secret-change-me");
  return signature === expected;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const publicPaths = ["/login", "/api/login", "/api/import/transactions", "/favicon.ico"];
  const isPublic = publicPaths.some((path) => pathname === path || pathname.startsWith("/_next"));
  if (isPublic) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!(await isValid(token))) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
