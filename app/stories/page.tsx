import Link from "next/link";
import { allBands, allCharacters, allStories, getCharacter } from "@/lib/data";

export const metadata = {
  title: "小故事",
};

export default function StoriesPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">队员之间的小故事</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500">
          收录队员之间的趣事与关系片段，均整理自公开资料站，只保留可查证的互动，尽量保持角色原本的性格。
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {allStories.map((story) => (
          <article
            key={story.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold">{story.title}</h2>
              {story.members.map((memberId) => {
                const member = getCharacter(memberId);
                return member ? (
                  <Link
                    key={memberId}
                    href={`/characters/${memberId}`}
                    className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600 transition hover:bg-slate-200"
                  >
                    {member.nameZh}
                  </Link>
                ) : null;
              })}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {story.text}
            </p>
            <p className="mt-3 text-xs text-slate-400">来源：{story.source}</p>
          </article>
        ))}
      </div>

      <p className="text-xs text-slate-400">
        小故事会持续补充；如果你发现与官方设定不符之处，欢迎指正。
      </p>
    </div>
  );
}
