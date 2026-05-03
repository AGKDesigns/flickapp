import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassCard } from "@/components/glass-card";
import { MovieCard } from "@/components/movie-card";
import { getCuratedList } from "@/lib/lists";
import { isTMDBConfigured, tmdb, type MovieListItem } from "@/lib/tmdb";

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const list = id ? getCuratedList(id) : undefined;

  const [movies, setMovies] = useState<MovieListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!list) {
      setLoading(false);
      setError(`No list found for "${id}"`);
      return;
    }
    if (!isTMDBConfigured) {
      setLoading(false);
      setError("TMDB not configured. Add EXPO_PUBLIC_TMDB_READ_TOKEN to .env and restart Metro.");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const promise =
      list.source.kind === "topRated"
        ? tmdb.topRated()
        : list.source.kind === "popular"
          ? tmdb.popular()
          : tmdb.discover(list.source.params);

    promise
      .then((data) => {
        if (cancelled) return;
        setMovies(data.results.slice(0, list.total));
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
  }, [id, list]);

  return (
    <View className="flex-1 bg-night-950">
      <LinearGradient
        colors={["#ff2e93", "#170933", "#050506"]}
        locations={[0, 0.4, 1]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 320,
          opacity: 0.4,
        }}
      />
      <SafeAreaView edges={["top"]} className="flex-1">
        <View className="flex-row items-center px-5 pt-1">
          <Pressable
            hitSlop={12}
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{
              backgroundColor: "rgba(255,255,255,0.08)",
              borderWidth: 0.5,
              borderColor: "rgba(255,255,255,0.12)",
            }}
          >
            <Text
              style={{ fontFamily: "Inter_600SemiBold", fontSize: 18, color: "#f5f1ff" }}
            >
              ←
            </Text>
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 110 }}
        >
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 14,
              color: "rgba(245,241,255,0.55)",
              letterSpacing: 0.2,
            }}
          >
            Curated list
          </Text>
          <Text
            style={{
              fontFamily: "Orbitron_900Black",
              fontSize: 32,
              lineHeight: 38,
              letterSpacing: 0.3,
              color: "#f5f1ff",
              marginTop: 4,
            }}
            numberOfLines={2}
          >
            {list?.title ?? "List"}
          </Text>
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 14,
              color: "#5cf0ff",
              marginTop: 4,
            }}
          >
            {list ? `0 of ${list.total} watched` : ""}
          </Text>

          <View className="mt-6">
            {loading ? (
              <View className="items-center py-16">
                <ActivityIndicator color="#ff2e93" />
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 13,
                    color: "rgba(245,241,255,0.55)",
                    marginTop: 12,
                  }}
                >
                  Loading…
                </Text>
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
            ) : (
              <View className="flex-row flex-wrap justify-between">
                {movies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    id={movie.id}
                    title={movie.title}
                    posterPath={movie.poster_path}
                    voteAverage={movie.vote_average}
                    onPress={() =>
                      router.push({
                        pathname: "/movie/[id]",
                        params: { id: String(movie.id) },
                      })
                    }
                  />
                ))}
              </View>
            )}
          </View>

          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 11,
              color: "rgba(245,241,255,0.25)",
              textAlign: "center",
              marginTop: 24,
              letterSpacing: 0.3,
            }}
          >
            Data by TMDB
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
