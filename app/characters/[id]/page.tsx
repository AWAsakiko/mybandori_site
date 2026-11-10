import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getBand,
  getCharacter,
  getCharactersByBand,
  getStoriesForCharacter,
} from "@/lib/data";
import { CharacterCard } from "@/components/character-card";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const character = getCharacter(id);
  return {
    title: character ? character.nameZh : "角色未找到",
  };
}

export default async function CharacterDetailPage({ params }: Props) {
  const { id } = await params;
  const character = getCharacter(id);

  if (!character) {
    notFound();
  }

  const band = getBand(character.bandId);
  const siblings = getCharactersByBand(character.bandId).filter(
    (c) => c.id !== character.id,
  );
  const stories = getStoriesForCharacter(character.id);

  const fields: Array<{ key: string; label: string; value: string | null }> = [
    { key: "nameJa", label: "日文原名", value: character.nameJa },
    { key: "nameRomaji", label: "罗马音", value: character.nameRomaji },
    { key: "part", label: "担当", value: character.part },
    { key: "heightCm", label: "身高", value: character.heightCm ? `${character.heightCm} cm` : null },
    { key: "birthday", label: "生日", value: character.birthday },
    { key: "zodiac", label: "星座", value: character.zodiac },
    { key: "school", label: "学校", value: character.school },
    { key: "grade", label: "年级", value: character.grade },
    {
      key: "voiceActress",
      label: "声优",
      value: character.voiceActress ? character.voiceActress.nameJa : null,
    },
  ];

  return (
    <div className="space-y-10">
      <div className="grid gap-8 md:grid-cols-[minmax(0,340px)_1fr]">
        <div
          className="rounded-3xl border border-slate-200 bg-white p-4"
          style={{ borderTopColor: character.supportColor ?? band?.color ?? "#e2e8f0", borderTopWidth: 6 }}
        >
          <div className="relative h-72 w-full">
            <Image
              src={character.image}
              alt={character.nameZh}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 340px"
              className="object-contain"
            />
          </div>
        </div>

        <div className="space-y-5">
          <div>
            {band ? (
              <Link
                href={`/characters?band=${band.id}`}
                className="inline-block rounded-full px-3 py-1 text-xs text-slate-700"
                style={{ backgroundColor: `${band.color}22` }}
              >
                {band.name}
              </Link>
            ) : null}
            <h1 className="mt-3 text-3xl font-bold">{character.nameZh}</h1>
            <p className="mt-1 text-slate-500">
              {character.nameJa ?? "日文名待补充"}
              {character.nameRomaji ? ` · ${character.nameRomaji}` : ""}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {fields.map((field) => (
              <div key={field.label}>
                <dt className="text-slate-400">{field.label}</dt>
                <dd className="font-medium text-slate-700">
                  {field.value ?? character.notes?.[field.key] ?? (
                    <span
                      className="inline-flex items-center gap-1 text-slate-400"
                      title="官方未公开"
                    >
                      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[10px] font-semibold leading-none">
                        ?
                      </span>
                      <span>暂无可靠来源</span>
                    </span>
                  )}
                  {character.refs?.[field.key] ? (
                    <sup
                      className="ml-1 cursor-help align-super text-[10px] text-amber-500"
                      title={`来源不足 3 个，仅供参考（当前 ${character.refs[field.key]} 个来源）`}
                    >
                      参考
                    </sup>
                  ) : null}
                </dd>
              </div>
            ))}
            <div>
              <dt className="text-slate-400">应援色</dt>
              <dd className="flex items-center gap-2 font-medium text-slate-700">
                {character.supportColor ? (
                  <>
                    <span
                      className="inline-block h-4 w-4 rounded-full border border-slate-200"
                      style={{ backgroundColor: character.supportColor }}
                    />
                    {character.supportColor}
                    {character.refs?.supportColor ? (
                      <sup
                        className="ml-1 cursor-help align-super text-[10px] text-amber-500"
                        title={`来源不足 3 个，仅供参考（当前 ${character.refs.supportColor} 个来源）`}
                      >
                        参考
                      </sup>
                    ) : null}
                  </>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 text-slate-400"
                    title="官方未公开"
                  >
                    <span className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[10px] font-semibold leading-none">
                      ?
                    </span>
                    <span>暂无可靠来源</span>
                  </span>
                )}
              </dd>
            </div>
          </dl>

          {character.bio ? (
            <p className="text-sm leading-relaxed text-slate-600">
              {character.bio}
            </p>
          ) : null}

          <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-700">
            部分字段（生日、身高、学校、年级、应援色等）仍在核对中，页面会显示「资料核对中」。
            我们只收录可查证的内容，不做猜测。
          </p>
        </div>
      </div>

      {stories.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">相关小故事</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {stories.map((story) => (
              <article
                key={story.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm"
              >
                <h3 className="font-semibold">{story.title}</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{story.text}</p>
                <p className="mt-2 text-xs text-slate-400">来源：{story.source}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {siblings.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            {band?.name ?? "同队"}的其他成员
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {siblings.map((member) => (
              <CharacterCard key={member.id} character={member} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
