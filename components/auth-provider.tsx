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

export type AdminRole = "guest" | "admin" | "owner";

export type UserProfile = {
  id: string;
  nickname: string;
};

type AuthContextValue = {
  adminRole: AdminRole;
  user: UserProfile | null;
  isAdmin: boolean;
  isOwner: boolean;
  isUser: boolean;
  ready: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [adminRole, setAdminRole] = useState<AdminRole>("guest");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const data = (await res.json().catch(() => ({}))) as {
        admin?: "admin" | "owner" | null;
        user?: UserProfile | null;
      };
      setAdminRole(
        data.admin === "admin" || data.admin === "owner" ? data.admin : "guest",
      );
      setUser(
        data.user && typeof data.user.id === "string"
          ? { id: data.user.id, nickname: String(data.user.nickname) }
          : null,
      );
    } catch {
      setAdminRole("guest");
      setUser(null);
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
    setAdminRole("guest");
    setUser(null);
    router.refresh();
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      adminRole,
      user,
      isAdmin: adminRole === "admin" || adminRole === "owner",
      isOwner: adminRole === "owner",
      isUser: Boolean(user),
      ready,
      refresh,
      logout,
    }),
    [adminRole, user, ready, refresh, logout],
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
