import Image from "next/image";
import Link from "next/link";
import { getBand, type Character } from "@/lib/data";

export function CharacterCard({ character }: { character: Character }) {
  const band = getBand(character.bandId);

  return (
    <Link
      href={`/characters/${character.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:z-10 hover:scale-105 hover:border-slate-300 hover:shadow-lg"
    >
      <div className="relative h-56 w-full overflow-hidden bg-white">
        {character.supportColor ? (
          <span
            className="absolute left-3 top-3 z-10 h-2.5 w-2.5 rounded-full ring-2 ring-white"
            style={{ backgroundColor: character.supportColor }}
            title="应援色"
          />
        ) : null}
        <Image
          src={character.image}
          alt={character.nameZh}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 220px"
          className="object-contain p-2"
        />
      </div>
      <div className="min-w-0 space-y-1 p-3">
        <p className="truncate font-semibold leading-tight">{character.nameZh}</p>
        <p className="truncate text-xs text-slate-500">{band?.name ?? "乐队待定"}</p>
        <p className="truncate text-xs text-slate-400">
          {character.nameJa ?? "日文名待补充"}
        </p>
      </div>
    </Link>
  );
}
