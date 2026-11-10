"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

const links = [
  { href: "/", label: "首页" },
  { href: "/characters", label: "角色" },
  { href: "/bands", label: "乐队" },
  { href: "/stories", label: "小故事" },
  { href: "/forum", label: "论坛" },
  { href: "/about", label: "关于" },
];

export function SiteNav() {
  const { role, isOwner, ready, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-white/70 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-2 px-3 sm:px-4">
        <Link
          href="/"
          className="shrink-0 whitespace-nowrap text-base font-bold tracking-wide sm:text-lg"
        >
          <span className="hidden sm:inline">
            邦多利<span className="text-rose-500">·</span>角色资料站
          </span>
          <span className="sm:hidden">
            邦多利<span className="text-rose-500">·</span>站
          </span>
        </Link>
        <nav className="flex min-w-0 items-center gap-0.5 overflow-x-auto text-xs sm:gap-1 sm:text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-full px-2 py-1.5 text-slate-600 transition hover:bg-white/80 hover:text-slate-900 sm:px-3"
            >
              {link.label}
            </Link>
          ))}
          {isOwner ? (
            <Link
              href="/admin"
              className="whitespace-nowrap rounded-full bg-rose-50 px-2 py-1.5 font-medium text-rose-600 transition hover:bg-rose-100 sm:px-3"
            >
              管理后台
            </Link>
          ) : null}
          {ready && role !== "visitor" ? (
            <button
              type="button"
              onClick={logout}
              className="whitespace-nowrap rounded-full px-2 py-1.5 text-slate-400 transition hover:bg-white/80 hover:text-slate-600 sm:px-3"
              title={`当前身份：${role === "owner" ? "站主" : "管理员"}`}
            >
              退出
            </button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
