"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { allBands, allCharacters, getBand } from "@/lib/data";
import { findExactMeme, memes } from "@/lib/memes";

type Result = {
  key: string;
  title: string;
  subtitle?: string;
  href: string;
  isExact?: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CommandPalette({ open, onClose }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  const q = query.trim();
  const exact = findExactMeme(q);

  const results: Result[] = [];

  if (exact) {
    results.push({
      key: `meme-${exact.slug}-exact`,
      title: `发现神秘彩蛋：${exact.title}`,
      subtitle: exact.summary,
      href: `/meme/${exact.slug}`,
      isExact: true,
    });
  }

  const memeMatches = memes.filter((meme) => {
    if (exact && meme.slug === exact.slug) return false;
    if (!q) return true;
    return (
      meme.title.toLowerCase().includes(q.toLowerCase()) ||
      meme.summary.toLowerCase().includes(q.toLowerCase()) ||
      meme.keys.some((key) => key.toLowerCase().includes(q.toLowerCase()))
    );
  });

  for (const meme of memeMatches.slice(0, 6)) {
    results.push({
      key: `meme-${meme.slug}`,
      title: meme.title,
      subtitle: meme.summary,
      href: `/meme/${meme.slug}`,
    });
  }

  if (q) {
    const characterMatches = allCharacters.filter((character) => {
      const band = getBand(character.bandId);
      return [
        character.nameZh,
        character.nameJa,
        character.nameRomaji,
        character.voiceActress?.nameJa,
        band?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q.toLowerCase());
    });

    for (const character of characterMatches.slice(0, 6)) {
      results.push({
        key: `character-${character.id}`,
        title: character.nameZh,
        subtitle: `${getBand(character.bandId)?.name ?? ""}${
          character.nameJa ? ` · ${character.nameJa}` : ""
        }`,
        href: `/characters/${character.id}`,
      });
    }

    const bandMatches = allBands.filter((band) =>
      band.name.toLowerCase().includes(q.toLowerCase()),
    );
    for (const band of bandMatches.slice(0, 3)) {
      results.push({
        key: `band-${band.id}`,
        title: band.name,
        subtitle: "乐队",
        href: `/bands/${band.id}`,
      });
    }
  }

  const select = (result: Result) => {
    onClose();
    router.push(result.href);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => Math.min(value + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) => Math.max(value - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const result = results[active];
      if (result) select(result);
    } else if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="全局搜索"
    >
      <div
        className="w-full max-w-xl bg-white/95 p-4 shadow-2xl backdrop-blur"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
          <span className="text-xs text-slate-400">搜索</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
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

        <ul className="mt-3 max-h-[55vh] overflow-y-auto">
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-xs text-slate-400">
              没有找到相关内容，试试 114514、kskbl 或「湛宇轩父亲」。
            </li>
          ) : (
            results.map((result, index) => (
              <li key={result.key}>
                <button
                  type="button"
                  onClick={() => select(result)}
                  onMouseEnter={() => setActive(index)}
                  className={`flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left transition ${
                    index === active
                      ? result.isExact
                        ? "bg-rose-50 ring-2 ring-rose-300"
                        : "bg-sky-50"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`text-sm ${
                      result.isExact
                        ? "font-semibold text-rose-600"
                        : "text-slate-800"
                    }`}
                  >
                    {result.title}
                  </span>
                  {result.subtitle ? (
                    <span className="text-[11px] text-slate-400">
                      {result.subtitle}
                    </span>
                  ) : null}
                </button>
              </li>
            ))
          )}
        </ul>

        <p className="mt-3 border-t border-slate-100 pt-2 text-[10px] text-slate-400">
          Ctrl / ⌘ + K 打开 · ↑ ↓ 选择 · Enter 进入 · Esc 关闭
        </p>
      </div>
    </div>
  );
}
