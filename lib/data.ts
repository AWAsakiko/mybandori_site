import bands from "@/data/bands.json";
import characters from "@/data/characters.json";
import stories from "@/data/stories.json";

export type Band = {
  id: string;
  name: string;
  color: string;
  colorLight?: string | null;
};

export type PreviousSchool = {
  name: string;
  stage?: string | null;
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
  schoolStage?: string | null;
  previousSchools?: PreviousSchool[] | null;
  schoolNote?: string | null;
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

/** 现就读学段：优先使用数据里的 schoolStage，其次按年级/学校名推断 */
export function getSchoolStage(character: Character): string | null {
  if (character.schoolStage) return character.schoolStage;
  if (!character.school) return null;
  if (character.school.includes("大学")) return "大学";
  if (character.grade?.includes("高中")) return "高中部";
  if (character.grade?.includes("初中")) return "初中部";
  return null;
}

export function getPreviousSchool(character: Character): PreviousSchool | null {
  return character.previousSchools?.[0] ?? null;
}

/** 现就读大学视为已高中毕业 */
export function isGraduated(character: Character): boolean {
  return Boolean(character.school?.includes("大学"));
}

/** 学校筛选：同时匹配现就读与曾就读 */
export function matchesSchool(character: Character, school: string): boolean {
  if (!school) return true;
  if (character.school === school) return true;
  return Boolean(character.previousSchools?.some((p) => p.name === school));
}
