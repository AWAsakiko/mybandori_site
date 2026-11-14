"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { ReplySection } from "@/components/reply-section";
import { RoleBadge } from "@/components/role-badge";

type Post = {
  id: string;
  nickname: string;
  role?: string;
  content: string;
  image_url: string | null;
  created_at: string;
  contact?: string;
};

const LAST_KEY = "bandori_forum_last_post";

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

export function ForumClient() {
  const { user, isAdmin } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [adminView, setAdminView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/posts", { cache: "no-store" });
      const data = (await res.json().catch(() => ({}))) as {
        posts?: Post[];
        admin?: boolean;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "帖子加载失败");
        setPosts([]);
      } else {
        setPosts(data.posts ?? []);
        setAdminView(Boolean(data.admin));
        setError(null);
      }
    } catch {
      setError("网络错误，请稍后再试");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, user?.id]);

  const goLogin = () => {
    window.alert("请先登录");
    window.location.assign("/user-login?next=/forum");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      goLogin();
      return;
    }
    setNotice(null);
    const text = content.trim();
    if (!text) {
      setError("请填写内容");
      return;
    }
    if (text.length > 2000) {
      setError("内容不能超过 2000 个字符");
      return;
    }
    try {
      const last = Number(window.localStorage.getItem(LAST_KEY) || 0);
      if (Date.now() - last < 60_000) {
        const wait = Math.ceil((60_000 - (Date.now() - last)) / 1000);
        setError(`发帖太快啦，请 ${wait} 秒后再试`);
        return;
      }
    } catch {
      /* ignore */
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, image_url: imageUrl }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "发布失败");
      try {
        window.localStorage.setItem(LAST_KEY, String(Date.now()));
      } catch {
        /* ignore */
      }
      setContent("");
      setImageUrl(null);
      setNotice("发布成功！");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "发布失败");
    } finally {
      setSubmitting(false);
    }
  };

  const upload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError("图片不能超过 5MB");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.url) throw new Error(data.error || "上传失败");
      setImageUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("确定删除这条帖子吗？删除后回复也会一起删除。")) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "删除失败");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败");
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2 py-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-2xl font-bold sm:text-3xl">论坛</h1>
          {adminView ? (
            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600">
              管理员视图 · 联系方式已显示
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
              {user ? "用户视图" : "游客视图"} · 联系方式已隐藏
            </span>
          )}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          登录后即可发帖。一个手机号/邮箱只绑定一个昵称，绑定后不可修改。
        </p>
      </header>

      {user ? (
        <form onSubmit={submit} className="space-y-3 py-4">
          <p className="text-xs text-slate-500">
            当前身份：<span className="font-medium text-slate-800">{user.nickname}</span>
          </p>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={2000}
            rows={4}
            placeholder="想对大家说点什么…"
            className="w-full resize-y rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />

          {isAdmin ? (
            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 p-3">
              <label className="cursor-pointer rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-rose-300 hover:text-rose-600">
                {uploading ? "上传中…" : "上传图片"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void upload(file);
                    e.target.value = "";
                  }}
                  disabled={uploading}
                />
              </label>
              {imageUrl ? (
                <>
                  <span className="text-xs text-slate-500">图片已上传</span>
                  <button
                    type="button"
                    onClick={() => setImageUrl(null)}
                    className="text-xs text-rose-500 hover:underline"
                  >
                    移除
                  </button>
                  <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-slate-200">
                    <Image
                      src={imageUrl}
                      alt="待发布图片"
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                </>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">
              {error}
            </p>
          ) : null}
          {notice ? (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-600">
              {notice}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-400">
              同一账号 1 分钟内限发 1 条 · 联系方式不会展示给游客
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-rose-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-rose-600 disabled:opacity-50"
            >
              {submitting ? "发布中…" : "发布"}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3 py-6">
          <p className="text-sm text-slate-500">登录后才能发帖和回复。</p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={goLogin}
              className="rounded-full bg-rose-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-rose-600"
            >
              发帖（请先登录）
            </button>
            <Link
              href="/user-login?next=/forum"
              className="text-sm text-sky-600 hover:underline"
            >
              前往用户登录
            </Link>
          </div>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">最新帖子</h2>
        {loading ? (
          <p className="py-6 text-sm text-slate-500">加载中…</p>
        ) : posts.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            还没有帖子，来抢沙发吧。
          </p>
        ) : (
          <ul className="space-y-3">
            {posts.map((post) => (
              <li key={post.id} id={`post-${post.id}`} className="scroll-mt-24 space-y-2 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <RoleBadge role={post.role} />
                    <span className="font-semibold">{post.nickname}</span>
                    {adminView && post.contact ? (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-600">
                        {/^1[3-9]\d{9}$/.test(post.contact) ? "手机" : "邮箱"}：
                        {post.contact}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <time className="text-xs text-slate-400">
                      {formatDate(post.created_at)}
                    </time>
                    {adminView ? (
                      <button
                        type="button"
                        onClick={() => void remove(post.id)}
                        className="text-xs text-rose-500 transition hover:text-rose-600 hover:underline"
                      >
                        删除
                      </button>
                    ) : null}
                  </div>
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">
                  {post.content}
                </p>
                {post.image_url ? (
                  <div className="relative mt-3 w-full overflow-hidden rounded-xl border border-slate-200">
                    <Image
                      src={post.image_url}
                      alt="帖子图片"
                      width={900}
                      height={600}
                      sizes="(max-width: 768px) 100vw, 720px"
                      className="h-auto w-full object-cover"
                    />
                  </div>
                ) : null}
                <ReplySection postId={post.id} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
