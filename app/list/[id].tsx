import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
        colors={["#ff2e93", "#170933", "#070014"]}
        locations={[0, 0.4, 1]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 280,
          opacity: 0.5,
        }}
      />
      <SafeAreaView edges={["top"]} className="flex-1">
        <View className="flex-row items-center px-5 pt-2">
          <Pressable
            hitSlop={12}
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full border border-magenta-500/40 bg-night-950/60"
          >
            <Text
              className="text-magenta-400"
              style={{ fontFamily: "Orbitron_700Bold", fontSize: 16 }}
            >
              ←
            </Text>
          </Pressable>
        </View>

        <View className="mt-3 px-5">
          <Text
            className="text-ink-400"
            style={{ fontFamily: "JetBrainsMono_400Regular", fontSize: 11, letterSpacing: 2 }}
          >
            // CURATED LIST
          </Text>
          <Text
            className="mt-1 text-ink-50"
            style={{ fontFamily: "Orbitron_900Black", fontSize: 28, letterSpacing: 1 }}
            numberOfLines={2}
          >
            {(list?.title ?? "").toUpperCase()}
          </Text>
          <Text
            className="mt-1 text-cyan-400"
            style={{ fontFamily: "JetBrainsMono_700Bold", fontSize: 11, letterSpacing: 2 }}
          >
            {list ? `00 / ${list.total} WATCHED` : ""}
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingTop: 16 }}
        >
          {loading ? (
            <View className="items-center py-16">
              <ActivityIndicator color="#ff2e93" />
              <Text
                className="mt-4 text-ink-400"
                style={{ fontFamily: "JetBrainsMono_400Regular", fontSize: 11, letterSpacing: 2 }}
              >
                LOADING TRANSMISSION...
              </Text>
            </View>
          ) : error ? (
            <View className="rounded-2xl border border-magenta-500/40 bg-night-800 p-5">
              <Text
                className="text-magenta-400"
                style={{ fontFamily: "JetBrainsMono_700Bold", fontSize: 11, letterSpacing: 2 }}
              >
                ERROR
              </Text>
              <Text
                className="mt-2 text-ink-200"
                style={{ fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20 }}
              >
                {error}
              </Text>
            </View>
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

          <Text
            className="mt-8 text-center text-ink-600"
            style={{ fontFamily: "JetBrainsMono_400Regular", fontSize: 10, letterSpacing: 1.5 }}
          >
            DATA BY TMDB
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
