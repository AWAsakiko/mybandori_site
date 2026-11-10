-- =========================================================
-- 邦多利论坛 RBAC 数据库初始化（在 Supabase SQL Editor 中执行）
-- =========================================================

create extension if not exists pgcrypto;

-- 帖子表
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  contact text not null,                -- 手机号或邮箱（仅管理员可见，API 强制脱敏）
  nickname text not null,
  content text not null,
  image_url text,                       -- 可选图片
  created_at timestamptz not null default now(),
  hidden boolean not null default false -- 软删除标记
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_contact_idx on public.posts (contact);

-- 管理员密钥表（仅服务端 service_role 可访问）
create table if not exists public.admin_keys (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  created_at timestamptz not null default now()
);

-- 开启 RLS：不创建任何 anon 策略 => 游客无法直接读写；
-- 所有访问都通过 Next.js 服务端（service_role，绕过 RLS）完成。
alter table public.posts enable row level security;
alter table public.admin_keys enable row level security;

drop policy if exists "no anon access posts" on public.posts;
drop policy if exists "no anon access admin_keys" on public.admin_keys;

-- Storage：创建 public 桶 forum_images（图片公开可读，上传仅服务端）
insert into storage.buckets (id, name, public)
values ('forum_images', 'forum_images', true)
on conflict (id) do nothing;
