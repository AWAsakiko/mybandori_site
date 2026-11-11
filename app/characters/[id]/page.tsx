import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getBand,
  getCharacter,
  getCharactersByBand,
  getSchoolStage,
  getStoriesForCharacter,
  getPreviousSchool,
  isGraduated,
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

  const schoolStage = getSchoolStage(character);
  const schoolLabel = character.school
    ? `${character.school}${schoolStage && schoolStage !== "大学" ? `（${schoolStage}）` : ""}`
    : "暂无可靠来源";
  const previousSchool = getPreviousSchool(character);
  const previousSchoolLabel = previousSchool
    ? `${previousSchool.name}${previousSchool.stage ? `（${previousSchool.stage}）` : ""}`
    : (character.schoolNote ?? "暂无明确来源");
  const graduated = isGraduated(character);

  const fields: Array<{ key: string; label: string; value: string | null }> = [
    { key: "nameJa", label: "日文原名", value: character.nameJa },
    { key: "nameRomaji", label: "罗马音", value: character.nameRomaji },
    { key: "part", label: "担当", value: character.part },
    { key: "heightCm", label: "身高", value: character.heightCm ? `${character.heightCm} cm` : null },
    { key: "birthday", label: "生日", value: character.birthday },
    { key: "zodiac", label: "星座", value: character.zodiac },
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
        <div className="space-y-3">
          <div
            className="h-1 w-16 rounded-full"
            style={{
              backgroundColor:
                character.supportColor ?? band?.color ?? "#e2e8f0",
            }}
          />
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

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-slate-400">现就读</p>
              <p className="font-medium text-slate-700">{schoolLabel}</p>
            </div>
            <div>
              <p className="text-slate-400">曾就读</p>
              <p className="flex flex-wrap items-center gap-2 font-medium text-slate-700">
                {previousSchoolLabel}
                {graduated ? (
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                    已毕业
                  </span>
                ) : null}
              </p>
            </div>
          </div>

          {character.bio ? (
            <p className="text-sm leading-relaxed text-slate-600">
              {character.bio}
            </p>
          ) : null}

          <p className="bg-amber-50/70 px-3 py-2 text-xs leading-relaxed text-amber-700">
            部分字段（生日、身高、学校、年级、应援色等）仍在核对中，页面会显示「? 暂无可靠来源」；
            1–2 个来源的数值会带「参考」角标。我们只收录可查证的内容，不做猜测。
          </p>
        </div>
      </div>

      {stories.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">相关小故事</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {stories.map((story) => (
              <article key={story.id} className="space-y-2 py-4">
                <h3 className="font-semibold">{story.title}</h3>
                <p className="leading-relaxed text-slate-600">{story.text}</p>
                <p className="text-xs text-slate-400">来源：{story.source}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {siblings.length > 0 ? (
        <section
          className="space-y-3"
          aria-label={`${band?.name ?? "同队"}的其他成员`}
        >
          <h2 className="text-lg font-semibold">
            {band?.name ?? "同队"}的其他成员
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {siblings.map((member) => (
              <CharacterCard key={member.id} character={member} showBand={false} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
