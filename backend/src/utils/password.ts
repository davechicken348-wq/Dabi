import { scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Verifies a password against a stored `salt:hex` hash produced by the seed
 * script (see prisma/seed.ts). Kept in sync with that hashing scheme so the
 * seeded admin account is valid without re-hashing.
 */
export function verifyPassword(stored: string, password: string): boolean {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const keyBuffer = Buffer.from(key, "hex");
  const derived = scryptSync(password, salt, 64);
  if (keyBuffer.length !== derived.length) return false;
  return timingSafeEqual(keyBuffer, derived);
}
