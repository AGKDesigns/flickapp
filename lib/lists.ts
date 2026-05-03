import { supabase } from "@/lib/supabase";
import { backdropUrl } from "@/lib/tmdb";

export type CuratedListSummary = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  total: number;
};

export type DiscoverList = CuratedListSummary & { isAdded: boolean };

export type CuratedListMovie = {
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  position: number | null;
};

export type CuratedListWithMovies = CuratedListSummary & {
  movies: CuratedListMovie[];
};

type ListsRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  list_items: { count: number }[];
};

type ListWithItemsRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  list_items: {
    position: number | null;
    movies: {
      tmdb_id: number;
      title: string;
      poster_path: string | null;
      vote_average: number;
    } | null;
  }[];
};

type ListEmbed = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  list_items: { count: number }[];
};

function shape(row: ListEmbed): CuratedListSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    cover_url: row.cover_image ? backdropUrl(row.cover_image, "w1280") : null,
    total: row.list_items?.[0]?.count ?? 0,
  };
}

export async function fetchUserLists(): Promise<CuratedListSummary[]> {
  const { data, error } = await supabase
    .from("user_lists")
    .select(
      "added_at, lists!inner(id, slug, title, description, cover_image, list_items(count))",
    )
    .order("added_at", { ascending: false })
    .returns<{ added_at: string; lists: ListEmbed }[]>();

  if (error) throw new Error(`fetchUserLists: ${error.message}`);
  return (data ?? []).map((row) => shape(row.lists));
}

export async function fetchDiscoverLists(): Promise<DiscoverList[]> {
  const [allRes, mineRes] = await Promise.all([
    supabase
      .from("lists")
      .select("id, slug, title, description, cover_image, list_items(count)")
      .eq("type", "curated")
      .eq("is_public", true)
      .order("created_at", { ascending: true })
      .returns<ListEmbed[]>(),
    supabase.from("user_lists").select("list_id"),
  ]);

  if (allRes.error) throw new Error(`fetchDiscoverLists (lists): ${allRes.error.message}`);
  if (mineRes.error) throw new Error(`fetchDiscoverLists (user_lists): ${mineRes.error.message}`);

  const addedSet = new Set((mineRes.data ?? []).map((r) => r.list_id));

  return (allRes.data ?? []).map((row) => ({
    ...shape(row),
    isAdded: addedSet.has(row.id),
  }));
}

export async function addListToUser(listId: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not signed in");

  const { error } = await supabase
    .from("user_lists")
    .insert({ user_id: userData.user.id, list_id: listId });

  if (error && error.code !== "23505") {
    // 23505 = unique violation (already added) — treat as idempotent success
    throw new Error(`addListToUser: ${error.message}`);
  }
}

export async function removeListFromUser(listId: string): Promise<void> {
  const { error } = await supabase
    .from("user_lists")
    .delete()
    .eq("list_id", listId);

  if (error) throw new Error(`removeListFromUser: ${error.message}`);
}

export async function fetchCuratedLists(): Promise<CuratedListSummary[]> {
  const { data, error } = await supabase
    .from("lists")
    .select("id, slug, title, description, cover_image, list_items(count)")
    .eq("type", "curated")
    .eq("is_public", true)
    .order("created_at", { ascending: true })
    .returns<ListsRow[]>();

  if (error) throw new Error(`fetchCuratedLists: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    cover_url: row.cover_image ? backdropUrl(row.cover_image, "w1280") : null,
    total: row.list_items?.[0]?.count ?? 0,
  }));
}

export async function fetchCuratedListBySlug(
  slug: string,
): Promise<CuratedListWithMovies | null> {
  const { data, error } = await supabase
    .from("lists")
    .select(
      "id, slug, title, description, cover_image, list_items(position, movies(tmdb_id, title, poster_path, vote_average))",
    )
    .eq("type", "curated")
    .eq("slug", slug)
    .order("position", { foreignTable: "list_items", ascending: true })
    .maybeSingle()
    .returns<ListWithItemsRow | null>();

  if (error) throw new Error(`fetchCuratedListBySlug: ${error.message}`);
  if (!data) return null;

  const movies: CuratedListMovie[] = (data.list_items ?? [])
    .filter((item) => item.movies !== null)
    .map((item) => ({
      tmdb_id: item.movies!.tmdb_id,
      title: item.movies!.title,
      poster_path: item.movies!.poster_path,
      vote_average: item.movies!.vote_average,
      position: item.position,
    }));

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    description: data.description,
    cover_url: data.cover_image ? backdropUrl(data.cover_image, "w1280") : null,
    total: movies.length,
    movies,
  };
}
