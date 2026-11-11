export const metadata = {
  title: "关于",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">关于本站</h1>
        <p className="leading-relaxed text-slate-600">
          AWAsakiko的资料站目前以 BanG Dream!（邦多利）角色资料为主，收录 9 支乐队、45 名角色的
          资料与队员之间的小故事。
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">数据来源</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-600">
          <li>角色基础资料（姓名、罗马音、担当、声优）：biligame《BanG Dream!》WIKI「角色CV」页</li>
          <li>生日、星座、身高等：biligame 角色页 + 互动百科（baike.com）角色条目</li>
          <li>日文原名、角色简介、小故事：萌娘百科角色页（提取文本后重新整理）</li>
          <li>乐队主题色与成员应援色：biligame WIKI「乐队名及应援色参考」</li>
          <li>Morfonica 成员学校：依据萌娘百科「Morfonica」乐队页「由月之森女子学园的同班同学结成」的记载</li>
          <li>角色立绘：萌娘百科文件页</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">数据完整度（MVP）</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-600">
          <li>45/45：担当、简介、声优、日文原名</li>
          <li>44/45：罗马音（祐天寺若麦暂缺）</li>
          <li>43/45：生日、星座（长崎爽世、MASKING 显示「争议待核对」）</li>
          <li>39/45：成员应援色；38/45：身高（带「参考」角标的为 1–2 个来源）</li>
          <li>42/45：现就读学校；19/45：年级（不同作品时间线口径不同，见下方说明）</li>
        </ul>
        <p className="text-xs leading-relaxed text-slate-500">
          未查到来源的字段显示灰色「？」图标与「暂无可靠来源」（悬停提示「官方未公开」）；带「参考」角标的数值为 1–2 个来源的参考值。我们不做猜测；
          不同作品时间线下的年级也会有出入，遇到冲突时以可查证的资料为准。
        </p>
      </section>

      
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">数据核验（3 源交叉验证）</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          新增数据采用「同一数值至少在 3 个不同网站的页面中一致」的规则；互相矛盾的数值不写入，页面显示「争议待核对」；
          不足 3 个来源的字段保持空白。
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-600">
          <li>3 源核验写入生日：桐谷透子 12月16日 · 二叶筑紫 9月15日 · 八潮瑠唯 11月19日 · 椎名立希 8月9日 · 丰川祥子 2月14日 · 八幡海铃 4月7日 · 仓田真白 2月19日 · 高松灯 11月22日 · 千早爱音 9月8日 · 要乐奈 2月22日 · 三角初华 6月26日 · 若叶睦 1月14日</li>
          <li>参考写入（1–2 源，页面带「参考」角标）：LAYER 1月13日 · 广町七深 6月16日 · 祐天寺若麦 6月1日；身高 15 条、应援色 14 条（含日文检索补充：八潮瑠唯 169cm、LOCK #AAEE22）；日文名/罗马音/声优少量</li>
          <li>争议待核对（未写入）：长崎爽世（5月27日 / 6月3日）、MASKING（5月11日 / 5月12日）</li>
          <li>仍未找到来源：身高 7 人（大和麻弥、若宫伊芙、LAYER、LOCK、MASKING、椎名立希、祐天寺若麦）；应援色 6 人（LAYER、MASKING、PAREO、CHU²、千早爱音、椎名立希）；RAS 3 人学校（MASKING / PAREO / CHU²）；年级 26 人</li>
        </ul>
        <p className="text-xs leading-relaxed text-slate-500">
          页面中带 <sup className="text-[10px] text-amber-500">参考</sup> 角标的数值表示其来源为 1–2 个网站（不足 3 个），
          仅供参考；悬停角标可查看当前来源数量。争议数值不写入，详情页显示「争议待核对」。
        </p>
      </section>

<section className="space-y-3">
        <h2 className="text-lg font-semibold">素材与版权</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-600">
          <li>
            角色立绘来自萌娘百科文件页，仅用于非商业粉丝站展示；角色与乐队版权归
            BanG Dream! 企划方（Bushiroad / Craft Egg 等）所有。
          </li>
          <li>本站与企划方无隶属关系；如版权方提出要求，会配合下架相关内容。</li>
          <li>小故事仅保留可查证的互动，尽量不添加主观演绎，避免角色 OOC。</li>
        </ul>
      </section>
    </div>
  );
}
