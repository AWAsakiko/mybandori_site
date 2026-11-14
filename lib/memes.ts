export type Meme = {
  slug: string;
  title: string;
  keys: string[];
  summary: string;
  detail: string;
  bilibiliUrl: string | null;
  special?: "zhanjie";
};

const bili = (keyword: string) =>
  `https://search.bilibili.com/all?keyword=${encodeURIComponent(keyword)}`;

export const memes: Meme[] = [
  {
    slug: "114514",
    title: "114514",
    keys: ["114514"],
    summary: "互联网恶臭数字梗",
    detail:
      "源自日本网络文化的数字谐音梗，因读法被中文互联网广泛恶搞，常出现在弹幕、评论区与表情包中。内容低俗，不建议在正式场合使用。",
    bilibiliUrl: bili("114514"),
  },
  {
    slug: "1919810",
    title: "1919810",
    keys: ["1919810"],
    summary: "与 114514 同源的数字梗",
    detail:
      "常与 114514 一起出现的数字梗，属于同一套网络恶搞语境。了解即可，不建议模仿或在不合适的场合使用。",
    bilibiliUrl: bili("1919810"),
  },
  {
    slug: "325",
    title: "325",
    keys: ["325"],
    summary: "明日方舟 UP 主相关数字梗",
    detail:
      "与明日方舟 UP 主相关的数字梗，常见于相关视频和评论区。具体语境以 B 站搜索结果为准。",
    bilibiliUrl: bili("325 明日方舟"),
  },
  {
    slug: "947",
    title: "947",
    keys: ["947"],
    summary: "BanG Dream! 圈内数字谐音梗",
    detail:
      "邦邦玩家常见的数字谐音梗，常出现在相关弹幕和评论区；具体含义会随语境变化。",
    bilibiliUrl: bili("947 邦邦"),
  },
  {
    slug: "kskbl",
    title: "kskbl",
    keys: ["kskbl"],
    summary: "康神开播了",
    detail:
      "「康神开播了」的首字母缩写，常见于直播和弹幕语境。",
    bilibiliUrl: bili("康神开播了"),
  },
  {
    slug: "zhanjie",
    title: "湛杰",
    keys: [
      "湛宇轩父亲",
      "湛宇轩爸爸",
      "湛宇轩严父",
      "湛宇轩的父亲",
      "湛宇轩的爸爸",
      "湛宇轩的严父",
    ],
    summary: "湛宇轩的严父",
    detail: "一个极简、威严的页面。",
    bilibiliUrl: null,
    special: "zhanjie",
  },
];

export function findMemeBySlug(slug: string): Meme | undefined {
  return memes.find((meme) => meme.slug === slug);
}

export function findExactMeme(input: string): Meme | null {
  const query = input.trim().toLowerCase();
  if (!query) return null;
  return (
    memes.find((meme) =>
      meme.keys.some((key) => key.toLowerCase() === query),
    ) ?? null
  );
}
