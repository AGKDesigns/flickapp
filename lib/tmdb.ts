const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

const READ_TOKEN = process.env.EXPO_PUBLIC_TMDB_READ_TOKEN ?? "";

export const isTMDBConfigured = Boolean(READ_TOKEN);

export type PosterSize = "w154" | "w185" | "w342" | "w500" | "w780" | "original";
export type BackdropSize = "w300" | "w780" | "w1280" | "original";

export function posterUrl(path: string | null, size: PosterSize = "w500") {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

export function backdropUrl(path: string | null, size: BackdropSize = "w1280") {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

async function tmdbFetch<T>(
  path: string,
  params?: Record<string, string | number | boolean>,
): Promise<T> {
  if (!isTMDBConfigured) {
    throw new Error(
      "TMDB read token not configured. Set EXPO_PUBLIC_TMDB_READ_TOKEN in .env and restart Metro.",
    );
  }
  const qs = params
    ? "?" +
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join("&")
    : "";
  const res = await fetch(`${TMDB_BASE}${path}${qs}`, {
    headers: {
      Authorization: `Bearer ${READ_TOKEN}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`TMDB ${res.status} on ${path}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

// ---- Types ----

export type MovieListItem = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
};

export type MovieDetail = MovieListItem & {
  runtime: number | null;
  genres: { id: number; name: string }[];
  tagline: string | null;
};

export type Video = {
  key: string;
  site: "YouTube" | "Vimeo";
  type: "Trailer" | "Teaser" | "Clip" | "Featurette" | "Behind the Scenes" | "Bloopers";
  name: string;
  official: boolean;
  published_at: string;
};

export type CastMember = {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
};

type Paginated<T> = { page: number; results: T[]; total_pages: number; total_results: number };

// ---- Endpoints ----

export type DiscoverParams = {
  with_genres?: string;
  primary_release_year?: number;
  sort_by?:
    | "popularity.desc"
    | "vote_average.desc"
    | "primary_release_date.desc"
    | "revenue.desc";
  "vote_count.gte"?: number;
  "vote_average.gte"?: number;
  page?: number;
};

export const tmdb = {
  discover: (params: DiscoverParams) =>
    tmdbFetch<Paginated<MovieListItem>>("/discover/movie", params as Record<string, string | number>),

  topRated: (page = 1) =>
    tmdbFetch<Paginated<MovieListItem>>("/movie/top_rated", { page }),

  popular: (page = 1) =>
    tmdbFetch<Paginated<MovieListItem>>("/movie/popular", { page }),

  movie: (id: number | string) => tmdbFetch<MovieDetail>(`/movie/${id}`),

  videos: (id: number | string) =>
    tmdbFetch<{ id: number; results: Video[] }>(`/movie/${id}/videos`),

  credits: (id: number | string) =>
    tmdbFetch<{ id: number; cast: CastMember[] }>(`/movie/${id}/credits`),
};

export function pickTrailer(videos: Video[]): Video | null {
  const youtubeTrailers = videos.filter((v) => v.site === "YouTube" && v.type === "Trailer");
  return (
    youtubeTrailers.find((v) => v.official) ??
    youtubeTrailers[0] ??
    null
  );
}
