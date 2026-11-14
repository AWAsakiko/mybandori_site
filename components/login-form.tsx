"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";

type Mode = "owner" | "admin";

export function LoginForm() {
  const { adminRole, ready, isOwner, refresh, logout } = useAuth();
  const [mode, setMode] = useState<Mode>("owner");
  const [secret, setSecret] = useState("");
  const [contact, setContact] = useState("");
  const [nickname, setNickname] = useState("");
  const [needBinding, setNeedBinding] = useState(false);
  const [remember, setRemember] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (ready && adminRole !== "guest") {
    return (
      <div className="space-y-4 bg-white/60 p-6 backdrop-blur">
        <h1 className="text-2xl font-bold">已登录</h1>
        <p className="text-sm text-slate-600">
          当前身份：
          <span className="font-medium text-slate-800">
            {adminRole === "owner" ? "站主" : "管理员"}
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

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    setSecret("");
    setContact("");
    setNickname("");
    setNeedBinding(false);
    setError(null);
  };

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
        body: JSON.stringify({
          secret: value,
          contact: contact.trim(),
          nickname: nickname.trim(),
          remember,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        needBinding?: boolean;
        needContact?: boolean;
      };
      if (!res.ok) {
        if (data.needBinding) {
          setNeedBinding(true);
          setError(data.error ?? "首次登录需要先绑定手机号/邮箱和昵称");
          return;
        }
        if (data.needContact) {
          setError(data.error ?? "请输入该密钥已绑定的手机号/邮箱");
          return;
        }
        throw new Error(data.error || "登录失败");
      }
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

  const showBindingFields = mode === "admin" || needBinding;

  return (
    <div className="space-y-5 bg-white/60 p-6 backdrop-blur">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">管理员 / 站主登录</h1>
        <p className="text-sm leading-relaxed text-slate-600">
          站主使用站主密码；管理员使用站主发放的密钥。两者与普通用户登录完全独立。
        </p>
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 text-sm">
        <button
          type="button"
          onClick={() => switchMode("owner")}
          className={`rounded-lg px-3 py-1.5 transition ${
            mode === "owner"
              ? "bg-white font-medium text-slate-900 shadow-sm"
              : "text-slate-500"
          }`}
        >
          站主登录
        </button>
        <button
          type="button"
          onClick={() => switchMode("admin")}
          className={`rounded-lg px-3 py-1.5 transition ${
            mode === "admin"
              ? "bg-white font-medium text-slate-900 shadow-sm"
              : "text-slate-500"
          }`}
        >
          管理员登录
        </button>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label
            htmlFor="secret"
            className="text-xs font-medium text-slate-500"
          >
            {mode === "owner" ? "站主密码" : "管理员密钥"}
          </label>
          <input
            id="secret"
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            autoComplete="current-password"
            placeholder={mode === "owner" ? "请输入站主密码" : "请输入管理员密钥"}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white/80 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        {showBindingFields ? (
          <>
            <div>
              <label
                htmlFor="contact"
                className="text-xs font-medium text-slate-500"
              >
                手机号 / 邮箱
                {mode === "admin"
                  ? "（首次绑定；已绑定密钥需与绑定号一致）"
                  : "（首次登录必须绑定）"}
              </label>
              <input
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="请输入手机号或邮箱"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white/80 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label
                htmlFor="nickname"
                className="text-xs font-medium text-slate-500"
              >
                昵称（绑定后不可修改）
              </label>
              <input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={24}
                placeholder={
                  mode === "admin"
                    ? "首次绑定必填；已绑定可留空"
                    : "首次登录必须填写"
                }
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white/80 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </>
        ) : (
          <p className="text-[11px] leading-relaxed text-slate-400">
            如果是站主首次登录，密码验证通过后会要求补充手机号/邮箱和昵称。
          </p>
        )}

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
          {busy ? "验证中…" : needBinding ? "绑定并登录" : "登录"}
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
