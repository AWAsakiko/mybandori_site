# Vercel 部署指南（零命令行版）

> 这一份指南写给「没有 Git 基础、不想敲命令」的你。
> 你只需要一个浏览器、一个 Vercel 账号，以及仓库根目录里的 `deploy.zip`。

---

## 一、准备三样东西

1. **deploy.zip**（就是本文件旁边的那个压缩包）
   - 它已经排除了 `node_modules`、`.next` 等大文件夹，体积很小。
   - 里面是**源码**，Vercel 会自动帮我们安装依赖、编译 Next.js。
2. **一个 Vercel 账号**（免费）
   - 打开 https://vercel.com/signup 注册，用 GitHub 账号或邮箱都行。
3. **能正常上网的浏览器**。

---

## 二、方案 A：Vercel Drop 拖拽上传（推荐，最简单）

Vercel 官方提供「Drop」拖拽部署入口（2026 年上线），**直接支持拖入 ZIP 压缩包**，不需要 Git、不需要命令行。参考官方说明：https://vercel.com/docs/drop

### 第 1 步：打开 Vercel Drop

在浏览器地址栏输入：

```
https://vercel.com/drop
```

如果提示登录，就点 **Log In / Sign Up**，用你的账号登录（免费 Hobby 计划即可，Vercel Drop 要求先登录再部署）。

### 第 2 步：把 deploy.zip 拖进去

- 把 `deploy.zip` 从文件夹里**直接拖到网页中间的虚线框/上传区域**（Vercel Drop 支持 ZIP 压缩包、文件夹或单个文件）。
- 拖入后页面会识别出这是一个 Next.js 项目，并显示项目名称（可以改成 `bandori-guide` 之类），点 **Deploy / 继续**。

### 第 3 步：等构建完成

- 页面会显示 `Building…`，正常需要 1–3 分钟。
- 看到 **Congratulations!** / **Your project is live** 就成功了。
- 点 **Visit** / 打开显示的 `https://xxxx.vercel.app` 网址，就是你的线上网站。

### 第 4 步（可选）：设置站点地址

部署成功后，建议设置一下站点地址，让 SEO 里的 sitemap 使用正式域名：

1. 进入项目 → **Settings** → **Environment Variables**；
2. 新增一条：`NEXT_PUBLIC_SITE_URL` = `https://你的域名.vercel.app`；
3. 回到 **Deployments**，点最新部署右侧的 **⋯ → Redeploy**。

---

## 三、方案 B：如果 Vercel Drop 不可用

可以改用 **Netlify Drop**（同样免费、支持直接拖 zip）：

1. 打开 https://app.netlify.com/drop
2. 把 `deploy.zip` 拖进去
3. 等 1–2 分钟，得到 `https://xxxx.netlify.app` 网址

> Netlify 会自动识别 Next.js 并构建。如果构建失败，优先检查 zip 里是否包含 `package.json`（在压缩包最外层）。

---

## 四、论坛功能（Supabase）配置

论坛（`/forum`）使用 Supabase 存储帖子与图片，部署后还需要做两件事：

### 1. 初始化数据库

打开 Supabase 项目 → **SQL Editor** → 新建查询 → 粘贴项目里 `supabase/schema.sql` 的全部内容 → 运行。

它会创建 `posts`、`admin_keys` 两张表，并确保 `forum_images` 公开桶存在。
（如果你已经在 Storage 里手动建好了 `forum_images` 公开桶，也仍然建议执行一次 SQL，确保表结构一致。）

### 2. 在 Vercel 配置环境变量

进入 Vercel 项目 → **Settings → Environment Variables**，添加：

| 变量名 | 说明 | 是否公开 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://你的项目.supabase.co` | 公开 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 的 publishable / anon key | 公开 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 的 service_role key（**机密**） | 仅服务端 |
| `OWNER_PASSWORD` | 站主登录密码（自己定一个强密码） | 仅服务端 |
| `AUTH_SECRET` | 令牌签名密钥（随机长字符串） | 仅服务端 |

保存后回到 **Deployments**，点最新部署右侧的 **⋯ → Redeploy**，让新环境变量生效。

### 3. 使用隐藏入口

- 打开网站，滚动到页脚，**连续点击版权文字 5 次**；
- 弹出窗口：
  - 「管理员激活」：输入站主发给你的管理员密钥；
  - 「站主登录」：输入 `OWNER_PASSWORD`；
- 站主登录后，导航栏会出现「管理后台」，可生成 / 复制 / 作废管理员密钥。

> 安全提醒：`SUPABASE_SERVICE_ROLE_KEY` 和 `OWNER_PASSWORD` 绝不能写进前端代码或公开仓库；
> 本项目已把 `.env.local` 加入 `.gitignore`。

---

## 五、常见问题

**Q1：上传后提示 Build failed（构建失败）怎么办？**
- 99% 的情况是压缩包结构不对：zip 最外层必须直接看到 `package.json`、`app` 文件夹，不能多套一层文件夹。
- 用本仓库提供的 `deploy.zip` 就一定是正确结构；如果是自己重新打包，记得**选中文件夹里的内容**再压缩。

**Q2：需要单独放图片吗？**
- 不需要。45 张立绘已经打包在 `public/images/characters/` 里，会随项目一起上传。

**Q3：为什么国内打开速度一般？**
- Vercel 的服务器在海外，国内访问可能偏慢。正式使用可以绑定自己的域名（Project → Settings → Domains），或后续迁移到国内平台。

**Q4：以后改了内容怎么更新？**
- Vercel Drop 每次拖拽都会创建一个**新的项目**（网址会变）。如果希望以后更新时网址不变，推荐把项目连接到 GitHub 仓库，之后推送代码即自动部署；
- 或者继续用小改动重新打包、重新拖拽，得到一个新网址。
- 如果你只是临时展示，重新拖拽新 zip 即可。

**Q5：免费额度够用吗？**
- 个人粉丝站用 Vercel 免费版（Hobby）完全够用；不绑定支付方式也能部署。

---

## 六、这个压缩包里有什么

```
deploy.zip
├─ app/              页面与路由（含 /forum、/admin、/api）
├─ components/       导航、角色卡片、筛选器、论坛与鉴权组件
├─ data/             45 名角色 / 9 支乐队 / 小故事 JSON
├─ lib/              数据类型、鉴权、Supabase 客户端
├─ supabase/schema.sql   论坛建表 SQL
├─ public/images/    45 张角色立绘
├─ package.json      依赖与脚本
├─ pnpm-lock.yaml    依赖锁定
├─ next.config.ts / tsconfig.json / postcss.config.mjs
├─ README.md
└─ Vercel部署指南.md（本文件）
```

> 注意：`deploy.zip` 不包含 `node_modules`、`.next`、`.env.local`，Vercel 会在云端重新安装与编译，这是正常的，也是推荐的。

---

祝部署顺利！部署成功后，把 `https://xxxx.vercel.app` 发给我，我可以继续帮你做线上验收。
