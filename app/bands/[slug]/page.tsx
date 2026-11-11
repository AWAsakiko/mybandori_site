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

      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <span
            className="inline-block h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: band.color }}
            title={band.color}
            aria-label={`主题色 ${band.color}`}
          />
          <h1 className="text-2xl font-bold">{band.name}</h1>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {members.map((character) => (
          <CharacterCard key={character.id} character={character} />
        ))}
      </div>
    </div>
  );
}
