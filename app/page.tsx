import Link from "next/link";
import { allBands, allCharacters, allStories } from "@/lib/data";
import { CharacterCard } from "@/components/character-card";

export default function HomePage() {
  const featured = allCharacters.slice(0, 10);
  const featuredStories = allStories.slice(0, 4);

  return (
    <div className="space-y-6 sm:space-y-12">
      <section className="space-y-3 pt-2">
        <h1 className="text-3xl font-bold sm:text-4xl">
          邦多利角色资料站
        </h1>
        <p className="max-w-2xl leading-relaxed text-slate-600">
          浏览 BanG Dream! 企划 9 支乐队的 45 名角色：担当、声优、生日、应援色、乐队主题色，
          以及队员之间的小故事。资料持续核对中，未查证的字段会明确标注。
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">9 支乐队</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {allBands.map((band) => (
            <Link
              key={band.id}
              href={`/characters?band=${band.id}`}
              className="block px-2 py-3 text-sm transition-colors hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
            >
              <span className="flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: band.color }}
                />
                <span className="font-semibold">{band.name}</span>
              </span>
              <span className="mt-1 block text-xs text-slate-500">
                {allCharacters.filter((c) => c.bandId === band.id).length}{" "}
                名成员
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <h2 className="text-lg font-semibold">角色预览</h2>
          <Link
            href="/characters"
            className="text-sm text-slate-600 transition hover:text-slate-900 hover:underline"
          >
            查看全部 →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {featured.map((character) => (
            <CharacterCard key={character.id} character={character} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <h2 className="text-lg font-semibold">队员小故事</h2>
          <Link
            href="/stories"
            className="text-sm text-rose-600 transition hover:underline"
          >
            查看全部 →
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {featuredStories.map((story) => (
            <article key={story.id} className="space-y-2 py-4">
              <h3 className="font-semibold">{story.title}</h3>
              <p className="leading-relaxed text-slate-600">{story.text}</p>
              <p className="text-xs text-slate-400">来源：{story.source}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
