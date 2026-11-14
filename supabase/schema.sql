-- =========================================================
-- AWAsakiko的资料站 · 用户 / 管理员双会话 RBAC
-- 在 Supabase SQL Editor 执行（可重复执行）
-- =========================================================

create extension if not exists pgcrypto;

-- 普通用户（一个联系方式只能绑定一个昵称，昵称绑定后不可修改）
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  contact text not null unique,
  nickname text not null,
  created_at timestamptz not null default now()
);

-- 帖子表（新结构：只关联 user_id）
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  image_url text,
  created_at timestamptz not null default now(),
  hidden boolean not null default false
);

-- 回复表（新结构：只关联 user_id）
create table if not exists public.replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- ---------- 旧库迁移：补 user_id ----------
alter table public.posts add column if not exists user_id uuid;
alter table public.replies add column if not exists user_id uuid;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'posts' and column_name = 'contact'
  ) then
    insert into public.users (contact, nickname)
    select contact, nickname from (
      select distinct on (contact) contact, nickname
      from public.posts
      where contact is not null
      order by contact, created_at desc
    ) s
    on conflict (contact) do nothing;

    update public.posts p
    set user_id = u.id
    from public.users u
    where p.contact = u.contact and p.user_id is null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'replies' and column_name = 'contact'
  ) then
    insert into public.users (contact, nickname)
    select contact, nickname from (
      select distinct on (contact) contact, nickname
      from public.replies
      where contact is not null
      order by contact, created_at desc
    ) s
    on conflict (contact) do nothing;

    update public.replies r
    set user_id = u.id
    from public.users u
    where r.contact = u.contact and r.user_id is null;
  end if;
end $$;

-- 没有空值时收紧为 NOT NULL
do $$
begin
  if not exists (select 1 from public.posts where user_id is null) then
    alter table public.posts alter column user_id set not null;
  end if;
  if not exists (select 1 from public.replies where user_id is null) then
    alter table public.replies alter column user_id set not null;
  end if;
end $$;

-- 外键（不存在才添加）
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'posts_user_id_fkey') then
    alter table public.posts
      add constraint posts_user_id_fkey
      foreign key (user_id) references public.users(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'replies_user_id_fkey') then
    alter table public.replies
      add constraint replies_user_id_fkey
      foreign key (user_id) references public.users(id) on delete cascade;
  end if;
end $$;

-- 删除旧字段（先备份，不可逆；已有数据已迁移到 users）
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'posts' and column_name = 'contact') then
    alter table public.posts drop column contact;
  end if;
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'posts' and column_name = 'nickname') then
    alter table public.posts drop column nickname;
  end if;

  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'replies' and column_name = 'contact') then
    alter table public.replies drop column contact;
  end if;
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'replies' and column_name = 'nickname') then
    alter table public.replies drop column nickname;
  end if;
end $$;

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_user_id_idx on public.posts (user_id);
create index if not exists replies_post_id_created_at_idx on public.replies (post_id, created_at asc);
create index if not exists replies_user_id_idx on public.replies (user_id);

-- 管理员密钥（id、密钥、状态、创建时间）
create table if not exists public.admin_keys (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

alter table public.admin_keys add column if not exists status text not null default 'active';

-- RLS：不开放 anon 策略，服务端使用 service_role
alter table public.users enable row level security;
alter table public.posts enable row level security;
alter table public.replies enable row level security;
alter table public.admin_keys enable row level security;

drop policy if exists "no anon access users" on public.users;
drop policy if exists "no anon access posts" on public.posts;
drop policy if exists "no anon access replies" on public.replies;
drop policy if exists "no anon access admin_keys" on public.admin_keys;

-- Storage：公开桶 forum_images
insert into storage.buckets (id, name, public)
values ('forum_images', 'forum_images', true)
on conflict (id) do nothing;
