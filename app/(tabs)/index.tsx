import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassCard } from "@/components/glass-card";
import { ListCard } from "@/components/list-card";
import { fetchUserLists, type CuratedListSummary } from "@/lib/lists";

export default function ListsScreen() {
  const [lists, setLists] = useState<CuratedListSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setError(null);

      fetchUserLists()
        .then((data) => {
          if (cancelled) return;
          setLists(data);
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
          <Pressable hitSlop={14}>
            <Image
              source={require("@/assets/img/ic_hamburger.png")}
              style={{ width: 22, height: 22, tintColor: "#f5f1ff" }}
              contentFit="contain"
            />
          </Pressable>
          <Image
            source={require("@/assets/img/FlickApp_TopLogo.png")}
            style={{ width: 132, height: 60 }}
            contentFit="contain"
          />
          <Pressable hitSlop={14}>
            <Image
              source={require("@/assets/img/ic_badges.png")}
              style={{ width: 22, height: 22, tintColor: "#5cf0ff" }}
              contentFit="contain"
            />
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
          ) : lists.length === 0 ? (
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
                  NO LISTS YET
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
                  Find your first list
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
                  Browse the Discover tab and add curated lists to start scratching off
                  movies you&apos;ve seen.
                </Text>
                <Pressable
                  onPress={() => router.push("/explore")}
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
                    Open Discover
                  </Text>
                </Pressable>
              </GlassCard>
            </View>
          ) : (
            lists.map((list) => (
              <ListCard
                key={list.id}
                title={list.title}
                coverUrl={list.cover_url}
                watched={0}
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
