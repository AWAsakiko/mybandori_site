"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  IDENTITY_EVENT,
  loadIdentity,
  saveIdentity,
} from "@/lib/identity";

type Reply = {
  id: string;
  post_id: string;
  nickname: string;
  content: string;
  created_at: string;
  contact?: string;
};

const PHONE_RE = /^1[3-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

export function ReplySection({ postId }: { postId: string }) {
  const { role, isAdmin } = useAuth();
  const [replies, setReplies] = useState<Reply[]>([]);
  const [adminView, setAdminView] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [nickname, setNickname] = useState("");
  const [contact, setContact] = useState("");
  const [content, setContent] = useState("");
  const [remember, setRemember] = useState(false);
  const [identityLoaded, setIdentityLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/replies?post_id=${encodeURIComponent(postId)}`,
        { cache: "no-store" },
      );
      const data = (await res.json().catch(() => ({}))) as {
        replies?: Reply[];
        admin?: boolean;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "回复加载失败");
      setReplies(data.replies ?? []);
      setAdminView(Boolean(data.admin));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "回复加载失败");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    void load();
  }, [load, role]);

  useEffect(() => {
    const apply = () => {
      const saved = loadIdentity();
      if (!saved) return;
      setNickname((prev) => prev || saved.identity.nickname);
      setContact((prev) => prev || saved.identity.contact);
      setRemember(saved.remember);
      setIdentityLoaded(true);
    };
    apply();
    window.addEventListener(IDENTITY_EVENT, apply);
    return () => window.removeEventListener(IDENTITY_EVENT, apply);
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice(null);
    const name = nickname.trim();
    const contactValue = contact.trim();
    const text = content.trim();

    if (!name) return setError("请填写昵称");
    if (name.length > 24) return setError("昵称不能超过 24 个字符");
    if (!PHONE_RE.test(contactValue) && !EMAIL_RE.test(contactValue)) {
      return setError("请填写正确的手机号或邮箱");
    }
    if (!text) return setError("请填写回复内容");
    if (text.length > 2000) return setError("回复不能超过 2000 个字符");

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: postId,
          nickname: name,
          contact: contactValue,
          content: text,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "回复失败");
      saveIdentity({ nickname: name, contact: contactValue }, remember);
      setIdentityLoaded(true);
      setContent("");
      setNotice("回复成功！");
      setExpanded(true);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "回复失败");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("确定删除这条回复吗？")) return;
    try {
      const res = await fetch(`/api/replies/${id}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "删除失败");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    }
  };

  const visible = expanded ? replies : replies.slice(-5);

  return (
    <div className="mt-3 space-y-2 border-l border-slate-200/70 pl-3">
      <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
        <span>{replies.length > 0 ? `${replies.length} 条回复` : "回复"}</span>
        {replies.length > 5 ? (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="text-xs text-sky-600 hover:underline"
          >
            {expanded ? "收起回复" : `展开全部 ${replies.length} 条回复`}
          </button>
        ) : null}
      </div>

      <div className="max-h-[320px] overflow-y-auto pr-1">
        {loading ? (
          <p className="py-2 text-xs text-slate-400">加载中…</p>
        ) : replies.length === 0 ? (
          <p className="py-2 text-xs text-slate-400">还没有回复。</p>
        ) : (
          <ul className="space-y-3">
            {visible.map((reply) => (
              <li key={reply.id} className="text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-slate-800">
                    {reply.nickname}
                  </span>
                  {adminView && reply.contact ? (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-600">
                      {PHONE_RE.test(reply.contact) ? "手机" : "邮箱"}：
                      {reply.contact}
                    </span>
                  ) : null}
                  <time className="text-[11px] text-slate-400">
                    {formatDate(reply.created_at)}
                  </time>
                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => void remove(reply.id)}
                      className="ml-auto text-[11px] text-rose-500 hover:underline"
                    >
                      删除
                    </button>
                  ) : null}
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words text-slate-700">
                  {reply.content}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={submit} className="space-y-2 pt-2">
        {identityLoaded && nickname ? (
          <p className="text-[11px] text-slate-400">
            当前身份：{nickname}，如需切换请清除浏览器缓存或修改输入框。
          </p>
        ) : null}
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={24}
            placeholder="昵称"
            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="手机号 / 邮箱（仅管理员可见）"
            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={2000}
          rows={2}
          placeholder="回复…"
          className="w-full resize-y rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />
        <label className="flex items-center gap-2 text-[11px] text-slate-500">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-slate-300"
          />
          记住我的昵称和联系方式
        </label>

        {error ? (
          <p className="bg-rose-50 px-2 py-1.5 text-[11px] text-rose-600">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="bg-emerald-50 px-2 py-1.5 text-[11px] text-emerald-600">
            {notice}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400">
            同一 IP 1 分钟内限发 1 条
          </span>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-sky-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-sky-700 disabled:opacity-50"
          >
            {submitting ? "回复中…" : "回复"}
          </button>
        </div>
      </form>
    </div>
  );
}
