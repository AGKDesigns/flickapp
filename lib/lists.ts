import type { DiscoverParams } from "@/lib/tmdb";

export type CuratedList = {
  id: string;
  title: string;
  total: number;
  // Either a topRated pull or a discover query
  source:
    | { kind: "topRated" }
    | { kind: "popular" }
    | { kind: "discover"; params: DiscoverParams };
};

// TMDB genre IDs (stable):
// 27=Horror, 35=Comedy, 28=Action, 18=Drama, 878=Sci-Fi, 53=Thriller, 10749=Romance, 99=Documentary, 16=Animation
export const CURATED_LISTS: CuratedList[] = [
  {
    id: "top-100",
    title: "Top 100 Movies",
    total: 100,
    source: { kind: "topRated" },
  },
  {
    id: "best-horror",
    title: "Best Horror",
    total: 25,
    source: {
      kind: "discover",
      params: {
        with_genres: "27",
        sort_by: "vote_average.desc",
        "vote_count.gte": 1500,
      },
    },
  },
  {
    id: "laughable",
    title: "Laughable Movies",
    total: 30,
    source: {
      kind: "discover",
      params: {
        with_genres: "35",
        sort_by: "vote_average.desc",
        "vote_count.gte": 1500,
      },
    },
  },
  {
    id: "best-2019",
    title: "Best of 2019",
    total: 20,
    source: {
      kind: "discover",
      params: {
        primary_release_year: 2019,
        sort_by: "vote_average.desc",
        "vote_count.gte": 500,
      },
    },
  },
];

export function getCuratedList(id: string): CuratedList | undefined {
  return CURATED_LISTS.find((l) => l.id === id);
}
