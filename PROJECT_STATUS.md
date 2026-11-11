# 项目状态（2026-11-10 暂停点）

## Git 仓库

- 远程：https://github.com/AWAsakiko/mybandori_site
- 分支：`main`（已推送，提交 `b3c5d71`）
- 后续推送后 Vercel 可自动部署

## 一句话总结

**代码已完成，本地因网络限制无法连接 Supabase，尚未做真实数据库联调。**
下一步：把新的 `deploy.zip` 上传到 Vercel，配置 4 个环境变量（URL、Anon Key、Secret Key、Owner Password），然后进行线上测试。

---

## 已完成

### 角色资料站
- 45 名角色 / 9 支乐队 / 14 篇小故事
- 搜索（中文名、日文名、罗马音、声优、乐队）与筛选（乐队、学校、年级、应援色）
- 角色详情、乐队主题色、响应式布局、SEO（sitemap / robots / OpenGraph）
- 生日 43/45、应援色 39/45、身高 38/45；无来源字段显示「? 暂无可靠来源」，1–2 源数据带「参考」角标

### 论坛（RBAC）
- 三种角色：游客（默认）、管理员、站主
- 游客：发帖（手机号/邮箱格式校验 + 同设备 1 分钟限流）、看帖（服务端强制剥离联系方式）
- 管理员：看联系方式、软删除帖子、上传图片（Supabase Storage）
- 站主：拥有管理员全部权限 + 管理后台（生成 / 复制 / 作废管理员密钥）
- 隐藏入口：页脚版权文字**连续点击 5 次** → 管理员激活 / 站主登录
- 安全：服务端 HMAC 签名 token，篡改 `localStorage` 的 role 无效；`service_role` 密钥仅存在于服务端环境变量
- API：`/api/auth/admin`、`/api/auth/owner`、`/api/posts`、`/api/posts/[id]`、`/api/upload`、`/api/admin/keys`、`/api/admin/keys/[id]`

### Supabase
- 建表 SQL 已在 Supabase 成功执行（`posts`、`admin_keys`）
- Storage 公开桶 `forum_images` 已创建

### 构建
- `pnpm build` 通过：**24 个页面**，`EXIT=0`，TypeScript 无报错

---

## 当前阻塞

本机网络访问 `https://lnpfrjqezutfaddelbkr.supabase.co` 时 TLS 连接被重置（DNS 正常，`supabase.com` 主站可通），
因此本地无法完成真实的发帖 / 删帖 / 上传联调；`GET /api/posts` 会返回：

```
无法连接 Supabase，请检查网络或 NEXT_PUBLIC_SUPABASE_URL
```

这是网络环境问题，不是代码问题；Vercel 服务器网络正常。

---

## 下一步（在 Vercel 上完成）

1. 打开 https://vercel.com/new ，选择 **Import Git Repository**，导入 `AWAsakiko/mybandori_site`（以后每次 push 自动部署）。

   > 环境变量可手动添加，或运行 `scripts/setup-vercel-env.ps1` 一键写入（见 `scripts/使用说明.md`）。
2. 在 Vercel 项目 → **Settings → Environment Variables** 配置 4 个变量：

| 变量 | 说明 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://lnpfrjqezutfaddelbkr.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 的 publishable / anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 的 secret / service_role key（机密，仅服务端） |
| `OWNER_PASSWORD` | 站主登录密码（自行设置强密码） |

> 可选：`AUTH_SECRET`（令牌签名密钥）。不配置时会回退使用 `OWNER_PASSWORD`；
> 建议配置一个随机长字符串，并与本地 `.env.local` 保持一致。

3. 保存后执行 **Redeploy**，让环境变量生效。
4. 线上测试清单：
   - [ ] `/forum` 打开正常，显示空列表或已有帖子
   - [ ] 游客发帖成功；刷新后帖子只显示昵称和内容，**看不到联系方式**
   - [ ] 页脚版权连点 5 次 → 站主登录（`OWNER_PASSWORD`）
   - [ ] 导航出现「管理后台」→ 生成管理员密钥并复制
   - [ ] 无痕窗口连点 5 次 → 管理员激活（密钥）→ 能看到联系方式、删除按钮、上传图片
   - [ ] 管理员发图 → 图片正常显示
   - [ ] 站主后台作废密钥 → 该管理员立即失效

---

## 本地注意事项

- `.env.local` 已加入 `.gitignore`，且 **不会进入 deploy.zip**
- 本地 `.env.local` 中的 `OWNER_PASSWORD` 仍是占位符 `CHANGE_ME_OWNER_PASSWORD`，登录会被拒绝（401）——线上务必配置真实密码
- 本次 secret key 曾在聊天中出现，建议上线验证完成后到 Supabase → API Keys 轮换一次，并同步更新 `.env.local` 和 Vercel
- 本项目未使用 Git；`deploy.zip` 即完整源码包

---

## 关键文件

| 文件 | 说明 |
|---|---|
| `deploy.zip` | 可拖拽部署的完整源码包 |
| `supabase/schema.sql` | 论坛建表 / RLS / Storage 桶 SQL（已执行） |
| `Vercel部署指南.md` | 零命令行部署教程 |
| `README.md` | 项目说明、论坛配置、本地运行 |
| `.env.example` | 环境变量模板 |
| `data/characters.json` | 45 名角色数据 |
