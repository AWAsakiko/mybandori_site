import Link from "next/link";
import { allBands, allCharacters } from "@/lib/data";
import { CharacterCard } from "@/components/character-card";

export const metadata = {
  title: "乐队总览",
};

export default function BandsPage() {
  return (
    <div className="space-y-8 sm:space-y-12">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">乐队总览</h1>
        <p className="text-sm text-slate-500">
          9 支乐队，点击乐队名进入详情。每支乐队使用其主题色作为标识。
        </p>
      </header>

      {allBands.map((band) => {
        const members = allCharacters.filter((c) => c.bandId === band.id);
        return (
          <section key={band.id} id={band.id} className="space-y-4">
            <div className="flex items-center gap-3">
              <span
                className="inline-block h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: band.color }}
                title={band.color}
                aria-label={`主题色 ${band.color}`}
              />
              <h2 className="text-lg font-semibold">
                <Link
                  href={`/bands/${band.id}`}
                  className="transition hover:underline"
                >
                  {band.name}
                </Link>
              </h2>
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
