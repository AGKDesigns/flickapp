-- FlickApp v1 schema
-- Profiles, movie cache, curated/user/sponsor lists, list items, raw watch events.

-- =========================================================================
-- profiles  (one row per auth.users, including anonymous users)
-- =========================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row when an auth user is created. Trigger function
-- runs with security definer so it can write into public.profiles even when
-- the row-level security policies wouldn't allow the just-created user yet.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================================
-- movies  (TMDB cache; full data lives at TMDB, this is just identity + display)
-- =========================================================================
create table public.movies (
  tmdb_id bigint primary key,
  title text not null,
  poster_path text,
  backdrop_path text,
  release_year int,
  vote_average numeric(3, 1),
  cached_at timestamptz not null default now()
);

create index movies_title_idx on public.movies using gin (to_tsvector('simple', title));

-- =========================================================================
-- lists  (curated, user-created, sponsor)
-- =========================================================================
create table public.lists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  type text not null check (type in ('curated', 'user', 'sponsor')),
  slug text unique,                    -- only set for curated/sponsor
  title text not null,
  description text,
  cover_image text,                    -- TMDB backdrop path or full URL
  source_url text,                     -- e.g. AFI page, used for attribution
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create index lists_type_public_idx on public.lists (type, is_public);
create index lists_owner_idx on public.lists (owner_id);

-- Curated/sponsor lists must have a slug; user lists may not.
alter table public.lists
  add constraint lists_slug_required_for_curated
  check (
    (type in ('curated', 'sponsor') and slug is not null)
    or (type = 'user' and slug is null)
  );

-- =========================================================================
-- list_items  (movies inside a list)
-- =========================================================================
create table public.list_items (
  list_id uuid not null references public.lists(id) on delete cascade,
  movie_id bigint not null references public.movies(tmdb_id),
  position int,
  added_at timestamptz not null default now(),
  primary key (list_id, movie_id)
);

create index list_items_list_position_idx on public.list_items (list_id, position);

-- =========================================================================
-- watch_events  (raw history; one row per watch — supports rewatches)
-- =========================================================================
create table public.watch_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  movie_id bigint not null references public.movies(tmdb_id),
  watched_at timestamptz not null default now()
);

create index watch_events_user_movie_idx on public.watch_events (user_id, movie_id);
create index watch_events_user_recent_idx on public.watch_events (user_id, watched_at desc);

-- =========================================================================
-- Row Level Security
-- =========================================================================
alter table public.profiles enable row level security;
alter table public.movies enable row level security;
alter table public.lists enable row level security;
alter table public.list_items enable row level security;
alter table public.watch_events enable row level security;

-- profiles: anyone can read; only owner can update/insert their own row
create policy "profiles select all"
  on public.profiles for select using (true);

create policy "profiles update own"
  on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "profiles insert own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- movies: read-only for clients; writes happen via the seed script (secret key)
-- or a server-side edge function (none yet).
create policy "movies select all"
  on public.movies for select using (true);

-- lists: visible if curated, sponsor, public, or owner. Writes only by owner.
create policy "lists select visible"
  on public.lists for select
  using (
    type in ('curated', 'sponsor')
    or is_public
    or owner_id = auth.uid()
  );

create policy "lists insert own user-list"
  on public.lists for insert
  with check (
    type = 'user' and owner_id = auth.uid()
  );

create policy "lists update own user-list"
  on public.lists for update
  using (type = 'user' and owner_id = auth.uid())
  with check (type = 'user' and owner_id = auth.uid());

create policy "lists delete own user-list"
  on public.lists for delete
  using (type = 'user' and owner_id = auth.uid());

-- list_items: visibility follows the parent list. Writes only on user-owned lists.
create policy "list_items select visible"
  on public.list_items for select
  using (
    exists (
      select 1 from public.lists l
      where l.id = list_id
        and (
          l.type in ('curated', 'sponsor')
          or l.is_public
          or l.owner_id = auth.uid()
        )
    )
  );

create policy "list_items write own user-list"
  on public.list_items for all
  using (
    exists (
      select 1 from public.lists l
      where l.id = list_id and l.type = 'user' and l.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.lists l
      where l.id = list_id and l.type = 'user' and l.owner_id = auth.uid()
    )
  );

-- watch_events: private by default. Owner reads/writes only.
create policy "watch_events select own"
  on public.watch_events for select
  using (user_id = auth.uid());

create policy "watch_events insert own"
  on public.watch_events for insert
  with check (user_id = auth.uid());

create policy "watch_events delete own"
  on public.watch_events for delete
  using (user_id = auth.uid());
