"use client";

import Link from "next/link";
import { useRef, useState } from "react";

type Section = {
  name: string;
  desc: string;
  meta: string;
  dot: string;
  href?: string;
  soon?: boolean;
};

const sections: Section[] = [
  {
    name: "邦多利",
    desc: "BanG Dream! 角色资料、乐队与小故事。",
    meta: "9 支乐队 · 45 名角色",
    dot: "#FF3377",
    href: "/characters",
  },
  {
    name: "明日方舟",
    desc: "干员档案与资料整理（筹备中）。",
    meta: "即将上线",
    dot: "#38bdf8",
    soon: true,
  },
  {
    name: "火影忍者",
    desc: "忍者档案与人物关系（筹备中）。",
    meta: "即将上线",
    dot: "#f59e0b",
    soon: true,
  },
  {
    name: "学术",
    desc: "学习笔记与资料整理（筹备中）。",
    meta: "即将上线",
    dot: "#8b5cf6",
    soon: true,
  },
  {
    name: "论坛",
    desc: "留言、讨论与同好交流。",
    meta: "开放中",
    dot: "#10b981",
    href: "/forum",
  },
];

export function HomeSections() {
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSoon = (name: string) => {
    setToast(`「${name}」板块即将上线`);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2400);
  };

  const cardClass =
    "group flex min-h-[150px] w-full flex-col bg-white/55 p-6 text-left backdrop-blur transition-colors hover:bg-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400";

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) =>
          section.soon ? (
            <button
              key={section.name}
              type="button"
              onClick={() => showSoon(section.name)}
              className={cardClass}
            >
              <div className="flex w-full items-center justify-between">
                <span className="flex items-center gap-2 text-lg font-semibold">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: section.dot }}
                  />
                  {section.name}
                </span>
                <span className="text-[10px] text-slate-400">
                  {section.meta}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {section.desc}
              </p>
            </button>
          ) : (
            <Link
              key={section.name}
              href={section.href ?? "/"}
              className={cardClass}
            >
              <div className="flex w-full items-center justify-between">
                <span className="flex items-center gap-2 text-lg font-semibold">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: section.dot }}
                  />
                  {section.name}
                </span>
                <span className="text-[10px] text-slate-400">
                  {section.meta}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {section.desc}
              </p>
              <span className="mt-4 text-xs font-medium text-sky-600 opacity-0 transition group-hover:opacity-100">
                进入板块 →
              </span>
            </Link>
          ),
        )}
      </div>

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
