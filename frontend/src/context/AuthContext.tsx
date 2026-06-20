import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '../api';
import type { User } from '../api/types';
import { ApiClientError } from '../api/client';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  hasAccount: boolean | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccount, setHasAccount] = useState<boolean | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [me, status] = await Promise.all([
        authApi.me().catch((error) => {
          if (error instanceof ApiClientError && error.status === 401) {
            return null;
          }
          throw error;
        }),
        authApi.status(),
      ]);

      setHasAccount(status.hasUser);
      setUser(me?.user ?? null);
    } catch {
      setUser(null);
      setHasAccount(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const login = useCallback(async (username: string, password: string) => {
    const response = await authApi.login(username, password);
    setUser(response.user);
    setHasAccount(true);
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    const response = await authApi.register(username, password);
    setUser(response.user);
    setHasAccount(true);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, hasAccount, login, register, logout, refresh }),
    [user, loading, hasAccount, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans AuthProvider');
  }
  return context;
}
