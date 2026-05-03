import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { Trophy } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassCard } from "@/components/glass-card";
import {
  fetchUserListProgress,
  fetchUserLists,
  type CuratedListSummary,
} from "@/lib/lists";

type CompletedList = CuratedListSummary & { watched: number };

export default function TrophiesScreen() {
  const [completed, setCompleted] = useState<CompletedList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setError(null);

      Promise.all([fetchUserLists(), fetchUserListProgress()])
        .then(([lists, progress]) => {
          if (cancelled) return;
          const done = lists
            .map((l) => ({ ...l, watched: progress.get(l.id) ?? 0 }))
            .filter((l) => l.total > 0 && l.watched >= l.total);
          setCompleted(done);
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
    }, []),
  );

  return (
    <View className="flex-1 bg-night-950">
      <LinearGradient
        colors={["#ffd166", "#ff5b3c", "#170933", "#050506"]}
        locations={[0, 0.18, 0.55, 1]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 380,
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
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 18, color: "#f5f1ff" }}>
              ←
            </Text>
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 110 }}
        >
          <View className="flex-row items-center gap-3">
            <Trophy size={28} color="#ffd166" strokeWidth={2.2} />
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 15,
                color: "rgba(245,241,255,0.55)",
                letterSpacing: 0.2,
              }}
            >
              Trophy room
            </Text>
          </View>
          <Text
            style={{
              fontFamily: "Orbitron_900Black",
              fontSize: 34,
              lineHeight: 41,
              letterSpacing: 0.5,
              color: "#f5f1ff",
              marginTop: 4,
            }}
          >
            Lists Completed
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 15,
              lineHeight: 22,
              color: "rgba(245,241,255,0.7)",
              marginTop: 8,
            }}
          >
            Every list you&apos;ve scratched off in full. Your movie life,
            one trophy at a time.
          </Text>

          <View className="mt-6">
            {loading ? (
              <View className="items-center py-16">
                <ActivityIndicator color="#ffd166" />
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
            ) : completed.length === 0 ? (
              <GlassCard glow="cyan" className="p-6">
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 12,
                    letterSpacing: 1.5,
                    color: "#5cf0ff",
                  }}
                >
                  EMPTY ROOM
                </Text>
                <Text
                  style={{
                    fontFamily: "Orbitron_700Bold",
                    fontSize: 22,
                    lineHeight: 28,
                    letterSpacing: 0.3,
                    color: "#f5f1ff",
                    marginTop: 6,
                  }}
                >
                  No trophies yet
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
                  Complete a list — every movie scratched off — and it lands
                  here as a trophy.
                </Text>
              </GlassCard>
            ) : (
              <View className="flex-row flex-wrap justify-between">
                {completed.map((list) => (
                  <TrophyTile
                    key={list.id}
                    list={list}
                    onPress={() =>
                      router.push({
                        pathname: "/list/[slug]",
                        params: { slug: list.slug },
                      })
                    }
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function TrophyTile({
  list,
  onPress,
}: {
  list: CompletedList;
  onPress: () => void;
}) {
  const cover = list.cover_url;
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "rgba(255,209,102,0.25)" }}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
      className="mb-4 w-[48%]"
    >
      <View
        className="aspect-square overflow-hidden rounded-card bg-night-900"
        style={{
          borderWidth: 0.5,
          borderColor: "rgba(255,209,102,0.45)",
          shadowColor: "#ffd166",
          shadowOpacity: 0.4,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
        }}
      >
        {cover ? (
          <Image
            source={{ uri: cover }}
            contentFit="cover"
            style={{ flex: 1, opacity: 0.55 }}
            transition={200}
          />
        ) : (
          <LinearGradient
            colors={["#221152", "#170933", "#050506"]}
            style={{ flex: 1 }}
          />
        )}
        <LinearGradient
          colors={["rgba(5,5,6,0.0)", "rgba(5,5,6,0.85)"]}
          locations={[0, 1]}
          style={{ position: "absolute", inset: 0 }}
        />
        <View
          className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: "rgba(255,209,102,0.95)" }}
        >
          <Trophy size={14} color="#050506" strokeWidth={2.5} />
        </View>
        <View className="absolute inset-0 justify-end p-3">
          <Text
            style={{
              fontFamily: "Orbitron_700Bold",
              fontSize: 13,
              lineHeight: 16,
              letterSpacing: 0.3,
              color: "#f5f1ff",
            }}
            numberOfLines={2}
          >
            {list.title}
          </Text>
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 11,
              color: "#ffd166",
              marginTop: 2,
            }}
          >
            {list.total} of {list.total} watched
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

