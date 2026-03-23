import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AuthService } from '../services/AuthAPI';
import type { User } from '../services/AuthAPI';
import { revokeToken } from '../utils/tokenRevocation';

const USER_STORAGE_KEY = 'user';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function readUserFromStorage(): User | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(readUserFromStorage);

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
    if (u) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_STORAGE_KEY);
  }, []);

  const logout = useCallback(() => {
    const currentToken = localStorage.getItem('authToken') ?? '';
    const tokenExpiresAt = localStorage.getItem('tokenExpiresAt');

    if (currentToken) {
      revokeToken(currentToken, tokenExpiresAt);
    }

    // Best-effort server logout; always continue local cleanup.
    AuthService.logout().catch(() => {});

    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiresAt');
    setUserState(null);
    window.dispatchEvent(new Event('auth:logout'));
  }, []);

  // Đồng bộ khi tab khác login/logout (storage event)
  useEffect(() => {
    const handler = () => setUserState(readUserFromStorage());
    window.addEventListener('storage', handler);
    window.addEventListener('auth:logout', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('auth:logout', handler);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
