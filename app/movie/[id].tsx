import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MOCK_MOVIE = {
  title: "PARASITE",
  year: 2019,
  runtime: 132,
  director: "Bong Joon-ho",
  rating: 8.5,
  poster: require("@/assets/img/parasite.jpg"),
  backdrop: require("@/assets/img/parasite.jpg"),
  synopsis:
    "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
  cast: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong", "Choi Woo-shik"],
};

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [watched, setWatched] = useState(false);

  const onToggleWatched = () => {
    Haptics.impactAsync(
      watched
        ? Haptics.ImpactFeedbackStyle.Light
        : Haptics.ImpactFeedbackStyle.Heavy,
    );
    setWatched((w) => !w);
  };

  return (
    <View className="flex-1 bg-night-950">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* Backdrop */}
        <View style={{ height: 420 }}>
          <Image
            source={MOCK_MOVIE.backdrop}
            contentFit="cover"
            style={{ position: "absolute", inset: 0 }}
          />
          <LinearGradient
            colors={[
              "rgba(7, 0, 20, 0.0)",
              "rgba(13, 4, 33, 0.6)",
              "rgba(7, 0, 20, 1)",
            ]}
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

        {/* Title block, lifted over backdrop */}
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
              <Image
                source={MOCK_MOVIE.poster}
                contentFit="cover"
                style={{ flex: 1 }}
              />
            </View>
            <View className="flex-1 pb-1">
              <Text
                className="text-cyan-400"
                style={{
                  fontFamily: "JetBrainsMono_700Bold",
                  fontSize: 11,
                  letterSpacing: 2,
                }}
              >
                {MOCK_MOVIE.year} · {MOCK_MOVIE.runtime}MIN · ★{" "}
                {MOCK_MOVIE.rating}
              </Text>
              <Text
                className="mt-1 text-ink-50"
                style={{
                  fontFamily: "Orbitron_900Black",
                  fontSize: 28,
                  letterSpacing: 1,
                }}
                numberOfLines={2}
              >
                {MOCK_MOVIE.title}
              </Text>
              <Text
                className="mt-1 text-ink-400"
                style={{ fontFamily: "Inter_500Medium", fontSize: 13 }}
              >
                Dir. {MOCK_MOVIE.director}
              </Text>
              <Text
                className="mt-1 text-ink-600"
                style={{ fontFamily: "JetBrainsMono_400Regular", fontSize: 10 }}
              >
                ID: {id}
              </Text>
            </View>
          </View>
        </View>

        {/* Watched toggle — the star of the show */}
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
              watched
                ? "border-cyan-500 bg-cyan-500/10"
                : "border-magenta-500 bg-magenta-500/10"
            }`}
          >
            <Text
              className={watched ? "text-cyan-400" : "text-magenta-400"}
              style={{
                fontFamily: "Orbitron_900Black",
                fontSize: 14,
                letterSpacing: 3,
              }}
            >
              {watched ? "✓  WATCHED" : "MARK AS WATCHED"}
            </Text>
          </Pressable>

          <View className="mt-3 flex-row gap-3">
            <Pressable className="flex-1 items-center rounded-xl border border-ink-600/50 bg-night-800 py-3">
              <Text
                className="text-ink-200"
                style={{
                  fontFamily: "Orbitron_700Bold",
                  fontSize: 11,
                  letterSpacing: 2,
                }}
              >
                + ADD TO LIST
              </Text>
            </Pressable>
            <Pressable className="flex-1 items-center rounded-xl border border-ink-600/50 bg-night-800 py-3">
              <Text
                className="text-ink-200"
                style={{
                  fontFamily: "Orbitron_700Bold",
                  fontSize: 11,
                  letterSpacing: 2,
                }}
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
            style={{
              fontFamily: "JetBrainsMono_700Bold",
              fontSize: 11,
              letterSpacing: 2,
            }}
          >
            // SYNOPSIS
          </Text>
          <Text
            className="mt-2 text-ink-200"
            style={{ fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 22 }}
          >
            {MOCK_MOVIE.synopsis}
          </Text>
        </View>

        {/* Trailer placeholder */}
        <View className="mt-8 px-5">
          <Text
            className="text-cyan-400"
            style={{
              fontFamily: "JetBrainsMono_700Bold",
              fontSize: 11,
              letterSpacing: 2,
            }}
          >
            // TRAILER
          </Text>
          <View
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
            >
              YOUTUBE EMBED — TBD
            </Text>
          </View>
        </View>

        {/* Cast */}
        <View className="mt-8 px-5">
          <Text
            className="text-magenta-400"
            style={{
              fontFamily: "JetBrainsMono_700Bold",
              fontSize: 11,
              letterSpacing: 2,
            }}
          >
            // CAST
          </Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {MOCK_MOVIE.cast.map((name) => (
              <View
                key={name}
                className="rounded-full border border-ink-600/40 bg-night-800/60 px-3 py-1.5"
              >
                <Text
                  className="text-ink-200"
                  style={{ fontFamily: "Inter_500Medium", fontSize: 12 }}
                >
                  {name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
