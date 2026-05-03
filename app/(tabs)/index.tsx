import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import { Trophy } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassCard } from "@/components/glass-card";
import {
  addListToUser,
  fetchTonightPicks,
  fetchVibeListSuggestions,
  markWatched,
  unmarkWatched,
  type CuratedListSummary,
  type TonightPick,
} from "@/lib/lists";
import { posterUrl } from "@/lib/tmdb";
import { VIBES, type Vibe } from "@/lib/vibes";

export default function TonightScreen() {
  const [vibeId, setVibeId] = useState<string>("any");
  const [picks, setPicks] = useState<TonightPick[]>([]);
  const [suggestedLists, setSuggestedLists] = useState<CuratedListSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchedSet, setWatchedSet] = useState<Set<number>>(new Set());
  const [busyListIds, setBusyListIds] = useState<Set<string>>(new Set());

  const vibe = VIBES.find((v) => v.id === vibeId) ?? VIBES[0];

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      setError(null);

      Promise.all([
        fetchTonightPicks(
          { genre_ids: vibe.genre_ids, year_range: vibe.year_range },
          6,
        ),
        fetchVibeListSuggestions(vibe.list_slugs).catch(
          () => [] as CuratedListSummary[],
        ),
      ])
        .then(([p, s]) => {
          if (cancelled) return;
          setPicks(p);
          setSuggestedLists(s);
          setWatchedSet(new Set());
        })
        .catch((err: Error) => {
          if (cancelled) return;
          setError(err.message);
        })
        .finally(() => {
          if (cancelled) return;
          setLoading(false);
        });

      return () => {
        cancelled = true;
      };
    }, [vibe]),
  );

  const onPickVibe = (next: Vibe) => {
    if (next.id === vibe.id) return;
    Haptics.selectionAsync();
    setVibeId(next.id);
  };

  const onToggleWatched = async (pick: TonightPick) => {
    const wasWatched = watchedSet.has(pick.tmdb_id);
    Haptics.impactAsync(
      wasWatched ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium,
    );

    setWatchedSet((curr) => {
      const next = new Set(curr);
      if (wasWatched) next.delete(pick.tmdb_id);
      else next.add(pick.tmdb_id);
      return next;
    });

    try {
      if (wasWatched) {
        await unmarkWatched(pick.tmdb_id);
      } else {
        await markWatched({
          tmdb_id: pick.tmdb_id,
          title: pick.title,
          poster_path: pick.poster_path,
          backdrop_path: pick.backdrop_path,
          release_year: pick.release_year,
          vote_average: pick.vote_average,
        });
      }
    } catch (err) {
      setWatchedSet((curr) => {
        const next = new Set(curr);
        if (wasWatched) next.add(pick.tmdb_id);
        else next.delete(pick.tmdb_id);
        return next;
      });
      console.warn(`[tonight] toggle failed: ${(err as Error).message}`);
    }
  };

  const onTrackList = async (list: CuratedListSummary) => {
    if (busyListIds.has(list.id)) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setBusyListIds((s) => new Set(s).add(list.id));
    // Optimistically remove the suggestion
    setSuggestedLists((curr) => curr.filter((l) => l.id !== list.id));

    try {
      await addListToUser(list.id);
    } catch (err) {
      // Revert
      setSuggestedLists((curr) => [...curr, list]);
      console.warn(`[tonight] track list failed: ${(err as Error).message}`);
    } finally {
      setBusyListIds((s) => {
        const next = new Set(s);
        next.delete(list.id);
        return next;
      });
    }
  };

  return (
    <View className="flex-1 bg-night-950">
      <LinearGradient
        colors={[vibe.accent, "#170933", "#050506"]}
        locations={[0, 0.45, 1]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 420,
          opacity: 0.4,
        }}
      />

      <SafeAreaView edges={["top"]} className="flex-1">
        <View className="flex-row items-center justify-between px-5 pt-1">
          <View style={{ width: 36 }} />
          <Image
            source={require("@/assets/img/FlickApp_TopLogo.png")}
            style={{ width: 132, height: 60 }}
            contentFit="contain"
          />
          <Pressable hitSlop={14} onPress={() => router.push("/trophies")}>
            <Trophy size={22} color="#5cf0ff" strokeWidth={2} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 110 }}
        >
          <View className="px-5 pt-4">
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 15,
                color: "rgba(245,241,255,0.55)",
                letterSpacing: 0.2,
              }}
            >
              Tonight
            </Text>
            <Text
              style={{
                fontFamily: "Orbitron_900Black",
                fontSize: 30,
                lineHeight: 36,
                letterSpacing: 0.5,
                color: "#f5f1ff",
                marginTop: 4,
              }}
            >
              What are we watching?
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8, gap: 10 }}
          >
            {VIBES.map((v) => (
              <VibePill
                key={v.id}
                vibe={v}
                selected={v.id === vibe.id}
                onPress={() => onPickVibe(v)}
              />
            ))}
          </ScrollView>

          <View className="mt-2 px-5">
            {loading ? (
              <View className="items-center py-16">
                <ActivityIndicator color={vibe.accent} />
              </View>
            ) : error ? (
              <GlassCard glow="magenta" className="p-5">
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 12,
                    letterSpacing: 1.5,
                    color: "#ff5fa8",
                  }}
                >
                  ERROR
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 14,
                    lineHeight: 20,
                    color: "rgba(245,241,255,0.85)",
                    marginTop: 6,
                  }}
                >
                  {error}
                </Text>
              </GlassCard>
            ) : picks.length === 0 ? (
              <GlassCard glow="cyan" className="p-6">
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 12,
                    letterSpacing: 1.5,
                    color: "#5cf0ff",
                  }}
                >
                  NOTHING TO PICK
                </Text>
                <Text
                  style={{
                    fontFamily: "Orbitron_700Bold",
                    fontSize: 20,
                    lineHeight: 25,
                    letterSpacing: 0.3,
                    color: "#f5f1ff",
                    marginTop: 6,
                  }}
                >
                  You&apos;ve seen them all
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 14,
                    lineHeight: 20,
                    color: "rgba(245,241,255,0.7)",
                    marginTop: 8,
                  }}
                >
                  Try a different vibe.
                </Text>
              </GlassCard>
            ) : (
              picks.map((pick) => (
                <PickCard
                  key={pick.tmdb_id}
                  pick={pick}
                  watched={watchedSet.has(pick.tmdb_id)}
                  onOpen={() =>
                    router.push({
                      pathname: "/movie/[id]",
                      params: { id: String(pick.tmdb_id) },
                    })
                  }
                  onToggleWatched={() => onToggleWatched(pick)}
                />
              ))
            )}
          </View>

          {suggestedLists.length > 0 ? (
            <View className="mt-4 px-5">
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 12,
                  letterSpacing: 1.5,
                  color: "rgba(245,241,255,0.55)",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                Track for more {vibe.label.toLowerCase()}
              </Text>
              {suggestedLists.map((list) => (
                <SuggestedListCard
                  key={list.id}
                  list={list}
                  busy={busyListIds.has(list.id)}
                  onTrack={() => onTrackList(list)}
                  onOpen={() =>
                    router.push({
                      pathname: "/list/[slug]",
                      params: { slug: list.slug },
                    })
                  }
                />
              ))}
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function VibePill({
  vibe,
  selected,
  onPress,
}: {
  vibe: Vibe;
  selected: boolean;
  onPress: () => void;
}) {
  const Icon = vibe.icon;
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-2 rounded-full px-4 py-2.5"
      style={({ pressed }) => ({
        backgroundColor: selected ? `${vibe.accent}22` : "rgba(255,255,255,0.05)",
        borderWidth: 0.5,
        borderColor: selected ? vibe.accent : "rgba(255,255,255,0.10)",
        transform: [{ scale: pressed ? 0.96 : 1 }],
        shadowColor: selected ? vibe.accent : "transparent",
        shadowOpacity: selected ? 0.4 : 0,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      })}
    >
      <Icon size={15} color={selected ? vibe.accent : "#cdb8e8"} strokeWidth={2} />
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 13,
          color: selected ? vibe.accent : "#cdb8e8",
          letterSpacing: 0.2,
        }}
      >
        {vibe.label}
      </Text>
    </Pressable>
  );
}

