import {
  Camera,
  Film,
  Ghost,
  Laugh,
  Sparkles,
  Tv,
  Zap,
  type LucideIcon,
} from "lucide-react-native";

export type Vibe = {
  id: string;
  label: string;
  icon: LucideIcon;
  accent: string;
  /**
   * Filter by TMDB genre overlap. Any of these genre IDs in the movie's
   * genre_ids matches the vibe.
   */
  genre_ids?: number[];
  /** Filter by release year (inclusive). */
  year_range?: [number, number];
  /**
   * Curated lists that match this vibe — used as "track this list"
   * suggestions when the user hasn't subscribed to them.
   */
  list_slugs?: string[];
};

// TMDB genre IDs (stable):
// 27=Horror, 35=Comedy, 28=Action, 18=Drama, 878=Sci-Fi, 53=Thriller,
// 10749=Romance, 99=Documentary, 16=Animation, 12=Adventure, 14=Fantasy
export const VIBES: Vibe[] = [
  {
    id: "any",
    label: "Anything",
    icon: Sparkles,
    accent: "#cdb8e8",
  },
  {
    id: "classic",
    label: "A Classic",
    icon: Film,
    accent: "#ffd166",
    list_slugs: ["greatest-of-all-time"],
    // No filter — shows top-rated movies overall
  },
  {
    id: "funny",
    label: "Funny",
    icon: Laugh,
    accent: "#5cf0ff",
    genre_ids: [35],
    list_slugs: ["best-comedy"],
  },
  {
    id: "epic",
    label: "Epic",
    icon: Zap,
    accent: "#ff5b3c",
    genre_ids: [28, 878, 12],
    list_slugs: ["best-action", "best-sci-fi"],
  },
  {
    id: "scary",
    label: "Scary",
    icon: Ghost,
    accent: "#ff5fa8",
    genre_ids: [27, 53],
    list_slugs: ["best-horror"],
  },
  {
    id: "retro",
    label: "Retro",
    icon: Tv,
    accent: "#ff8fc1",
    year_range: [1980, 1999],
    list_slugs: ["best-of-the-80s", "best-of-the-90s"],
  },
  {
    id: "real",
    label: "Real",
    icon: Camera,
    accent: "#a795c8",
    genre_ids: [99],
    list_slugs: ["best-documentaries"],
  },
];
