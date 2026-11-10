import Link from "next/link";
import { notFound } from "next/navigation";
import { allBands, getBand, getCharactersByBand } from "@/lib/data";
import { CharacterCard } from "@/components/character-card";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return allBands.map((band) => ({ slug: band.id }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const band = getBand(slug);
  return {
    title: band ? band.name : "乐队未找到",
  };
}

export default async function BandDetailPage({ params }: Props) {
  const { slug } = await params;
  const band = getBand(slug);

  if (!band) {
    notFound();
  }

  const members = getCharactersByBand(band.id);

  return (
    <div className="space-y-8">
      <Link
        href="/bands"
        className="text-sm text-slate-500 transition hover:text-slate-800 hover:underline"
      >
        ← 返回乐队总览
      </Link>

      <header
        className="rounded-3xl border border-slate-200 bg-white p-6"
        style={{ borderLeftColor: band.color, borderLeftWidth: 8 }}
      >
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
          Band
        </p>
        <h1 className="mt-2 text-2xl font-bold">{band.name}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {members.length} 名成员 · 主题色{" "}
          <span className="inline-flex items-center gap-1 align-middle">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: band.color }}
            />
            {band.color}
          </span>
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {members.map((character) => (
          <CharacterCard key={character.id} character={character} />
        ))}
      </div>
    </div>
  );
}