function PickCard({
  pick,
  watched,
  onOpen,
  onToggleWatched,
}: {
  pick: TonightPick;
  watched: boolean;
  onOpen: () => void;
  onToggleWatched: () => void;
}) {
  const url = posterUrl(pick.poster_path, "w342");

  return (
    <Pressable
      onPress={onOpen}
      android_ripple={{ color: "rgba(255,46,147,0.18)" }}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
      className="mb-3 overflow-hidden rounded-sheet"
    >
      <View
        className="flex-row gap-4 bg-night-900 p-3"
        style={{
          borderWidth: 0.5,
          borderColor: watched ? "rgba(0,229,255,0.35)" : "rgba(255,255,255,0.08)",
          shadowColor: watched ? "#00e5ff" : "#ff2e93",
          shadowOpacity: 0.25,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
        }}
      >
        <View
          className="h-32 overflow-hidden rounded-card"
          style={{
            width: 88,
            borderWidth: 0.5,
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          {url ? (
            <Image
              source={{ uri: url }}
              contentFit="cover"
              style={{ flex: 1, opacity: watched ? 0.45 : 1 }}
              transition={200}
            />
          ) : (
            <LinearGradient
              colors={["#221152", "#170933", "#050506"]}
              style={{ flex: 1 }}
            />
          )}
        </View>

        <View className="flex-1 justify-center py-1">
          <Text
            style={{
              fontFamily: "Orbitron_700Bold",
              fontSize: 17,
              lineHeight: 22,
              letterSpacing: 0.3,
              color: "#f5f1ff",
            }}
            numberOfLines={2}
          >
            {pick.title}
          </Text>
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 12,
              color: "#ffd166",
              marginTop: 4,
            }}
          >
            ★ {pick.vote_average.toFixed(1)}
            {pick.release_year ? ` · ${pick.release_year}` : ""}
          </Text>
        </View>

        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onToggleWatched();
          }}
          hitSlop={8}
          className="h-10 w-10 items-center justify-center self-center rounded-full"
          style={({ pressed }) => ({
            backgroundColor: watched ? "rgba(0,229,255,0.95)" : "rgba(255,46,147,0.18)",
            borderWidth: 0.5,
            borderColor: watched ? "rgba(0,229,255,1)" : "rgba(255,46,147,0.5)",
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              lineHeight: 20,
              color: watched ? "#050506" : "#ff5fa8",
            }}
          >
            {watched ? "✓" : "+"}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

function SuggestedListCard({
  list,
  busy,
  onTrack,
  onOpen,
}: {
  list: CuratedListSummary;
  busy: boolean;
  onTrack: () => void;
  onOpen: () => void;
}) {
  return (
    <Pressable
      onPress={onOpen}
      android_ripple={{ color: "rgba(0,229,255,0.18)" }}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
      className="mb-3 overflow-hidden rounded-card"
    >
      <View
        className="flex-row gap-3 bg-night-900 p-3"
        style={{
          borderWidth: 0.5,
          borderColor: "rgba(0,229,255,0.25)",
        }}
      >
        <View
          className="h-16 w-24 overflow-hidden rounded-card"
          style={{
            borderWidth: 0.5,
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          {list.cover_url ? (
            <Image
              source={{ uri: list.cover_url }}
              contentFit="cover"
              style={{ flex: 1 }}
              transition={150}
            />
          ) : (
            <LinearGradient
              colors={["#221152", "#170933", "#050506"]}
              style={{ flex: 1 }}
            />
          )}
        </View>

        <View className="flex-1 justify-center">
          <Text
            style={{
              fontFamily: "Orbitron_700Bold",
              fontSize: 14,
              lineHeight: 18,
              letterSpacing: 0.3,
              color: "#f5f1ff",
            }}
            numberOfLines={1}
          >
            {list.title}
          </Text>
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 11,
              color: "rgba(245,241,255,0.55)",
              marginTop: 2,
            }}
          >
            {list.total} movies
          </Text>
        </View>

        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onTrack();
          }}
          disabled={busy}
          hitSlop={8}
          className="self-center rounded-full px-3 py-1.5"
          style={({ pressed }) => ({
            backgroundColor: "rgba(0,229,255,0.18)",
            borderWidth: 0.5,
            borderColor: "rgba(0,229,255,0.5)",
            opacity: pressed || busy ? 0.6 : 1,
          })}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 12,
              color: "#5cf0ff",
              letterSpacing: 0.3,
            }}
          >
            + Track
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

