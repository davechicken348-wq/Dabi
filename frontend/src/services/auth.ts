export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');
const SESSION_KEY = 'dabi-owner-session';

// Kept visible only for the existing development login hint. Production access is backend-controlled.
export const ADMIN_CREDENTIALS = {
  email: 'admin@dabi.com',
  password: 'admin123',
};

export function getSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(`${SESSION_KEY}-token`);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(`${SESSION_KEY}-token`);
}

export async function loginAdmin(email: string, password: string): Promise<AuthUser | null> {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) return null;
    const data = await response.json() as LoginResponse;
    localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
    localStorage.setItem(`${SESSION_KEY}-token`, data.token);
    return data.user;
  } catch {
    return null;
  }
}
