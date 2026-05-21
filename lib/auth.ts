import crypto from "crypto";

const COOKIE_NAME = "seoul_trip_session";
const DEFAULT_SECRET = "local-development-secret-change-me";

export function getCookieName() {
  return COOKIE_NAME;
}

export function getPassword() {
  return process.env.DASHBOARD_PASSWORD || "babymoon";
}

export function getSecret() {
  return process.env.SESSION_SECRET || DEFAULT_SECRET;
}

export function createSessionToken() {
  const payload = `authenticated:${Date.now()}`;
  const signature = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function verifySessionToken(token?: string | null) {
  if (!token) return false;
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return false;
  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);
  if (!payload.startsWith("authenticated:")) return false;

  const issuedAt = Number(payload.split(":")[1]);
  if (!Number.isFinite(issuedAt)) return false;
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  if (Date.now() - issuedAt > thirtyDaysMs) return false;

  const expected = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
  if (signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
