-- ============================================================
--  执念 · Supabase 建表脚本
--  用法：Supabase 控制台 → SQL Editor → New query → 粘贴全部 → Run
--  重复执行是安全的（幂等）
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- 执念 ----------
create table if not exists public.obsessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  title         text not null check (char_length(title) between 1 and 80),
  note          text not null default '' check (char_length(note) <= 600),
  category      text not null default '事' check (category in ('人', '事', '物', '念')),
  intensity     smallint not null default 3 check (intensity between 1 and 5),
  accent        text not null default 'ember',
  status        text not null default 'active' check (status in ('active', 'fulfilled', 'released')),
  closing_note  text not null default '' check (char_length(closing_note) <= 600),
  created_at    timestamptz not null default now(),
  resolved_at   timestamptz
);

-- ---------- 每次「又想起一次」 ----------
create table if not exists public.thoughts (
  id            uuid primary key default gen_random_uuid(),
  obsession_id  uuid not null references public.obsessions (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  mood          text not null default '平静' check (mood in ('不甘', '温柔', '钝痛', '焦躁', '平静')),
  note          text not null default '' check (char_length(note) <= 600),
  created_at    timestamptz not null default now()
);

create index if not exists obsessions_user_idx on public.obsessions (user_id, created_at desc);
create index if not exists obsessions_status_idx on public.obsessions (user_id, status);
create index if not exists thoughts_user_idx on public.thoughts (user_id, created_at desc);
create index if not exists thoughts_obsession_idx on public.thoughts (obsession_id, created_at desc);

-- ---------- 行级权限：只能碰自己的数据 ----------
alter table public.obsessions enable row level security;
alter table public.thoughts   enable row level security;

drop policy if exists "own obsessions read"   on public.obsessions;
drop policy if exists "own obsessions write"  on public.obsessions;
drop policy if exists "own obsessions update" on public.obsessions;
drop policy if exists "own obsessions delete" on public.obsessions;
drop policy if exists "own thoughts read"     on public.thoughts;
drop policy if exists "own thoughts write"    on public.thoughts;
drop policy if exists "own thoughts delete"   on public.thoughts;

create policy "own obsessions read" on public.obsessions
  for select using (auth.uid() = user_id);

create policy "own obsessions write" on public.obsessions
  for insert with check (auth.uid() = user_id);

create policy "own obsessions update" on public.obsessions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own obsessions delete" on public.obsessions
  for delete using (auth.uid() = user_id);

create policy "own thoughts read" on public.thoughts
  for select using (auth.uid() = user_id);

create policy "own thoughts write" on public.thoughts
  for insert with check (auth.uid() = user_id);

create policy "own thoughts delete" on public.thoughts
  for delete using (auth.uid() = user_id);

-- ---------- 权限授予 ----------
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.obsessions to authenticated;
grant select, insert, update, delete on public.thoughts   to authenticated;
