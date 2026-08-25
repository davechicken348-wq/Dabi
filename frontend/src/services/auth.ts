import { load, save, remove } from "./storage";
import { loginAdmin } from "./api";
import type { AdminUser } from "../admin/types";

const TOKEN_KEY = "token";
const SESSION_KEY = "session";

export const ADMIN_CREDENTIALS = {
  email: "admin@dabi.com",
  password: "dabi1234",
};

export function getToken(): string | null {
  return load<string | null>(TOKEN_KEY, null);
}

export async function login(
  email: string,
  password: string,
): Promise<AdminUser | null> {
  try {
    const result = await loginAdmin(email, password);
    save(TOKEN_KEY, result.token);
    save(SESSION_KEY, result.user);
    return result.user;
  } catch {
    return null;
  }
}

export function getSession(): AdminUser | null {
  return load<AdminUser | null>(SESSION_KEY, null);
}

export function logout(): void {
  remove(TOKEN_KEY);
  remove(SESSION_KEY);
}

type Listener = () => void;
const unauthorizedListeners = new Set<Listener>();

/** Subscribe to global 401s (e.g. expired token). Returns an unsubscribe fn. */
export function onUnauthorized(listener: Listener): () => void {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

/** Called by the API layer when an authenticated request is rejected. */
export function notifyUnauthorized(): void {
  unauthorizedListeners.forEach((listener) => listener());
}
