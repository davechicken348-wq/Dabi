import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getSession,
  login as authLogin,
  logout as authLogout,
  onUnauthorized,
} from "../services/auth";
import type { AdminUser } from "../admin/types";

interface AuthState {
  user: AdminUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() => getSession());

  useEffect(() => {
    setUser(getSession());
  }, []);

  // React to global 401s (e.g. expired token) by clearing the session; the
  // RequireAuth guard then bounces the user back to the login page.
  useEffect(() => {
    return onUnauthorized(() => {
      authLogout();
      setUser(null);
    });
  }, []);

  async function login(email: string, password: string): Promise<boolean> {
    const result = await authLogin(email, password);
    if (result) {
      setUser(result);
      return true;
    }
    return false;
  }

  function logout(): void {
    authLogout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
