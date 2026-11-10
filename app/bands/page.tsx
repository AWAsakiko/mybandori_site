import Link from "next/link";
import { allBands, allCharacters } from "@/lib/data";
import { CharacterCard } from "@/components/character-card";

export const metadata = {
  title: "乐队总览",
};

export default function BandsPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">乐队总览</h1>
        <p className="text-sm text-slate-500">
          9 支乐队，点击乐队名进入详情。每支乐队使用其主题色作为标识。
        </p>
      </header>

      {allBands.map((band) => {
        const members = allCharacters.filter((c) => c.bandId === band.id);
        return (
          <section key={band.id} id={band.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-3 text-lg font-semibold">
                <span
                  className="inline-block h-2.5 w-10 rounded-full"
                  style={{ backgroundColor: band.color }}
                />
                <Link
                  href={`/bands/${band.id}`}
                  className="transition hover:underline"
                >
                  {band.name}
                </Link>
              </h2>
              <span className="text-xs text-slate-400">
                {members.length} 名成员 · {band.color}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              {members.map((character) => (
                <CharacterCard key={character.id} character={character} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
