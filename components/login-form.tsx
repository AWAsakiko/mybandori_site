"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";

export function LoginForm() {
  const { role, ready, isOwner, refresh, logout } = useAuth();
  const [secret, setSecret] = useState("");
  const [remember, setRemember] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (ready && role !== "visitor") {
    return (
      <div className="space-y-4 bg-white/60 p-6 backdrop-blur">
        <h1 className="text-2xl font-bold">已登录</h1>
        <p className="text-sm text-slate-600">
          当前身份：
          <span className="font-medium text-slate-800">
            {role === "owner" ? "站主" : "管理员"}
          </span>
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href="/"
            className="rounded-full bg-white/80 px-4 py-2 text-slate-700 transition hover:bg-white"
          >
            返回主站
          </Link>
          {isOwner ? (
            <Link
              href="/admin"
              className="rounded-full bg-sky-50 px-4 py-2 font-medium text-sky-700 transition hover:bg-sky-100"
            >
              管理后台
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-full px-4 py-2 text-slate-500 transition hover:bg-white/80"
          >
            退出登录
          </button>
        </div>
      </div>
    );
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = secret.trim();
    if (!value) {
      setError("请输入站主密码或管理员密钥");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: value, remember }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "登录失败");
      await refresh();
      const next = new URLSearchParams(window.location.search).get("next");
      const target = next && next.startsWith("/") ? next : "/";
      window.location.assign(target);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5 bg-white/60 p-6 backdrop-blur">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">登录</h1>
        <p className="text-sm leading-relaxed text-slate-600">
          站主请输入站主密码；管理员请输入站主发放的管理员密钥。
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label
            htmlFor="secret"
            className="text-xs font-medium text-slate-500"
          >
            站主密码 / 管理员密钥
          </label>
          <input
            id="secret"
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            autoComplete="current-password"
            placeholder="请输入密码或密钥"
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white/80 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          记住我（15 天内免登录）
        </label>

        {error ? (
          <p className="bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:opacity-50"
        >
          {busy ? "验证中…" : "登录"}
        </button>
      </form>

      <p className="text-[11px] leading-relaxed text-slate-400">
        登录凭证保存在 HttpOnly Cookie 中，浏览器脚本无法读取；未勾选「记住我」时，
        关闭浏览器即失效。
      </p>

      <Link href="/" className="text-xs text-slate-500 hover:underline">
        ← 返回主站
      </Link>
    </div>
  );
}
