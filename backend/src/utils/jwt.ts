import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../config";

interface TokenPayload {
  sub: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

const EXPIRY_SECONDS = 60 * 60 * 8; // 8 hours

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function b64urlDecode(input: string): Buffer {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(padded, "base64");
}

export function signToken(payload: {
  sub: string;
  email: string;
  name: string;
}): string {
  const now = Math.floor(Date.now() / 1000);
  const body: TokenPayload = { ...payload, iat: now, exp: now + EXPIRY_SECONDS };
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const claims = b64url(JSON.stringify(body));
  const data = `${header}.${claims}`;
  const signature = b64url(
    createHmac("sha256", env.JWT_SECRET).update(data).digest(),
  );
  return `${data}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, claims, signature] = parts;
  const expected = b64url(
    createHmac("sha256", env.JWT_SECRET)
      .update(`${header}.${claims}`)
      .digest(),
  );
  const sigBuf = b64urlDecode(signature);
  const expBuf = b64urlDecode(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const body = JSON.parse(b64urlDecode(claims).toString()) as TokenPayload;
    if (body.exp * 1000 < Date.now()) return null;
    return body;
  } catch {
    return null;
  }
}
