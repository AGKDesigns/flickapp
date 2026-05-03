import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Localization from "expo-localization";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassCard } from "@/components/glass-card";
import {
  fetchWatchedIds,
  markWatched,
  unmarkWatched,
} from "@/lib/lists";
import {
  backdropUrl,
  isTMDBConfigured,
  pickTrailer,
  posterUrl,
  providerLogoUrl,
  tmdb,
  type CastMember,
  type MovieDetail,
  type RegionWatchProviders,
  type Video,
} from "@/lib/tmdb";

function SectionLabel({ children, accent = "magenta" }: { children: string; accent?: "magenta" | "cyan" }) {
  return (
    <Text
      style={{
        fontFamily: "Inter_600SemiBold",
        fontSize: 12,
        letterSpacing: 1.4,
        color: accent === "magenta" ? "#ff5fa8" : "#5cf0ff",
        textTransform: "uppercase",
      }}
    >
      {children}
    </Text>
  );
}

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [trailer, setTrailer] = useState<Video | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [providers, setProviders] = useState<RegionWatchProviders | null>(null);
  const [region, setRegion] = useState<string>("US");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watched, setWatched] = useState(false);

  useEffect(() => {
    if (!id) return;
    if (!isTMDBConfigured) {
      setLoading(false);
      setError("TMDB not configured. Add EXPO_PUBLIC_TMDB_READ_TOKEN to .env and restart Metro.");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const userRegion = Localization.getLocales()[0]?.regionCode ?? "US";
    setRegion(userRegion);

    Promise.all([
      tmdb.movie(id),
      tmdb.videos(id),
      tmdb.credits(id),
      tmdb.watchProviders(id),
      fetchWatchedIds([Number(id)]).catch(() => new Set<number>()),
    ])
      .then(([movieData, videosData, creditsData, providersData, watchedSet]) => {
        if (cancelled) return;
        setMovie(movieData);
        setTrailer(pickTrailer(videosData.results));
        setCast(creditsData.cast.slice(0, 6));
        setProviders(providersData.results[userRegion] ?? null);
        setWatched(watchedSet.has(Number(id)));
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
  }, [id]);

  const onToggleWatched = async () => {
    if (!movie) return;
    Haptics.impactAsync(
      watched ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Heavy,
    );

    // Optimistic flip
    const wasWatched = watched;
    setWatched(!wasWatched);

    try {
      if (wasWatched) {
        await unmarkWatched(movie.id);
      } else {
        await markWatched({
          tmdb_id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          release_year: movie.release_date
            ? parseInt(movie.release_date.slice(0, 4), 10)
            : null,
          vote_average: Number(movie.vote_average.toFixed(1)),
        });
      }
    } catch (err) {
      // Revert
      setWatched(wasWatched);
      console.warn(`[movie] toggle watched failed: ${(err as Error).message}`);
    }
  };

  const onPlayTrailer = () => {
    if (!trailer) return;
    Linking.openURL(`https://www.youtube.com/watch?v=${trailer.key}`);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-night-950">
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
    );
  }

  if (error || !movie) {
    return (
      <View className="flex-1 bg-night-950">
        <SafeAreaView edges={["top"]} className="flex-1">
          <View className="px-5 pt-1">
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
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 18, color: "#f5f1ff" }}>←</Text>
            </Pressable>
          </View>
          <GlassCard glow="magenta" className="m-5 p-5">
            <SectionLabel>Error</SectionLabel>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                lineHeight: 20,
                color: "rgba(245,241,255,0.85)",
                marginTop: 6,
              }}
            >
              {error ?? "Movie not found"}
            </Text>
          </GlassCard>
        </SafeAreaView>
      </View>
    );
  }

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "";
  const backdropUri = backdropUrl(movie.backdrop_path);
  const posterUri = posterUrl(movie.poster_path, "w342");

  return (
    <View className="flex-1 bg-night-950">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Backdrop */}
        <View style={{ height: 440 }}>
          {backdropUri ? (
            <Image
              source={{ uri: backdropUri }}
              contentFit="cover"
              style={{ position: "absolute", inset: 0 }}
              transition={250}
            />
          ) : null}
          <LinearGradient
            colors={["rgba(5,5,6,0)", "rgba(5,5,6,0.6)", "rgba(5,5,6,1)"]}
            locations={[0, 0.55, 1]}
            style={{ position: "absolute", inset: 0 }}
          />
          <SafeAreaView edges={["top"]} className="px-5">
            <Pressable
              hitSlop={12}
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{
                backgroundColor: "rgba(5,5,6,0.6)",
                borderWidth: 0.5,
                borderColor: "rgba(255,255,255,0.12)",
              }}
            >
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 18, color: "#f5f1ff" }}>←</Text>
            </Pressable>
          </SafeAreaView>
        </View>

        {/* Title block */}
        <View className="-mt-36 px-5">
          <View className="flex-row items-end gap-4">
            <View
              className="h-44 w-28 overflow-hidden rounded-card"
              style={{
                borderWidth: 0.5,
                borderColor: "rgba(255,255,255,0.1)",
                shadowColor: "#ff2e93",
                shadowOpacity: 0.35,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 10 },
              }}
            >
              {posterUri ? (
                <Image
                  source={{ uri: posterUri }}
                  contentFit="cover"
                  style={{ flex: 1 }}
                  transition={200}
                />
              ) : null}
            </View>
            <View className="flex-1 pb-1">
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 13,
                  color: "rgba(245,241,255,0.7)",
                  letterSpacing: 0.2,
                }}
              >
                {[year, movie.runtime ? `${movie.runtime} min` : null, `★ ${movie.vote_average.toFixed(1)}`]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
              <Text
                style={{
                  fontFamily: "Orbitron_900Black",
                  fontSize: 26,
                  lineHeight: 32,
                  letterSpacing: 0.3,
                  color: "#f5f1ff",
                  marginTop: 4,
                }}
                numberOfLines={3}
              >
                {movie.title}
              </Text>
              {movie.tagline ? (
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 13,
                    fontStyle: "italic",
                    color: "rgba(245,241,255,0.55)",
                    marginTop: 6,
                  }}
                  numberOfLines={2}
                >
                  &ldquo;{movie.tagline}&rdquo;
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Watched toggle */}
        <View className="mt-7 px-5">
          <Pressable
            onPress={onToggleWatched}
            android_ripple={{ color: "rgba(255,46,147,0.3)" }}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.97 : 1 }],
              shadowColor: watched ? "#00e5ff" : "#ff2e93",
              shadowOpacity: 0.55,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 6 },
            })}
            className="h-14 items-center justify-center overflow-hidden rounded-card"
          >
            <LinearGradient
              colors={
                watched
                  ? ["#00e5ff", "#5cf0ff"]
                  : ["#ff2e93", "#ff5b3c"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: "absolute", inset: 0 }}
            />
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 15,
                letterSpacing: 0.5,
                color: watched ? "#050506" : "#ffffff",
              }}
            >
              {watched ? "✓  Watched" : "Mark as watched"}
            </Text>
          </Pressable>

          <View className="mt-3 flex-row gap-3">
            <Pressable
              className="flex-1 items-center rounded-card py-3"
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                borderWidth: 0.5,
                borderColor: "rgba(255,255,255,0.10)",
              }}
            >
              <Text
                style={{ fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#f5f1ff" }}
              >
                + Add to list
              </Text>
            </Pressable>
            <Pressable
              className="flex-1 items-center rounded-card py-3"
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                borderWidth: 0.5,
                borderColor: "rgba(255,255,255,0.10)",
              }}
            >
              <Text
                style={{ fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#f5f1ff" }}
              >
                ★ Rate
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Synopsis */}
        <View className="mt-9 px-5">
          <SectionLabel>Synopsis</SectionLabel>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 16,
              lineHeight: 24,
              color: "rgba(245,241,255,0.85)",
              marginTop: 8,
            }}
          >
            {movie.overview || "No synopsis available."}
          </Text>
          {movie.genres.length > 0 ? (
            <View className="mt-4 flex-row flex-wrap gap-2">
              {movie.genres.map((g) => (
                <View
                  key={g.id}
                  className="rounded-full px-3 py-1"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.06)",
                    borderWidth: 0.5,
                    borderColor: "rgba(255,255,255,0.10)",
                  }}
                >
                  <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: "#c8c1d9" }}>
                    {g.name}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* Trailer */}
        <View className="mt-9 px-5">
          <SectionLabel accent="cyan">Trailer</SectionLabel>
          <Pressable
            onPress={onPlayTrailer}
            disabled={!trailer}
            className="mt-3 h-48 items-center justify-center overflow-hidden rounded-sheet"
            style={{
              borderWidth: 0.5,
              borderColor: "rgba(255,255,255,0.10)",
              backgroundColor: "rgba(255,255,255,0.04)",
            }}
          >
            <LinearGradient
              colors={["rgba(0,229,255,0.18)", "rgba(255,46,147,0.18)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: "absolute", inset: 0 }}
            />
            <View
              className="h-16 w-16 items-center justify-center rounded-full"
              style={{
                backgroundColor: "rgba(5,5,6,0.7)",
                borderWidth: 1,
                borderColor: "rgba(0,229,255,0.6)",
              }}
            >
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 22, color: "#5cf0ff" }}>▶</Text>
            </View>
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 13,
                color: "rgba(245,241,255,0.65)",
                marginTop: 12,
                paddingHorizontal: 24,
                textAlign: "center",
              }}
              numberOfLines={1}
            >
              {trailer ? trailer.name : "No trailer available"}
            </Text>
          </Pressable>
        </View>

        {/* Where to Watch */}
        {providers && (providers.flatrate?.length || providers.rent?.length || providers.buy?.length || providers.free?.length) ? (
          <View className="mt-9 px-5">
            <View className="flex-row items-baseline justify-between">
              <SectionLabel accent="cyan">Where to watch</SectionLabel>
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                  color: "rgba(245,241,255,0.45)",
                  letterSpacing: 0.5,
                }}
              >
                {region}
              </Text>
            </View>

            {(["flatrate", "free", "ads", "rent", "buy"] as const).map((tier) => {
              const list = providers[tier];
              if (!list || list.length === 0) return null;
              const label =
                tier === "flatrate"
                  ? "Stream"
                  : tier === "free"
                    ? "Free"
                    : tier === "ads"
                      ? "Free with ads"
                      : tier === "rent"
                        ? "Rent"
                        : "Buy";
              return (
                <View key={tier} className="mt-4">
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 12,
                      color: "rgba(245,241,255,0.55)",
                    }}
                  >
                    {label}
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 10, paddingTop: 8, paddingRight: 20 }}
                  >
                    {list.map((p) => (
                      <Pressable
                        key={p.provider_id}
                        onPress={() => Linking.openURL(providers.link)}
                        android_ripple={{ color: "rgba(255,46,147,0.25)" }}
                        style={({ pressed }) => ({
                          transform: [{ scale: pressed ? 0.94 : 1 }],
                        })}
                      >
                        <View
                          className="h-14 w-14 overflow-hidden rounded-card"
                          style={{
                            borderWidth: 0.5,
                            borderColor: "rgba(255,255,255,0.10)",
                            backgroundColor: "rgba(255,255,255,0.05)",
                          }}
                        >
                          <Image
                            source={{ uri: providerLogoUrl(p.logo_path, "w92") }}
                            contentFit="cover"
                            style={{ flex: 1 }}
                            transition={150}
                            accessibilityLabel={p.provider_name}
                          />
                        </View>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              );
            })}

            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 11,
                color: "rgba(245,241,255,0.3)",
                marginTop: 14,
                letterSpacing: 0.3,
              }}
            >
              Streaming data by JustWatch
            </Text>
          </View>
        ) : null}

        {/* Cast */}
        {cast.length > 0 ? (
          <View className="mt-9 px-5">
            <SectionLabel>Cast</SectionLabel>
            <View className="mt-3 flex-row flex-wrap gap-2">
              {cast.map((member) => (
                <View
                  key={member.id}
                  className="rounded-full px-3 py-1.5"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.06)",
                    borderWidth: 0.5,
                    borderColor: "rgba(255,255,255,0.10)",
                  }}
                >
                  <Text style={{ fontFamily: "Inter_500Medium", fontSize: 13, color: "#f5f1ff" }}>
                    {member.name}
                  </Text>
                  <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: "rgba(245,241,255,0.5)" }}>
                    as {member.character}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 11,
            color: "rgba(245,241,255,0.25)",
            textAlign: "center",
            marginTop: 32,
            letterSpacing: 0.3,
          }}
        >
          Data by TMDB
        </Text>
      </ScrollView>
    </View>
  );
}
