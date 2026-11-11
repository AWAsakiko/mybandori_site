"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Role = "visitor" | "admin" | "owner";

type AuthContextValue = {
  role: Role;
  isAdmin: boolean;
  isOwner: boolean;
  ready: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [role, setRole] = useState<Role>("visitor");
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const data = (await res.json().catch(() => ({}))) as { role?: Role };
      if (res.ok && (data.role === "admin" || data.role === "owner")) {
        setRole(data.role);
      } else {
        setRole("visitor");
      }
    } catch {
      setRole("visitor");
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.removeItem("bandori_forum_auth");
    } catch {
      /* ignore */
    }
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    setRole("visitor");
    router.refresh();
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      role,
      isAdmin: role === "admin" || role === "owner",
      isOwner: role === "owner",
      ready,
      refresh,
      logout,
    }),
    [role, ready, refresh, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth 必须在 AuthProvider 内使用");
  }
  return ctx;
}
