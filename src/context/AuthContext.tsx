import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, AuthSession } from '../services/api';
import type { AuthUser } from '../services/api';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    role: 'rider' | 'driver';
    name: string;
    phone: string;
    vehicleType?: string;
    vehicleNumber?: string;
    licenceNumber?: string;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(authApi.getSession());
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const sess = await authApi.login(email, password);
      authApi.saveSession(sess);
      setSession(sess);
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: any) => {
    setLoading(true);
    try {
      const sess = await authApi.register(payload);
      authApi.saveSession(sess);
      setSession(sess);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authApi.clearSession();
    setSession(null);
  };

  const updateProfile = async (profile: Partial<AuthUser>) => {
    if (!session?.token) return;
    try {
      await authApi.saveSession(await (async () => {
        const res = await fetch(`${(import.meta.env.VITE_API_URL || 'http://localhost:4000')}/api/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.token}`,
          },
          body: JSON.stringify(profile),
        });
        const data = await res.json();
        return { token: session.token, user: data.user } as AuthSession;
      })());
      // Refresh session from server
      const refreshed = await authApi.login(session.user.email, '' ); // dummy password not needed because token is valid; use /me instead
    } catch (e) {
      console.error('Profile update failed', e);
    }
  };

  // On mount, try to refresh token via /me if we have a stored session but no user data.
  useEffect(() => {
    const stored = authApi.getSession();
    if (stored && (!session || session.token !== stored.token)) {
      (async () => {
        try {
          const me = await fetch(`${(import.meta.env.VITE_API_URL || 'http://localhost:4000')}/api/auth/me`, {
            headers: { Authorization: `Bearer ${stored.token}` },
          });
          if (me.ok) {
            const data = await me.json();
            const newSess = { token: stored.token, user: data.user } as AuthSession;
            authApi.saveSession(newSess);
            setSession(newSess);
          }
        } catch (e) {
          // fallback to cached session
          setSession(stored);
        }
      })();
    }
  }, []);

  const value: AuthContextType = {
    user: session?.user || null,
    token: session?.token || null,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
