"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { useAuth } from "@/components/auth-provider";

const links = [{ href: "/about", label: "关于" }];

const sections = [
  { label: "主站", href: "/" },
  { label: "邦多利", href: "/characters" },
  { label: "明日方舟", soon: true },
  { label: "火影忍者", soon: true },
  { label: "学术", soon: true },
  { label: "论坛", href: "/forum" },
];

function isSectionActive(pathname: string, href?: string): boolean {
  if (!href) return false;
  if (href === "/") return pathname === "/";
  if (href === "/characters") {
    return (
      pathname.startsWith("/characters") ||
      pathname.startsWith("/bands") ||
      pathname.startsWith("/stories")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav() {
  const { role, isOwner, ready, logout } = useAuth();
  const pathname = usePathname();
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSoon = (label: string) => {
    setToast(`「${label}」板块即将上线`);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2400);
  };

  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-white/70 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-2 px-3 sm:px-4">
        <Link
          href="/"
          className="shrink-0 whitespace-nowrap text-sm font-bold tracking-wide sm:text-lg"
        >
          <span className="hidden sm:inline">
            AWAsakiko<span className="text-rose-500">·</span>的资料站
          </span>
          <span className="sm:hidden">AWAsakiko</span>
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

      <div className="border-t border-white/50">
        <nav
          className="mx-auto flex h-10 w-full max-w-6xl items-center gap-1 overflow-x-auto px-3 text-xs sm:px-4"
          aria-label="板块导航"
        >
          {sections.map((section) =>
            section.soon ? (
              <button
                key={section.label}
                type="button"
                onClick={() => showSoon(section.label)}
                className="whitespace-nowrap rounded-full px-3 py-1 text-slate-400 transition hover:bg-white/70 hover:text-slate-600"
              >
                {section.label}
                <span className="ml-1 text-[10px] text-slate-300">即将上线</span>
              </button>
            ) : (
              <Link
                key={section.label}
                href={section.href ?? "/"}
                className={`whitespace-nowrap rounded-full px-3 py-1 transition ${
                  isSectionActive(pathname, section.href)
                    ? "bg-sky-50 font-medium text-sky-700"
                    : "text-slate-500 hover:bg-white/70 hover:text-slate-900"
                }`}
              >
                {section.label}
              </Link>
            ),
          )}
        </nav>
      </div>

      {toast ? (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900/90 px-4 py-2 text-xs text-white shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </header>
  );
}
