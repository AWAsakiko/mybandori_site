"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";

export function UserLoginForm() {
  const { user, ready, refresh, logout } = useAuth();
  const [contact, setContact] = useState("");
  const [nickname, setNickname] = useState("");
  const [needNickname, setNeedNickname] = useState(false);
  const [remember, setRemember] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (ready && user) {
    return (
      <div className="space-y-4 bg-white/60 p-6 backdrop-blur">
        <h1 className="text-2xl font-bold">已登录</h1>
        <p className="text-sm text-slate-600">
          当前身份：
          <span className="font-medium text-slate-800">{user.nickname}</span>
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href="/forum"
            className="rounded-full bg-sky-600 px-4 py-2 font-medium text-white transition hover:bg-sky-700"
          >
            前往论坛
          </Link>
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
    const contactValue = contact.trim();
    if (!contactValue) {
      setError("请输入手机号或邮箱");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/user-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: contactValue,
          ...(needNickname ? { nickname: nickname.trim() } : {}),
          remember,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        user?: { id: string; nickname: string };
        error?: string;
        needNickname?: boolean;
      };
      if (!res.ok) {
        if (data.needNickname) {
          setNeedNickname(true);
          setError("该联系方式还没有绑定昵称，请设置一个昵称（绑定后不可修改）");
          return;
        }
        throw new Error(data.error || "登录失败");
      }
      await refresh();
      const next = new URLSearchParams(window.location.search).get("next");
      const target = next && next.startsWith("/") ? next : "/forum";
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
        <h1 className="text-2xl font-bold">用户登录</h1>
        <p className="text-sm leading-relaxed text-slate-600">
          输入手机号或邮箱。首次登录会要求设置一个昵称，
          <span className="font-medium">昵称绑定后不可修改</span>。
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="contact" className="text-xs font-medium text-slate-500">
            手机号 / 邮箱
          </label>
          <input
            id="contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="例如 138xxxxxxxx 或 name@example.com"
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white/80 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </div>

        {needNickname ? (
          <div>
            <label htmlFor="nickname" className="text-xs font-medium text-slate-500">
              设置昵称（绑定后不可修改）
            </label>
            <input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={24}
              placeholder="给自己起一个昵称"
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white/80 px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </div>
        ) : null}

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
          {busy ? "登录中…" : needNickname ? "绑定并登录" : "登录"}
        </button>
      </form>

      <Link href="/" className="text-xs text-slate-500 hover:underline">
        ← 返回主站
      </Link>
    </div>
  );
}
