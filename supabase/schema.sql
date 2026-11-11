-- =========================================================
-- AWAsakiko的资料站 · 论坛 RBAC 数据库（Supabase SQL Editor 执行）
-- =========================================================

create extension if not exists pgcrypto;

-- 帖子表（联系方式、昵称、内容、图片 URL、创建时间、是否隐藏）
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  contact text not null,
  nickname text not null,
  content text not null,
  image_url text,
  created_at timestamptz not null default now(),
  hidden boolean not null default false
);

-- 兼容旧表：缺列时补齐
alter table public.posts add column if not exists contact text;
alter table public.posts add column if not exists nickname text;
alter table public.posts add column if not exists content text;
alter table public.posts add column if not exists image_url text;
alter table public.posts add column if not exists created_at timestamptz default now();
alter table public.posts add column if not exists hidden boolean default false;

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_contact_idx on public.posts (contact);

-- 管理员密钥（id、密钥、状态、创建时间）
create table if not exists public.admin_keys (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

-- 兼容旧表：补 status 列（已有密钥自动视为 active）
alter table public.admin_keys add column if not exists status text not null default 'active';

-- RLS：不创建 anon 策略，游客无法直接读写；服务端使用 service_role 绕过
alter table public.posts enable row level security;
alter table public.admin_keys enable row level security;

drop policy if exists "no anon access posts" on public.posts;
drop policy if exists "no anon access admin_keys" on public.admin_keys;

-- Storage：公开桶 forum_images（图片公开可读，上传仅服务端）
insert into storage.buckets (id, name, public)
values ('forum_images', 'forum_images', true)
on conflict (id) do nothing;
