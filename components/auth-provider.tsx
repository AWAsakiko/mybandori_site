"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Role = "visitor" | "admin" | "owner";

type AuthState = { role: Role; token: string | null };

type AuthContextValue = {
  role: Role;
  token: string | null;
  isAdmin: boolean;
  isOwner: boolean;
  ready: boolean;
  openActivation: (mode?: "admin" | "owner") => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "bandori_forum_auth";

function decodeExp(token: string): number | null {
  try {
    const raw = token.split(".")[0] ?? "";
    const part = raw.replace(/-/g, "+").replace(/_/g, "/");
    const padded = part + "=".repeat((4 - (part.length % 4)) % 4);
    const payload = JSON.parse(atob(padded)) as { exp?: unknown };
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

function loadStored(): AuthState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      (parsed?.role === "admin" || parsed?.role === "owner") &&
      typeof parsed.token === "string" &&
      parsed.token
    ) {
      const exp = decodeExp(parsed.token);
      if (exp && exp * 1000 < Date.now()) {
        window.localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return { role: parsed.role, token: parsed.token };
    }
    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ role: "visitor", token: null });
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"admin" | "owner">("admin");
  const [secret, setSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadStored();
    if (stored) setAuth(stored);
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setAuth(loadStored() ?? { role: "visitor", token: null });
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const openActivation = useCallback((m: "admin" | "owner" = "admin") => {
    setMode(m);
    setSecret("");
    setError(null);
    setOpen(true);
  }, []);

  const logout = useCallback(() => {
    setAuth({ role: "visitor", token: null });
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const login = useCallback(async () => {
    const value = secret.trim();
    if (!value) {
      setError(mode === "admin" ? "请输入管理员密钥" : "请输入站主密码");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        mode === "admin" ? "/api/auth/admin" : "/api/auth/owner",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            mode === "admin" ? { key: value } : { password: value },
          ),
        },
      );
      const data = (await res.json().catch(() => ({}))) as {
        token?: string;
        error?: string;
      };
      if (!res.ok || !data.token) {
        throw new Error(data.error || "验证失败");
      }
      const next: AuthState = { role: mode, token: data.token };
      setAuth(next);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setOpen(false);
      setSecret("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "验证失败");
    } finally {
      setBusy(false);
    }
  }, [mode, secret]);

  const value = useMemo<AuthContextValue>(
    () => ({
      role: auth.role,
      token: auth.token,
      isAdmin: auth.role === "admin" || auth.role === "owner",
      isOwner: auth.role === "owner",
      ready,
      openActivation,
      logout,
    }),
    [auth, ready, openActivation, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold">身份验证</h2>
            <p className="mt-1 text-xs text-slate-500">
              该入口仅限站主与管理员使用。
            </p>

            <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 text-sm">
              <button
                type="button"
                onClick={() => {
                  setMode("admin");
                  setError(null);
                }}
                className={`rounded-lg px-3 py-1.5 transition ${
                  mode === "admin"
                    ? "bg-white font-medium text-slate-900 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                管理员激活
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("owner");
                  setError(null);
                }}
                className={`rounded-lg px-3 py-1.5 transition ${
                  mode === "owner"
                    ? "bg-white font-medium text-slate-900 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                站主登录
              </button>
            </div>

            <label className="mt-4 block text-xs font-medium text-slate-500">
              {mode === "admin" ? "管理员密钥" : "站主密码"}
            </label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void login();
              }}
              placeholder={mode === "admin" ? "由站主发放" : "在环境变量 OWNER_PASSWORD 中设置"}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              autoFocus
            />

            {error ? (
              <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full px-4 py-2 text-sm text-slate-500 transition hover:bg-slate-100"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => void login()}
                disabled={busy}
                className="rounded-full bg-rose-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-600 disabled:opacity-50"
              >
                {busy ? "验证中…" : "验证"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth 必须在 AuthProvider 内使用");
  }
  return ctx;
}
