import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
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

import * as Localization from "expo-localization";

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
    ])
      .then(([movieData, videosData, creditsData, providersData]) => {
        if (cancelled) return;
        setMovie(movieData);
        setTrailer(pickTrailer(videosData.results));
        setCast(creditsData.cast.slice(0, 6));
        setProviders(providersData.results[userRegion] ?? null);
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

  const onToggleWatched = () => {
    Haptics.impactAsync(
      watched
        ? Haptics.ImpactFeedbackStyle.Light
        : Haptics.ImpactFeedbackStyle.Heavy,
    );
    setWatched((w) => !w);
  };

  const onPlayTrailer = () => {
    if (!trailer) return;
    const url = `https://www.youtube.com/watch?v=${trailer.key}`;
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-night-950">
        <ActivityIndicator color="#ff2e93" />
        <Text
          className="mt-4 text-ink-400"
          style={{ fontFamily: "JetBrainsMono_400Regular", fontSize: 11, letterSpacing: 2 }}
        >
          LOADING TRANSMISSION...
        </Text>
      </View>
    );
  }

  if (error || !movie) {
    return (
      <View className="flex-1 bg-night-950">
        <SafeAreaView edges={["top"]} className="flex-1">
          <View className="px-5 pt-2">
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
          <View className="m-5 rounded-2xl border border-magenta-500/40 bg-night-800 p-5">
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
              {error ?? "Movie not found"}
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "";
  const backdropUri = backdropUrl(movie.backdrop_path);
  const posterUri = posterUrl(movie.poster_path, "w342");

  return (
    <View className="flex-1 bg-night-950">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* Backdrop */}
        <View style={{ height: 420 }}>
          {backdropUri ? (
            <Image
              source={{ uri: backdropUri }}
              contentFit="cover"
              style={{ position: "absolute", inset: 0 }}
              transition={250}
            />
          ) : null}
          <LinearGradient
            colors={["rgba(7, 0, 20, 0.0)", "rgba(13, 4, 33, 0.6)", "rgba(7, 0, 20, 1)"]}
            locations={[0, 0.55, 1]}
            style={{ position: "absolute", inset: 0 }}
          />
          <SafeAreaView edges={["top"]} className="px-5">
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
          </SafeAreaView>
        </View>

        {/* Title block */}
        <View className="-mt-32 px-5">
          <View className="flex-row items-end gap-4">
            <View
              className="h-44 w-28 overflow-hidden rounded-xl border border-magenta-500/50 bg-night-800"
              style={{
                shadowColor: "#ff2e93",
                shadowOpacity: 0.55,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 8 },
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
                className="text-cyan-400"
                style={{ fontFamily: "JetBrainsMono_700Bold", fontSize: 11, letterSpacing: 2 }}
              >
                {year}
                {movie.runtime ? ` · ${movie.runtime}MIN` : ""} · ★ {movie.vote_average.toFixed(1)}
              </Text>
              <Text
                className="mt-1 text-ink-50"
                style={{ fontFamily: "Orbitron_900Black", fontSize: 26, letterSpacing: 1 }}
                numberOfLines={3}
              >
                {movie.title.toUpperCase()}
              </Text>
              {movie.tagline ? (
                <Text
                  className="mt-1 text-ink-400"
                  style={{ fontFamily: "Inter_500Medium", fontSize: 13, fontStyle: "italic" }}
                  numberOfLines={2}
                >
                  &ldquo;{movie.tagline}&rdquo;
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Watched toggle */}
        <View className="mt-6 px-5">
          <Pressable
            onPress={onToggleWatched}
            android_ripple={{ color: "#ff2e93" }}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.97 : 1 }],
              shadowColor: watched ? "#00e5ff" : "#ff2e93",
              shadowOpacity: 0.6,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 6 },
            })}
            className={`h-14 items-center justify-center overflow-hidden rounded-2xl border-2 ${
              watched ? "border-cyan-500 bg-cyan-500/10" : "border-magenta-500 bg-magenta-500/10"
            }`}
          >
            <Text
              className={watched ? "text-cyan-400" : "text-magenta-400"}
              style={{ fontFamily: "Orbitron_900Black", fontSize: 14, letterSpacing: 3 }}
            >
              {watched ? "✓  WATCHED" : "MARK AS WATCHED"}
            </Text>
          </Pressable>

          <View className="mt-3 flex-row gap-3">
            <Pressable className="flex-1 items-center rounded-xl border border-ink-600/50 bg-night-800 py-3">
              <Text
                className="text-ink-200"
                style={{ fontFamily: "Orbitron_700Bold", fontSize: 11, letterSpacing: 2 }}
              >
                + ADD TO LIST
              </Text>
            </Pressable>
            <Pressable className="flex-1 items-center rounded-xl border border-ink-600/50 bg-night-800 py-3">
              <Text
                className="text-ink-200"
                style={{ fontFamily: "Orbitron_700Bold", fontSize: 11, letterSpacing: 2 }}
              >
                ★ RATE
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Synopsis */}
        <View className="mt-8 px-5">
          <Text
            className="text-magenta-400"
            style={{ fontFamily: "JetBrainsMono_700Bold", fontSize: 11, letterSpacing: 2 }}
          >
            // SYNOPSIS
          </Text>
          <Text
            className="mt-2 text-ink-200"
            style={{ fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 22 }}
          >
            {movie.overview || "No synopsis available."}
          </Text>
          {movie.genres.length > 0 ? (
            <View className="mt-3 flex-row flex-wrap gap-2">
              {movie.genres.map((g) => (
                <View
                  key={g.id}
                  className="rounded-full border border-magenta-500/40 bg-night-800/60 px-3 py-1"
                >
                  <Text
                    className="text-ink-200"
                    style={{ fontFamily: "Inter_500Medium", fontSize: 11 }}
                  >
                    {g.name}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* Trailer */}
        <View className="mt-8 px-5">
          <Text
            className="text-cyan-400"
            style={{ fontFamily: "JetBrainsMono_700Bold", fontSize: 11, letterSpacing: 2 }}
          >
            // TRAILER
          </Text>
          <Pressable
            onPress={onPlayTrailer}
            disabled={!trailer}
            className="mt-2 h-48 items-center justify-center overflow-hidden rounded-2xl border border-cyan-500/40 bg-night-800"
          >
            <LinearGradient
              colors={["rgba(0,229,255,0.15)", "rgba(255,46,147,0.15)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: "absolute", inset: 0 }}
            />
            <View className="h-16 w-16 items-center justify-center rounded-full border-2 border-cyan-400 bg-night-950/60">
              <Text
                className="text-cyan-400"
                style={{ fontFamily: "Orbitron_900Black", fontSize: 22 }}
              >
                ▶
              </Text>
            </View>
            <Text
              className="mt-3 text-ink-400"
              style={{ fontFamily: "JetBrainsMono_400Regular", fontSize: 11, letterSpacing: 1.5 }}
              numberOfLines={1}
            >
              {trailer ? trailer.name.toUpperCase() : "NO TRAILER AVAILABLE"}
            </Text>
          </Pressable>
        </View>

        {/* Where to Watch */}
        {providers && (providers.flatrate?.length || providers.rent?.length || providers.buy?.length || providers.free?.length) ? (
          <View className="mt-8 px-5">
            <View className="flex-row items-baseline justify-between">
              <Text
                className="text-cyan-400"
                style={{ fontFamily: "JetBrainsMono_700Bold", fontSize: 11, letterSpacing: 2 }}
              >
                // WHERE TO WATCH
              </Text>
              <Text
                className="text-ink-600"
                style={{ fontFamily: "JetBrainsMono_400Regular", fontSize: 10, letterSpacing: 1.5 }}
              >
                {region}
              </Text>
            </View>

            {(["flatrate", "free", "ads", "rent", "buy"] as const).map((tier) => {
              const list = providers[tier];
              if (!list || list.length === 0) return null;
              const label =
                tier === "flatrate"
                  ? "STREAM"
                  : tier === "free"
                    ? "FREE"
                    : tier === "ads"
                      ? "FREE WITH ADS"
                      : tier === "rent"
                        ? "RENT"
                        : "BUY";
              return (
                <View key={tier} className="mt-4">
                  <Text
                    className="text-magenta-400"
                    style={{ fontFamily: "JetBrainsMono_700Bold", fontSize: 10, letterSpacing: 1.5 }}
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
                        android_ripple={{ color: "#ff2e93" }}
                        style={({ pressed }) => ({
                          transform: [{ scale: pressed ? 0.94 : 1 }],
                        })}
                      >
                        <View className="h-14 w-14 overflow-hidden rounded-xl border border-ink-600/50 bg-night-800">
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
              className="mt-4 text-ink-600"
              style={{ fontFamily: "JetBrainsMono_400Regular", fontSize: 10, letterSpacing: 1.5 }}
            >
              STREAMING DATA BY JUSTWATCH
            </Text>
          </View>
        ) : null}

        {/* Cast */}
        {cast.length > 0 ? (
          <View className="mt-8 px-5">
            <Text
              className="text-magenta-400"
              style={{ fontFamily: "JetBrainsMono_700Bold", fontSize: 11, letterSpacing: 2 }}
            >
              // CAST
            </Text>
            <View className="mt-3 flex-row flex-wrap gap-2">
              {cast.map((member) => (
                <View
                  key={member.id}
                  className="rounded-full border border-ink-600/40 bg-night-800/60 px-3 py-1.5"
                >
                  <Text
                    className="text-ink-200"
                    style={{ fontFamily: "Inter_500Medium", fontSize: 12 }}
                  >
                    {member.name}
                  </Text>
                  <Text
                    className="text-ink-600"
                    style={{ fontFamily: "Inter_400Regular", fontSize: 10 }}
                  >
                    as {member.character}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <Text
          className="mt-10 text-center text-ink-600"
          style={{ fontFamily: "JetBrainsMono_400Regular", fontSize: 10, letterSpacing: 1.5 }}
        >
          DATA BY TMDB
        </Text>
      </ScrollView>
    </View>
  );
}
