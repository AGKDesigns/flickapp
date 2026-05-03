/**
 * Seed script for curated lists. Run with the Supabase SECRET key (sb_secret_…)
 * passed in as an env var so it bypasses RLS:
 *
 *   SUPABASE_SECRET_KEY=sb_secret_... npx tsx scripts/seed-curated-lists.ts
 *
 * Reads EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_TMDB_READ_TOKEN from .env.
 * Idempotent — safe to re-run, will upsert movies + lists, replace list_items.
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const TMDB_BASE = "https://api.themoviedb.org/3";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const TMDB_TOKEN = process.env.EXPO_PUBLIC_TMDB_READ_TOKEN;

if (!SUPABASE_URL) throw new Error("Missing EXPO_PUBLIC_SUPABASE_URL in .env");
if (!SECRET_KEY) {
  throw new Error(
    "Missing SUPABASE_SECRET_KEY. Run with: SUPABASE_SECRET_KEY=sb_secret_... npx tsx scripts/seed-curated-lists.ts",
  );
}
if (!TMDB_TOKEN) throw new Error("Missing EXPO_PUBLIC_TMDB_READ_TOKEN in .env");

const supabase = createClient(SUPABASE_URL, SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// =========================================================================
// TMDB types + fetcher
// =========================================================================
type TMDBMovie = {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string | null;
  vote_average: number;
};

async function tmdb<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const qs = params
    ? "?" +
      Object.entries(params)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join("&")
    : "";
  const res = await fetch(`${TMDB_BASE}${path}${qs}`, {
    headers: { Authorization: `Bearer ${TMDB_TOKEN}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`TMDB ${res.status} on ${path}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

// =========================================================================
// List configs
// =========================================================================
type DiscoverParams = {
  with_genres?: string;
  primary_release_year?: number;
  "primary_release_date.gte"?: string;
  "primary_release_date.lte"?: string;
  sort_by?: string;
  "vote_count.gte"?: number;
};

type ListConfig = {
  slug: string;
  title: string;
  description: string;
  is_default?: boolean;
  source:
    | { kind: "topRated"; take: number }
    | { kind: "discover"; params: DiscoverParams; take: number; pages?: number }
    | { kind: "byIds"; ids: number[] };
};

// TMDB genre IDs (stable): 27=Horror, 35=Comedy, 28=Action, 18=Drama,
// 878=Sci-Fi, 53=Thriller, 10749=Romance, 99=Documentary, 16=Animation
function decadeDiscover(startYear: number): DiscoverParams {
  return {
    "primary_release_date.gte": `${startYear}-01-01`,
    "primary_release_date.lte": `${startYear + 9}-12-31`,
    sort_by: "vote_average.desc",
    "vote_count.gte": 500,
  };
}

function genreDiscover(id: string): DiscoverParams {
  return {
    with_genres: id,
    sort_by: "vote_average.desc",
    "vote_count.gte": 1500,
  };
}

const LISTS: ListConfig[] = [
  // ---- Defaults: auto-added to every new user's library ----
  {
    slug: "greatest-of-all-time",
    title: "Greatest of All Time",
    description:
      "TMDB's highest-rated films of all time, weighted by community vote count.",
    is_default: true,
    source: { kind: "topRated", take: 100 },
  },
  {
    slug: "best-comedy",
    title: "Best Comedy",
    description: "The 30 highest-rated comedies with broad audience reach.",
    is_default: true,
    source: { kind: "discover", params: genreDiscover("35"), take: 30 },
  },
  {
    slug: "best-action",
    title: "Best Action",
    description: "The most acclaimed action films of all time.",
    is_default: true,
    source: { kind: "discover", params: genreDiscover("28"), take: 25 },
  },

  // ---- Decade picks ----
  {
    slug: "best-of-the-90s",
    title: "Best of the 90s",
    description: "The defining films of 1990–1999, by community rating.",
    source: { kind: "discover", params: decadeDiscover(1990), take: 25 },
  },
  {
    slug: "best-of-the-2010s",
    title: "Best of the 2010s",
    description: "The most acclaimed films of 2010–2019.",
    source: { kind: "discover", params: decadeDiscover(2010), take: 25 },
  },

  // ---- Other genres ----
  {
    slug: "best-horror",
    title: "Best Horror",
    description: "The 25 highest-rated horror films with broad audience reach.",
    source: { kind: "discover", params: genreDiscover("27"), take: 25 },
  },
  {
    slug: "best-sci-fi",
    title: "Best Sci-Fi",
    description: "Reality-bending science fiction the community loved.",
    source: { kind: "discover", params: genreDiscover("878"), take: 25 },
  },
  {
    slug: "best-animation",
    title: "Best Animation",
    description: "Animated features that earned the highest community ratings.",
    source: { kind: "discover", params: genreDiscover("16"), take: 25 },
  },
  {
    slug: "best-documentaries",
    title: "Best Documentaries",
    description: "Top-rated documentaries — true stories, exceptional craft.",
    source: {
      kind: "discover",
      params: {
        with_genres: "99",
        sort_by: "vote_average.desc",
        "vote_count.gte": 200,
      },
      take: 25,
    },
  },

  // ---- Decade picks ----
  {
    slug: "best-of-the-80s",
    title: "Best of the 80s",
    description: "Highest-rated films of 1980–1989.",
    source: { kind: "discover", params: decadeDiscover(1980), take: 25 },
  },
  {
    slug: "best-of-the-2000s",
    title: "Best of the 2000s",
    description: "Highest-rated films of 2000–2009.",
    source: { kind: "discover", params: decadeDiscover(2000), take: 25 },
  },

  // -----------------------------------------------------------------------
  // Static canonical lists. Populate the `ids` arrays with real TMDB IDs
  // before re-running the seed; for now they ship with empty arrays so the
  // list rows exist but contain no items, and will be fleshed out in a
  // follow-up curation pass.
  // -----------------------------------------------------------------------
  {
    slug: "afi-100-years-100-movies",
    title: "AFI's 100 Years…100 Movies",
    description:
      "The American Film Institute's 2007 update of the greatest American films.",
    source: { kind: "byIds", ids: [] },
  },
  {
    slug: "sight-and-sound-top-100",
    title: "Sight & Sound Top 100",
    description:
      "The British Film Institute's once-a-decade critic poll of the greatest films of all time.",
    source: { kind: "byIds", ids: [] },
  },
  {
    slug: "imdb-top-250",
    title: "IMDB Top 250",
    description:
      "IMDB's user-voted top 250 films of all time, weighted by vote count.",
    source: { kind: "byIds", ids: [] },
  },
];

// =========================================================================
// Resolve movies
// =========================================================================
function dedupe(movies: TMDBMovie[]): TMDBMovie[] {
  const seen = new Set<number>();
  const out: TMDBMovie[] = [];
  for (const m of movies) {
    if (seen.has(m.id)) continue;
    seen.add(m.id);
    out.push(m);
  }
  return out;
}

async function resolveMovies(cfg: ListConfig): Promise<TMDBMovie[]> {
  if (cfg.source.kind === "byIds") {
    if (cfg.source.ids.length === 0) return [];
    const movies: TMDBMovie[] = [];
    for (const id of cfg.source.ids) {
      try {
        movies.push(await tmdb<TMDBMovie>(`/movie/${id}`));
      } catch (err) {
        console.warn(`  ⚠ failed to fetch movie ${id}: ${(err as Error).message}`);
      }
    }
    return dedupe(movies);
  }

  if (cfg.source.kind === "topRated") {
    const collected: TMDBMovie[] = [];
    let page = 1;
    while (collected.length < cfg.source.take && page <= 10) {
      const data = await tmdb<{ results: TMDBMovie[] }>("/movie/top_rated", { page });
      collected.push(...data.results);
      page++;
    }
    return dedupe(collected).slice(0, cfg.source.take);
  }

  // discover
  const collected: TMDBMovie[] = [];
  const pages = cfg.source.pages ?? Math.ceil(cfg.source.take / 20) + 1;
  for (let page = 1; page <= pages; page++) {
    const data = await tmdb<{ results: TMDBMovie[] }>("/discover/movie", {
      ...cfg.source.params,
      page,
    });
    collected.push(...data.results);
    if (dedupe(collected).length >= cfg.source.take) break;
  }
  return dedupe(collected).slice(0, cfg.source.take);
}

// =========================================================================
// Seed
// =========================================================================
async function seedList(cfg: ListConfig) {
  console.log(`\n→ ${cfg.title}  (${cfg.slug})`);

  const movies = await resolveMovies(cfg);
  console.log(`  ${movies.length} movies resolved`);

  if (movies.length === 0) {
    console.log("  (skipping items — no movies)");
    // Still upsert the list row so the slug exists.
  }

  // Upsert movies cache
  if (movies.length > 0) {
    const movieRows = movies.map((m) => ({
      tmdb_id: m.id,
      title: m.title,
      poster_path: m.poster_path,
      backdrop_path: m.backdrop_path,
      release_year: m.release_date ? parseInt(m.release_date.slice(0, 4), 10) : null,
      vote_average: Number(m.vote_average.toFixed(1)),
    }));
    const { error } = await supabase.from("movies").upsert(movieRows, { onConflict: "tmdb_id" });
    if (error) throw new Error(`movies upsert: ${error.message}`);
    console.log(`  upserted ${movieRows.length} movies`);
  }

  // Cover image: first movie's backdrop (TMDB CDN path) — fallback null
  const cover = movies[0]?.backdrop_path ?? null;

  // Upsert list row
  const { data: listRow, error: listErr } = await supabase
    .from("lists")
    .upsert(
      {
        type: "curated",
        slug: cfg.slug,
        title: cfg.title,
        description: cfg.description,
        cover_image: cover,
        is_public: true,
        is_default: cfg.is_default ?? false,
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();

  if (listErr || !listRow) throw new Error(`list upsert: ${listErr?.message}`);
  const listId = listRow.id as string;
  console.log(`  list id: ${listId}`);

  // Wipe existing items so re-runs reflect the latest seed config
  const { error: delErr } = await supabase.from("list_items").delete().eq("list_id", listId);
  if (delErr) throw new Error(`list_items delete: ${delErr.message}`);

  if (movies.length > 0) {
    const itemRows = movies.map((m, i) => ({
      list_id: listId,
      movie_id: m.id,
      position: i + 1,
    }));
    const { error: itemErr } = await supabase.from("list_items").insert(itemRows);
    if (itemErr) throw new Error(`list_items insert: ${itemErr.message}`);
    console.log(`  inserted ${itemRows.length} list items`);
  }
}

async function main() {
  console.log(`Seeding ${LISTS.length} curated lists into ${SUPABASE_URL}…`);
  for (const cfg of LISTS) {
    await seedList(cfg);
  }
  console.log("\n✓ Done.");
}

main().catch((err) => {
  console.error("\n✗ Seed failed:", err.message);
  process.exit(1);
});
