import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findMemeBySlug, memes } from "@/lib/memes";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return memes.map((meme) => ({ slug: meme.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meme = findMemeBySlug(slug);
  return {
    title: meme ? `${meme.title} · 梗解释` : "梗未找到",
  };
}

export default async function MemePage({ params }: Props) {
  const { slug } = await params;
  const meme = findMemeBySlug(slug);

  if (!meme) {
    notFound();
  }

  if (meme.special === "zhanjie") {
    return (
      <div className="relative -mx-4 -my-8 flex min-h-[calc(100vh-6rem)] items-center justify-center overflow-hidden bg-slate-950 px-6 text-center text-slate-100">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 35%, rgba(190, 24, 93, 0.28), transparent 60%)",
          }}
        />
        <div className="relative space-y-5">
          <p className="text-[10px] tracking-[0.5em] text-rose-500/80">
            THE FATHER
          </p>
          <h1 className="text-7xl font-black tracking-tight sm:text-9xl">
            湛杰
          </h1>
          <p className="text-sm text-slate-400">湛宇轩的严父</p>
        </div>
      </div>
    );
  }

  return (
    <div data-portal className="mx-auto max-w-2xl space-y-6 py-12">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
        Meme Archive
      </p>
      <h1 className="text-6xl font-black tracking-tight sm:text-8xl">
        {meme.title}
      </h1>
      <p className="text-sm text-slate-500">{meme.summary}</p>
      <p className="leading-relaxed text-slate-600">{meme.detail}</p>

      {meme.bilibiliUrl ? (
        <a
          href={meme.bilibiliUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-rose-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-rose-600"
        >
          在 B站 查看详细解释
        </a>
      ) : null}

      <div>
        <Link href="/" className="text-sm text-slate-500 hover:underline">
          ← 返回主站
        </Link>
      </div>
    </div>
  );
}
