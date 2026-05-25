-- Compass: initial schema
-- Run this in Supabase SQL editor or via supabase db push

-- ── Categories ─────────────────────────────────────────────────────────────
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  name        text not null,
  color       text not null,
  icon        text,
  sort_order  integer default 0,
  created_at  timestamptz default now(),
  unique (user_id, name)
);

alter table categories enable row level security;

drop policy if exists "owner access" on categories;
create policy "owner access" on categories
  for all using (auth.uid() = user_id);

-- ── Entries ────────────────────────────────────────────────────────────────
create table if not exists entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null,
  entry_date  date not null default current_date,
  category    text not null,
  title       text not null,
  body        text not null,
  tags        text[] default '{}',
  mood        smallint check (mood between 1 and 10),
  is_pinned   boolean default false
);

alter table entries enable row level security;

drop policy if exists "owner access" on entries;
create policy "owner access" on entries
  for all using (auth.uid() = user_id);

-- ── Indexes ────────────────────────────────────────────────────────────────
create index if not exists entries_user_date
  on entries (user_id, entry_date desc);

create index if not exists entries_user_category_date
  on entries (user_id, category, entry_date desc);

create index if not exists entries_tags_gin
  on entries using gin (tags);

-- Full-text search: combined tsvector over title + body
create index if not exists entries_fts
  on entries using gin (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, ''))
  );

-- Auto-update updated_at on every row change
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists entries_updated_at on entries;
create trigger entries_updated_at
  before update on entries
  for each row execute procedure touch_updated_at();

-- ── Seed categories (run once, replace <USER_ID> with your auth.uid()) ─────
-- insert into categories (user_id, name, color, icon, sort_order) values
--   ('<USER_ID>', 'Religion',  '#a78bfa', 'BookOpen',      0),
--   ('<USER_ID>', 'Logistics', '#60a5fa', 'Truck',         1),
--   ('<USER_ID>', 'Mindset',   '#34d399', 'Brain',         2),
--   ('<USER_ID>', 'Knowledge', '#fbbf24', 'GraduationCap', 3),
--   ('<USER_ID>', 'Gym',       '#f87171', 'Dumbbell',      4),
--   ('<USER_ID>', 'Finance',   '#4ade80', 'Wallet',        5),
--   ('<USER_ID>', 'Family',    '#fb923c', 'Users',         6),
--   ('<USER_ID>', 'Health',    '#38bdf8', 'Heart',         7);
