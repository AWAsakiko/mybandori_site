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
      </header>
      <CharacterExplorer characters={allCharacters} bands={allBands} />
    </div>
  );
}
