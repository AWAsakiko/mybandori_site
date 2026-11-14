"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { findExactMeme } from "@/lib/memes";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CommandPalette({ open, onClose }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const navigatedRef = useRef(false);
  const [query, setQuery] = useState("");
  const q = query.trim();

  useEffect(() => {
    if (!open) return;
    navigatedRef.current = false;
    setQuery("");
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previous;
    };
  }, [open]);

  // 输入精确命中梗词典时，直接跳转，不展示任何结果列表
  useEffect(() => {
    if (!open || !q || navigatedRef.current) return;
    const meme = findExactMeme(q);
    if (!meme) return;
    navigatedRef.current = true;
    onClose();
    router.push(`/meme/${meme.slug}`);
  }, [open, q, onClose, router]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="搜索"
    >
      <div
        className="w-full max-w-xl bg-white/95 p-4 shadow-2xl backdrop-blur"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">搜索</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                onClose();
              }
            }}
            placeholder="输入一些神秘数字或者字母串吧"
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] text-slate-400 hover:text-slate-600"
          >
            Esc
          </button>
        </div>
      </div>
    </div>
  );
}
