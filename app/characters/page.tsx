import { allBands, allCharacters } from "@/lib/data";
import { CharacterExplorer } from "@/components/character-explorer";

export const metadata = {
  title: "角色列表",
};

export default function CharactersPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">角色列表</h1>
        <p className="text-sm text-slate-500">
          共 {allCharacters.length} 名角色 · 支持按乐队 / 学校 / 年级 / 应援色筛选，也能按姓名、日文名、声优搜索
        </p>
      </header>
      <CharacterExplorer characters={allCharacters} bands={allBands} />
    </div>
  );
}
