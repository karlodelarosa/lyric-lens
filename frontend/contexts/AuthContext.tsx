"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getSession,
  logout as logoutApi,
  type AuthUserDto,
} from "@frontend/lib/api/auth";

type AuthContextValue = {
  user: AuthUserDto | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { user: sessionUser } = await getSession();
    setUser(sessionUser);
  }, []);

  useEffect(() => {
    refresh().finally(() => setIsLoading(false));
  }, [refresh]);

  const logout = useCallback(async () => {
    await logoutApi();
    setUser(null);
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
