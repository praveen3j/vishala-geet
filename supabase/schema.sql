create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  email text primary key,
  display_name text not null,
  created_at timestamptz not null default now()
);

insert into public.admin_users (email, display_name)
values
  ('praveenjav@outlook.com', 'Praveen'),
  ('vishala1966@gmail.com', 'Vishala')
on conflict (email) do update set display_name = excluded.display_name;

alter table public.admin_users enable row level security;

create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  book text not null,
  name text not null,
  page text not null,
  aliases text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists songs_set_updated_at on public.songs;
create trigger songs_set_updated_at
before update on public.songs
for each row
execute function public.set_updated_at();

create or replace function public.is_song_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

alter table public.songs enable row level security;

drop policy if exists "Anyone can read songs" on public.songs;
create policy "Anyone can read songs"
on public.songs for select
using (true);

drop policy if exists "Admins can insert songs" on public.songs;
create policy "Admins can insert songs"
on public.songs for insert
with check (public.is_song_admin());

drop policy if exists "Admins can update songs" on public.songs;
create policy "Admins can update songs"
on public.songs for update
using (public.is_song_admin())
with check (public.is_song_admin());

drop policy if exists "Admins can delete songs" on public.songs;
create policy "Admins can delete songs"
on public.songs for delete
using (public.is_song_admin());

create index if not exists songs_book_page_idx on public.songs (book, page);
create index if not exists songs_name_idx on public.songs (name);
