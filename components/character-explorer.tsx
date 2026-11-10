"use client";

import { useMemo, useState } from "react";
import { CharacterCard } from "@/components/character-card";
import type { Band, Character } from "@/lib/data";

type Props = {
  characters: Character[];
  bands: Band[];
};

const chip = (active: boolean) =>
  `rounded-full border px-3.5 py-1.5 text-sm transition ${
    active
      ? "border-slate-900 bg-slate-900 text-white"
      : "border-slate-300 bg-white text-slate-600 hover:border-slate-500"
  }`;

export function CharacterExplorer({ characters, bands }: Props) {
  const [q, setQ] = useState("");
  const [bandId, setBandId] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [color, setColor] = useState("");

  const schools = useMemo(
    () =>
      Array.from(
        new Set(characters.map((c) => c.school).filter(Boolean)),
      ) as string[],
    [characters],
  );
  const grades = useMemo(
    () =>
      Array.from(
        new Set(characters.map((c) => c.grade).filter(Boolean)),
      ) as string[],
    [characters],
  );
  const colors = useMemo(
    () =>
      Array.from(
        new Set(characters.map((c) => c.supportColor).filter(Boolean)),
      ) as string[],
    [characters],
  );

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    return characters.filter((c) => {
      if (bandId && c.bandId !== bandId) return false;
      if (school && c.school !== school) return false;
      if (grade && c.grade !== grade) return false;
      if (color && c.supportColor !== color) return false;
      if (key) {
        const bandName = bands.find((b) => b.id === c.bandId)?.name ?? "";
        const hay = [
          c.nameZh,
          c.nameJa,
          c.nameRomaji,
          c.voiceActress?.nameJa,
          bandName,
          ...(c.tags ?? []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(key)) return false;
      }
      return true;
    });
  }, [characters, q, bandId, school, grade, color]);

  return (
    <div className="space-y-6">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="搜索姓名 / 日文名 / 罗马音 / 声优…"
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500"
      />

      <div className="space-y-2.5">
        <Row label="乐队">
          <button className={chip(!bandId)} onClick={() => setBandId("")}>
            全部
          </button>
          {bands.map((b) => (
            <button
              key={b.id}
              className={chip(bandId === b.id)}
              onClick={() => setBandId(b.id)}
            >
              {b.name}
            </button>
          ))}
        </Row>

        {schools.length > 0 && (
          <Row label="学校">
            <button className={chip(!school)} onClick={() => setSchool("")}>
              全部
            </button>
            {schools.map((s) => (
              <button
                key={s}
                className={chip(school === s)}
                onClick={() => setSchool(s)}
              >
                {s}
              </button>
            ))}
          </Row>
        )}

        {grades.length > 0 && (
          <Row label="年级">
            <button className={chip(!grade)} onClick={() => setGrade("")}>
              全部
            </button>
            {grades.map((g) => (
              <button
                key={g}
                className={chip(grade === g)}
                onClick={() => setGrade(g)}
              >
                {g}
              </button>
            ))}
          </Row>
        )}

        {colors.length > 0 && (
          <Row label="应援色">
            <button className={chip(!color)} onClick={() => setColor("")}>
              全部
            </button>
            {colors.map((c) => (
              <button
                key={c}
                title={c}
                onClick={() => setColor(color === c ? "" : c)}
                className={`h-7 w-7 rounded-full border-2 transition ${
                  color === c
                    ? "scale-110 border-slate-900"
                    : "border-white shadow"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </Row>
        )}
      </div>

      <p className="text-sm text-slate-500">共 {filtered.length} 名角色</p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filtered.map((c) => (
          <CharacterCard key={c.id} character={c} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-10 text-center text-sm text-slate-400">
          没有符合条件的角色
        </p>
      )}
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-12 shrink-0 text-xs text-slate-400">{label}</span>
      {children}
    </div>
  );
}
