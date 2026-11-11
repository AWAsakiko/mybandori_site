# 邦多利角色资料站（BanG Dream! Fan Archive）

粉丝向 BanG Dream!（邦多利）角色资料图鉴。
9 支乐队、45 名角色：资料页、乐队视图、搜索筛选、队员小故事。

## 功能

- 首页：乐队入口、角色预览、小故事预览
- 角色列表 `/characters`：按乐队 / 学校 / 年级 / 应援色筛选；按姓名 / 日文名 / 罗马音 / 声优搜索
- 角色详情 `/characters/[id]`：立绘、日文名、罗马音、担当、身高、生日、星座、学校、年级、声优、应援色、简介、相关小故事
- 乐队总览 `/bands` 与乐队详情 `/bands/[slug]`：乐队主题色标识
- 小故事 `/stories`：队员之间的趣事与关系片段（标注来源）
- 关于 `/about`：数据来源、完整度、版权说明
- SEO：`/sitemap.xml`（59 条 URL）、`/robots.txt`、Open Graph 元信息
- 404 页面

## 数据完整度（当前）

| 字段 | 覆盖 |
| --- | --- |
| 担当、简介 | 45/45 |
| 声优 | 45/45 |
| 日文原名 | 45/45 |
| 生日、星座 | 43/45（2 人争议待核对） |
| 成员应援色 | 25/45 |
| 身高 | 38/45 |
| 学校 | 42/45 |
| 年级 | 19/45 |

未查到或未核实的字段显示「资料核对中」，不做猜测。

## 数据来源

- 姓名、罗马音、担当、声优：biligame《BanG Dream!》WIKI「角色CV」页
- 生日、星座、身高：biligame 角色页 + 互动百科（baike.com）
- 日文原名、简介、小故事：萌娘百科角色页提取文本后重新整理
- 乐队主题色 / 成员应援色：biligame WIKI「乐队名及应援色参考」；Morfonica / MyGO / Ave Mujica / RAS 乐队色来自萌娘百科乐队页
- 角色立绘：萌娘百科文件页

## 部署

拖拽部署（零命令行）：见根目录「Vercel部署指南.md」。

## 论坛（Supabase + RBAC）

- 页面：`/forum`（发帖 / 看帖）、`/admin`（站主管理后台，仅站主可见）
- 角色：游客（默认）、管理员（凭站主发放的密钥）、站主（凭 `OWNER_PASSWORD`）
- 登录：独立页面 `/login`，输入站主密码或管理员密钥；登录态保存在 **HttpOnly Cookie**（HMAC 签名），浏览器脚本无法读取。
- 「记住我」：勾选后 Cookie 有效期 15 天；不勾选为会话 Cookie，关闭浏览器即失效。
- 安全模型：所有写操作（删帖、发图、密钥管理）都在服务端校验 Cookie 会话；游客的 GET 请求在服务端强制剥离联系方式字段。
- 隐藏入口：页脚版权文字连续点击 5 次 → 弹出「管理员激活 / 站主登录」。
- 限流：同一设备 localStorage 1 分钟 1 条 + 服务端按联系方式 60 秒 1 条双保险。

### 初始化 Supabase

1. 在 Supabase SQL Editor 执行 [`supabase/schema.sql`](supabase/schema.sql)（建表 + 开启 RLS + 创建 `forum_images` 公开桶）。
2. 如桶未创建：Storage → New bucket → 名称 `forum_images` → 勾选 Public。
3. 环境变量（`.env.local` / Vercel）：

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # 服务端专用，切勿加 NEXT_PUBLIC_
OWNER_PASSWORD=...              # 站主登录密码
AUTH_SECRET=...                 # 令牌签名密钥（可选，缺省回退 OWNER_PASSWORD）
```

> `SUPABASE_SERVICE_ROLE_KEY` 只允许出现在服务端环境变量中，绝不能暴露到浏览器。

## 技术栈

Next.js 15（App Router）· TypeScript · Tailwind CSS v4 · Supabase（论坛数据与图片）· 静态 JSON 数据（角色资料）

## 目录结构

```
bandori-guide/
├─ app/
│  ├─ layout.tsx / page.tsx / not-found.tsx / globals.css
│  ├─ characters/page.tsx + [id]/page.tsx
│  ├─ bands/page.tsx + [slug]/page.tsx
│  ├─ stories/page.tsx
│  └─ about/page.tsx
├─ components/
│  ├─ site-nav.tsx
│  ├─ character-card.tsx
│  └─ character-explorer.tsx   # 客户端搜索 + 筛选
├─ lib/data.ts                 # 类型与数据读取
├─ data/
│  ├─ bands.json / characters.json / stories.json
└─ public/images/characters/   # 角色立绘
```

## 本地运行

需要 Node.js 18.18+（推荐 20 / 22 LTS）。

```powershell
cd "E:\Web Design\bandori-guide"
pnpm install
pnpm dev
```

打开 http://localhost:3000

生产构建：

```powershell
pnpm build
pnpm start
```

## 素材与版权

- 角色立绘来自萌娘百科文件页，仅用于非商业粉丝站展示
- 角色与乐队版权归 BanG Dream! 企划方（Bushiroad / Craft Egg 等）所有
- 本站与企划方无隶属关系；如版权方要求，会配合下架
- 小故事只保留可查证的互动，避免 OOC
- 新增数据采用 3 源交叉验证：同一数值需在 ≥3 个不同网站一致；冲突留空显示「争议待核对」
- 核验记录：`assets/raw/verification_report.json`（含每条数据的来源链接、候选值与状态）
- 本轮通过博查 Web Search API 检索 45 人资料并进行 3 源交叉验证

## 待办

1. 继续补全：17 人缺生日、20 人缺应援色、22 人缺身高、年级覆盖不足
2. 卡面 / 立绘多图展示模块
3. 部署到 Vercel（`.env.example` 中设置 `NEXT_PUBLIC_SITE_URL`）
