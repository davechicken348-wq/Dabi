import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loginAdmin, getSession, clearSession, type AuthUser } from '../services/auth';

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getSession());

  useEffect(() => {
    setUser(getSession());
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    login: async (email, password) => {
      const nextUser = await loginAdmin(email, password);
      if (!nextUser) return false;
      setUser(nextUser);
      return true;
    },
    logout: () => {
      clearSession();
      setUser(null);
    },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
