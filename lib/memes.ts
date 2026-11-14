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
      "源自日本网络亚文化中的数字谐音梗（与「淫梦」相关），因读法被中文互联网大量恶搞，常出现在弹幕、评论区与表情包中。该梗带有明显的低俗与冒犯性，不适合在正式场合使用，也不建议继续传播。",
    bilibiliUrl: bili("114514"),
  },
  {
    slug: "1919810",
    title: "1919810",
    keys: ["1919810"],
    summary: "与 114514 同源的数字梗",
    detail:
      "与 114514 属于同一套网络恶搞语境，常成对出现。它同样来自数字谐音与二次创作，带有低俗色彩；了解其来源即可，不建议模仿或在不合适的场合使用。",
    bilibiliUrl: bili("1919810"),
  },
  {
    slug: "325",
    title: "325",
    keys: ["325"],
    summary: "明日方舟 UP 主 Zc 的数字梗",
    detail:
      "与明日方舟 UP 主「魔法Zc目录」（Zc）相关的数字梗。325 这个数字在 Zc 的直播、肉鸽和线下活动里反复出现——比如 325 源石锭、嘉年华抽到 325 号、3 月 25 日下午 3:25 发布视频等，久而久之成了观众熟悉的固定梗。不同切片里的具体语境略有差别。",
    bilibiliUrl: "https://www.bilibili.com/video/BV1GkosY6EGp",
  },
  {
    slug: "947",
    title: "947",
    keys: ["947"],
    summary: "邦邦「查卡 947」邪神卡面梗",
    detail:
      "《BanG Dream! 少女乐团派对》的卡牌编号梗：947 号卡是冰川日菜（Pastel*Palettes）的「日菜抽中的大奖」，因卡面画风过于诡异，被玩家戏称为「邪神」「947 警告」。后来「查卡 947」也成了邦邦社区看卡面、整活的固定梗。",
    bilibiliUrl: "https://www.bilibili.com/video/BV1UkgV67EU7",
  },
  {
    slug: "kskbl",
    title: "kskbl",
    keys: ["kskbl"],
    summary: "《无畏契约》主播康神开播了",
    detail:
      "《无畏契约》电竞圈的拼音缩写梗，全称「康神开播了」，用来调侃或提醒主播 zmjjkk（康康）开播。起因是表哥直播时弹幕疯狂刷「康神开播了」，他点进康康直播间看到对方在卖萌/整活，表情管理失控的切片爆火，之后 kskbl 成了圈内接头暗号；常见搭配还有 zdjd（真的假的）、wkzkbl（我靠真开播了）。",
    bilibiliUrl: bili("kskbl"),
  },
  {
    slug: "233",
    title: "233",
    keys: ["233"],
    summary: "早期论坛的笑声代码",
    detail:
      "源自早期中文论坛（如猫扑）的表情编号，后来演变为「大笑」的代称。B站弹幕里也常见「233」「2333」，数字越多表示笑得越厉害。",
    bilibiliUrl: bili("233 梗"),
  },
  {
    slug: "awsl",
    title: "awsl",
    keys: ["awsl", "啊我死了"],
    summary: "「啊我死了」的缩写",
    detail:
      "「啊我死了」的拼音首字母缩写，用来表达被可爱、震撼或感动到「承受不住」的心情。常见于追星、二次元和弹幕语境。",
    bilibiliUrl: bili("awsl"),
  },
  {
    slug: "yyds",
    title: "yyds",
    keys: ["yyds", "永远的神"],
    summary: "「永远的神」的缩写",
    detail:
      "「永远的神」的拼音首字母缩写，用来高度称赞某人或某事物。电竞、直播和二次元社群都很常见，属于比较通用的网络夸赞用语。",
    bilibiliUrl: bili("yyds"),
  },
  {
    slug: "orz",
    title: "orz",
    keys: ["orz"],
    summary: "失意体前屈",
    detail:
      "由一个低头跪地的小人形状组成的颜文字，表示沮丧、跪拜或「服了」。常写作「Orz」「orz」，是早期互联网流传至今的经典表情。",
    bilibiliUrl: bili("orz 梗"),
  },
  {
    slug: "666",
    title: "666",
    keys: ["666"],
    summary: "「溜溜溜」的谐音夸赞",
    detail:
      "谐音「溜溜溜」，表示「厉害」「操作很顺」。常见于游戏、直播和弹幕，用来夸奖精彩操作或表达佩服。",
    bilibiliUrl: bili("666 梗"),
  },
  {
    slug: "pofang",
    title: "破防",
    keys: ["破防"],
    summary: "心理防线被突破",
    detail:
      "原指游戏中的防御被打破，后来引申为心理防线被突破，表示被戳中、被感动或情绪崩溃。常见于评论区、弹幕和社交媒体。",
    bilibiliUrl: bili("破防 梗"),
  },
  {
    slug: "doge",
    title: "doge",
    keys: ["doge", "柴犬"],
    summary: "柴犬表情包",
    detail:
      "以柴犬（神烦狗）为原型的表情包，常用来表示调侃、反讽或「你懂的」。在中文互联网和 B站评论区非常常见。",
    bilibiliUrl: bili("doge 表情包"),
  },
  {
    slug: "cao",
    title: "草",
    keys: ["草", "www", "wwww"],
    summary: "表示好笑 / 无语",
    detail:
      "源自日语「草（くさ）」，因为「笑」的日文发音（warau）首字母 W 连起来像草丛，后来用「草」表示好笑。中文互联网也用它表达好笑、无语或吐槽。",
    bilibiliUrl: bili("草 梗"),
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
