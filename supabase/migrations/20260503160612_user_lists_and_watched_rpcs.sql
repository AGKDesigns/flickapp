-- User-subscribed lists + watched-event RPCs.

-- =========================================================================
-- lists.is_default — flag for lists auto-added to new users
-- =========================================================================
alter table public.lists
  add column is_default boolean not null default false;

-- =========================================================================
-- user_lists — which curated/sponsor lists a user has added to their library
-- =========================================================================
create table public.user_lists (
  user_id uuid not null references auth.users(id) on delete cascade,
  list_id uuid not null references public.lists(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (user_id, list_id)
);

create index user_lists_user_recent_idx on public.user_lists (user_id, added_at desc);

alter table public.user_lists enable row level security;

create policy "user_lists select own"
  on public.user_lists for select
  using (user_id = auth.uid());

create policy "user_lists insert own"
  on public.user_lists for insert
  with check (user_id = auth.uid());

create policy "user_lists delete own"
  on public.user_lists for delete
  using (user_id = auth.uid());

-- =========================================================================
-- Trigger: auto-add default lists on user signup (extends profile trigger)
-- =========================================================================
create or replace function public.handle_new_user_default_lists()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_lists (user_id, list_id)
  select new.id, l.id
  from public.lists l
  where l.is_default = true
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_default_lists on auth.users;
create trigger on_auth_user_created_default_lists
  after insert on auth.users
  for each row execute function public.handle_new_user_default_lists();

-- =========================================================================
-- RPC: mark_movie_watched — upsert TMDB movie cache + insert watch_event
-- =========================================================================
create or replace function public.mark_movie_watched(
  p_tmdb_id bigint,
  p_title text,
  p_poster_path text default null,
  p_backdrop_path text default null,
  p_release_year int default null,
  p_vote_average numeric default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  insert into public.movies (
    tmdb_id, title, poster_path, backdrop_path, release_year, vote_average
  )
  values (
    p_tmdb_id, p_title, p_poster_path, p_backdrop_path, p_release_year, p_vote_average
  )
  on conflict (tmdb_id) do update set
    title = excluded.title,
    poster_path = coalesce(excluded.poster_path, public.movies.poster_path),
    backdrop_path = coalesce(excluded.backdrop_path, public.movies.backdrop_path),
    release_year = coalesce(excluded.release_year, public.movies.release_year),
    vote_average = coalesce(excluded.vote_average, public.movies.vote_average),
    cached_at = now();

  insert into public.watch_events (user_id, movie_id)
  values (auth.uid(), p_tmdb_id)
  returning id into v_event_id;

  return v_event_id;
end;
$$;

-- =========================================================================
-- RPC: unmark_movie_watched — delete all watch events for this user+movie
-- =========================================================================
create or replace function public.unmark_movie_watched(p_tmdb_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  delete from public.watch_events
  where user_id = auth.uid() and movie_id = p_tmdb_id;
end;
$$;

-- =========================================================================
-- RPC: user_list_progress — watched count per list for the current user
-- =========================================================================
create or replace function public.user_list_progress()
returns table (list_id uuid, watched_count bigint)
language sql
security definer
stable
set search_path = public
as $$
  select li.list_id, count(distinct we.movie_id)::bigint
  from public.list_items li
  join public.watch_events we
    on we.movie_id = li.movie_id
   and we.user_id = auth.uid()
  group by li.list_id;
$$;

-- =========================================================================
-- Grants — explicit so RPCs are reachable from the publishable key
-- =========================================================================
grant execute on function public.mark_movie_watched(bigint, text, text, text, int, numeric) to authenticated;
grant execute on function public.unmark_movie_watched(bigint) to authenticated;
grant execute on function public.user_list_progress() to authenticated;
