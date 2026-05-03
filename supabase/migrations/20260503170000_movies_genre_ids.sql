-- Add genre_ids array to the movies cache so vibe-based picks can filter
-- by TMDB genre regardless of which list a movie belongs to. GIN index for
-- fast overlap queries (genre_ids && '{27}' for "horror picks").
-- B-tree index on release_year for the decade vibes (e.g. Retro: 1980-1999).

alter table public.movies
  add column genre_ids int[] not null default '{}'::int[];

create index movies_genre_ids_gin_idx on public.movies using gin (genre_ids);
create index movies_release_year_idx on public.movies (release_year);

-- Update the watched-mark RPC to optionally accept genre_ids so movies that
-- enter the cache via "mark watched" also get categorised. Existing callers
-- still work — the new param has a default.
create or replace function public.mark_movie_watched(
  p_tmdb_id bigint,
  p_title text,
  p_poster_path text default null,
  p_backdrop_path text default null,
  p_release_year int default null,
  p_vote_average numeric default null,
  p_genre_ids int[] default '{}'::int[]
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
    tmdb_id, title, poster_path, backdrop_path, release_year, vote_average, genre_ids
  )
  values (
    p_tmdb_id, p_title, p_poster_path, p_backdrop_path, p_release_year, p_vote_average,
    coalesce(p_genre_ids, '{}'::int[])
  )
  on conflict (tmdb_id) do update set
    title = excluded.title,
    poster_path = coalesce(excluded.poster_path, public.movies.poster_path),
    backdrop_path = coalesce(excluded.backdrop_path, public.movies.backdrop_path),
    release_year = coalesce(excluded.release_year, public.movies.release_year),
    vote_average = coalesce(excluded.vote_average, public.movies.vote_average),
    genre_ids = case
      when array_length(excluded.genre_ids, 1) is null then public.movies.genre_ids
      else excluded.genre_ids
    end,
    cached_at = now();

  insert into public.watch_events (user_id, movie_id)
  values (auth.uid(), p_tmdb_id)
  returning id into v_event_id;

  return v_event_id;
end;
$$;

-- Drop the prior 6-arg signature so we don't leave two overloads of the same
-- function around (PostgREST would refuse to call without disambiguation).
drop function if exists public.mark_movie_watched(bigint, text, text, text, int, numeric);

grant execute on function public.mark_movie_watched(bigint, text, text, text, int, numeric, int[]) to authenticated;
