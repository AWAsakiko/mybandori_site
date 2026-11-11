"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";

type AdminKey = {
  id: string;
  key: string;
  created_at: string;
  status?: string;
};

export function AdminClient() {
  const { isOwner, ready } = useAuth();
  const [keys, setKeys] = useState<AdminKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justCreated, setJustCreated] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/keys", { cache: "no-store" });
      const data = (await res.json().catch(() => ({}))) as {
        keys?: AdminKey[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "读取失败");
      setKeys(data.keys ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "读取失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ready && isOwner) void load();
  }, [ready, isOwner, load]);

  const create = async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/keys", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        key?: AdminKey;
        error?: string;
      };
      if (!res.ok || !data.key) throw new Error(data.error || "生成失败");
      setJustCreated(data.key.key);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    }
  };

  const revoke = async (id: string) => {
    if (!window.confirm("确定作废这个管理员密钥吗？对方将立即失去管理员权限。")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/keys/${id}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "撤销失败");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "撤销失败");
    }
  };

  const copy = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setError(null);
      setJustCreated(key);
    } catch {
      setError("复制失败，请手动选中复制");
    }
  };

  if (!ready) {
    return <p className="text-sm text-slate-500">加载中…</p>;
  }

  if (!isOwner) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-xl font-bold">管理后台</h1>
        <p className="mt-2 text-sm text-slate-500">
          该页面仅站主可访问，请先到登录页使用站主密码登录。
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white"
        >
          前往登录
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2 py-2">
        <h1 className="text-2xl font-bold">管理后台</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          生成管理员密钥并发送给你信任的人。管理员可以查看联系方式、删除帖子、上传图片；
          密钥被作废后，对方将立即失去管理员权限。
        </p>
      </header>

      <section className="space-y-3 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">管理员密钥</h2>
          <button
            type="button"
            onClick={() => void create()}
            className="rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
          >
            生成管理员密钥
          </button>
        </div>

        {justCreated ? (
          <div className="bg-emerald-50 p-3 text-xs text-emerald-700">
            已生成并复制到剪贴板：
            <code className="ml-1 break-all font-mono">{justCreated}</code>
          </div>
        ) : null}

        {error ? (
          <p className="bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>
        ) : null}

        {loading ? (
          <p className="text-sm text-slate-500">加载中…</p>
        ) : keys.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            还没有生成过管理员密钥。
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {keys.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <div className="min-w-0">
                  <code className="break-all font-mono text-xs text-slate-700">
                    {item.key}
                  </code>
                  <p className="mt-1 text-xs text-slate-400">
                    生成于 {new Date(item.created_at).toLocaleString("zh-CN")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void copy(item.key)}
                    className="text-xs text-slate-500 hover:text-slate-800 hover:underline"
                  >
                    复制
                  </button>
                  <button
                    type="button"
                    onClick={() => void revoke(item.id)}
                    className="text-xs text-rose-500 hover:underline"
                  >
                    一键作废
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
