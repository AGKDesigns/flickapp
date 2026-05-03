import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { Trophy } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassCard } from "@/components/glass-card";
import { ListCard } from "@/components/list-card";
import {
  fetchUserListProgress,
  fetchUserLists,
  type CuratedListSummary,
} from "@/lib/lists";

export default function ListsScreen() {
  const [lists, setLists] = useState<CuratedListSummary[]>([]);
  const [progress, setProgress] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Drop completed lists — they live in the trophy room.
  const activeLists = lists.filter((l) => {
    if (l.total === 0) return true;
    return (progress.get(l.id) ?? 0) < l.total;
  });

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setError(null);

      Promise.all([
        fetchUserLists(),
        fetchUserListProgress().catch(() => new Map<string, number>()),
      ])
        .then(([data, prog]) => {
          if (cancelled) return;
          setLists(data);
          setProgress(prog);
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
        colors={["#ff2e93", "#ff5b3c", "#170933", "#050506"]}
        locations={[0, 0.18, 0.55, 1]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 420,
          opacity: 0.45,
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
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 110 }}
        >
          <View className="px-5 pb-2 pt-4">
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 15,
                color: "rgba(245,241,255,0.55)",
                letterSpacing: 0.2,
              }}
            >
              Your collections
            </Text>
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
              My Lists
            </Text>
          </View>

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
            <View className="mx-5">
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
            </View>
          ) : activeLists.length === 0 ? (
            <View className="mx-5">
              <GlassCard glow="cyan" className="p-6">
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 12,
                    letterSpacing: 1.5,
                    color: "#5cf0ff",
                  }}
                >
                  {lists.length === 0 ? "NO LISTS YET" : "ALL DONE"}
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
                  {lists.length === 0
                    ? "Find your first list"
                    : "Every list complete"}
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
                  {lists.length === 0
                    ? "Browse the Discover tab and add curated lists to start scratching off movies you've seen."
                    : "Your trophies are in the trophy room. Add another list to keep going."}
                </Text>
                <Pressable
                  onPress={() =>
                    router.push(lists.length === 0 ? "/explore" : "/trophies")
                  }
                  className="mt-5 items-center rounded-card py-3"
                  style={{
                    backgroundColor: "rgba(0,229,255,0.18)",
                    borderWidth: 0.5,
                    borderColor: "rgba(0,229,255,0.45)",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 14,
                      color: "#5cf0ff",
                      letterSpacing: 0.5,
                    }}
                  >
                    {lists.length === 0 ? "Open Discover" : "View trophies"}
                  </Text>
                </Pressable>
              </GlassCard>
            </View>
          ) : (
            activeLists.map((list) => (
              <ListCard
                key={list.id}
                title={list.title}
                coverUrl={list.cover_url}
                watched={progress.get(list.id) ?? 0}
                total={list.total}
                onPress={() =>
                  router.push({
                    pathname: "/list/[slug]",
                    params: { slug: list.slug },
                  })
                }
              />
            ))
          )}

          <View className="mt-12 items-center">
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                color: "rgba(245,241,255,0.25)",
                letterSpacing: 0.3,
              }}
            >
              Made in Tokyo
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
