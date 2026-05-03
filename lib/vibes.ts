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
  /** List slugs to pull suggestions from. null = pull from all user lists. */
  list_slugs: string[] | null;
};

export const VIBES: Vibe[] = [
  {
    id: "any",
    label: "Anything",
    icon: Sparkles,
    accent: "#cdb8e8",
    list_slugs: null,
  },
  {
    id: "classic",
    label: "A Classic",
    icon: Film,
    accent: "#ffd166",
    list_slugs: ["greatest-of-all-time"],
  },
  {
    id: "funny",
    label: "Funny",
    icon: Laugh,
    accent: "#5cf0ff",
    list_slugs: ["best-comedy"],
  },
  {
    id: "epic",
    label: "Epic",
    icon: Zap,
    accent: "#ff5b3c",
    list_slugs: ["best-action", "best-sci-fi"],
  },
  {
    id: "scary",
    label: "Scary",
    icon: Ghost,
    accent: "#ff5fa8",
    list_slugs: ["best-horror"],
  },
  {
    id: "retro",
    label: "Retro",
    icon: Tv,
    accent: "#ff8fc1",
    list_slugs: ["best-of-the-80s", "best-of-the-90s"],
  },
  {
    id: "real",
    label: "Real",
    icon: Camera,
    accent: "#a795c8",
    list_slugs: ["best-documentaries"],
  },
];
