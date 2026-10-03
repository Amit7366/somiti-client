"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, clearToken, getToken, setToken } from "@/lib/api";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (payload: Record<string, string>) => Promise<void>;
  registerSomiti: (payload: Record<string, string | boolean>) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const existing = getToken();
    if (existing) setToken(existing);
    try {
      const res = await api<User>("/auth/me");
      setUser(res.data);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (identifier: string, password: string) => {
    const res = await api<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    });
    setToken(res.data.token);
    setUser(res.data.user);
  }, []);

  const register = useCallback(async (payload: Record<string, string>) => {
    const res = await api<{ user: User; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setToken(res.data.token);
    setUser(res.data.user);
  }, []);

  const registerSomiti = useCallback(async (payload: Record<string, string | boolean>) => {
    const res = await api<{ user: User; token: string }>("/auth/register-somiti", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setToken(res.data.token);
    setUser(res.data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } finally {
      clearToken();
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, registerSomiti, logout, refresh }),
    [user, loading, login, register, registerSomiti, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
