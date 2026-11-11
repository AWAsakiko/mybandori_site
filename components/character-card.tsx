import Image from "next/image";
import Link from "next/link";
import { getBand, type Character } from "@/lib/data";

type Props = {
  character: Character;
  /** 同队成员列表里可以隐藏重复的乐队名 */
  showBand?: boolean;
  /** 学校筛选命中时显示「在读 / 曾就读」角标 */
  schoolBadge?: "current" | "previous";
};

export function CharacterCard({
  character,
  showBand = true,
  schoolBadge,
}: Props) {
  const band = getBand(character.bandId);

  return (
    <Link
      href={`/characters/${character.id}`}
      className="group relative block p-2 transition-colors duration-200 hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
    >
      <div className="relative h-56 w-full">
        {character.supportColor ? (
          <span
            className="absolute left-1 top-1 z-10 h-2.5 w-2.5 rounded-full ring-2 ring-white"
            style={{ backgroundColor: character.supportColor }}
            title="应援色"
          />
        ) : null}
        {schoolBadge ? (
          <span className="absolute right-1 top-1 z-10 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-slate-500">
            {schoolBadge === "current" ? "在读" : "曾就读"}
          </span>
        ) : null}
        <Image
          src={character.image}
          alt={character.nameZh}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 220px"
          className="object-contain"
        />
      </div>
      <div className="min-w-0 space-y-1 pt-2">
        <p className="truncate font-semibold leading-tight">{character.nameZh}</p>
        {showBand ? (
          <p className="truncate text-xs text-slate-500">
            {band?.name ?? "乐队待定"}
          </p>
        ) : null}
        <p className="truncate text-xs text-slate-400">
          {character.nameJa ?? "日文名待补充"}
        </p>
      </div>
    </Link>
  );
}
