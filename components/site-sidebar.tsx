"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

type Section = {
  label: string;
  href?: string;
  soon?: boolean;
};

const sections: Section[] = [
  { label: "主站", href: "/" },
  { label: "邦多利", href: "/characters" },
  { label: "明日方舟", soon: true },
  { label: "火影忍者", soon: true },
  { label: "学术", soon: true },
  { label: "论坛", href: "/forum" },
];

function isActive(pathname: string, href?: string): boolean {
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

export function SiteSidebar() {
  const pathname = usePathname();
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSoon = (label: string) => {
    setToast(`「${label}」板块即将上线`);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2400);
  };

  const desktopClass = (active: boolean) =>
    `flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${
      active
        ? "bg-sky-50 font-medium text-sky-700"
        : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
    }`;

  const mobileClass = (active: boolean) =>
    `whitespace-nowrap rounded-full px-3 py-1.5 text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${
      active
        ? "bg-sky-50 font-medium text-sky-700"
        : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
    }`;

  return (
    <>
      <aside className="fixed bottom-0 left-0 top-14 z-10 hidden w-48 flex-col border-r border-white/60 bg-white/55 backdrop-blur-xl lg:flex">
        <div className="flex-1 overflow-y-auto p-3">
          <p className="px-3 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            板块
          </p>
          <nav className="space-y-1" aria-label="板块导航">
            {sections.map((section) =>
              section.soon ? (
                <button
                  key={section.label}
                  type="button"
                  onClick={() => showSoon(section.label)}
                  className={`${desktopClass(false)} w-full text-left`}
                >
                  {section.label}
                  <span className="ml-auto text-[10px] text-slate-400">
                    即将上线
                  </span>
                </button>
              ) : (
                <Link
                  key={section.label}
                  href={section.href ?? "/"}
                  className={desktopClass(
                    isActive(pathname, section.href),
                  )}
                >
                  {section.label}
                </Link>
              ),
            )}
          </nav>
        </div>
        <p className="px-4 pb-4 text-[10px] leading-relaxed text-slate-400">
          用爱发电
          <br />
          资料持续核对中
        </p>
      </aside>

      <nav
        className="flex gap-2 overflow-x-auto border-b border-white/60 bg-white/60 px-3 py-2 backdrop-blur-md lg:hidden"
        aria-label="板块导航"
      >
        {sections.map((section) =>
          section.soon ? (
            <button
              key={section.label}
              type="button"
              onClick={() => showSoon(section.label)}
              className={mobileClass(false)}
            >
              {section.label}
            </button>
          ) : (
            <Link
              key={section.label}
              href={section.href ?? "/"}
              className={mobileClass(isActive(pathname, section.href))}
            >
              {section.label}
            </Link>
          ),
        )}
      </nav>

      {toast ? (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900/90 px-4 py-2 text-xs text-white shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </>
  );
}
