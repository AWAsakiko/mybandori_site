import bands from "@/data/bands.json";
import characters from "@/data/characters.json";
import stories from "@/data/stories.json";

export type Band = {
  id: string;
  name: string;
  color: string;
  colorLight?: string | null;
};

export type Character = {
  id: string;
  nameZh: string;
  nameJa: string | null;
  nameRomaji: string | null;
  bandId: string;
  part: string | null;
  heightCm: number | null;
  birthday: string | null;
  zodiac: string | null;
  themeColor: string | null;
  supportColor: string | null;
  voiceActress: { nameJa: string; nameZh?: string } | null;
  school: string | null;
  grade: string | null;
  bio: string | null;
  tags: string[];
  notes?: Record<string, string> | null;
  refs?: Record<string, number> | null;
  image: string;
};

export type Story = {
  id: string;
  title: string;
  members: string[];
  text: string;
  source: string;
};

export const allBands: Band[] = bands as Band[];
export const allCharacters: Character[] = characters as unknown as Character[];
export const allStories: Story[] = stories as unknown as Story[];

export function getBand(id: string): Band | undefined {
  return allBands.find((b) => b.id === id);
}

export function getCharacter(id: string): Character | undefined {
  return allCharacters.find((c) => c.id === id);
}

export function getCharactersByBand(bandId: string): Character[] {
  return allCharacters.filter((c) => c.bandId === bandId);
}

export function getStoriesForCharacter(id: string): Story[] {
  return allStories.filter((s) => s.members.includes(id));
}
