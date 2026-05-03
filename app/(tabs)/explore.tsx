import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
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
  fetchDiscoverLists,
  removeListFromUser,
  type DiscoverList,
} from "@/lib/lists";

export default function DiscoverScreen() {
  const [lists, setLists] = useState<DiscoverList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setError(null);

      fetchDiscoverLists()
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

  const toggle = async (list: DiscoverList) => {
    if (busyIds.has(list.id)) return;
    Haptics.impactAsync(
      list.isAdded
        ? Haptics.ImpactFeedbackStyle.Light
        : Haptics.ImpactFeedbackStyle.Medium,
    );

    // Optimistic flip
    const wasAdded = list.isAdded;
    setLists((curr) =>
      curr.map((l) => (l.id === list.id ? { ...l, isAdded: !wasAdded } : l)),
    );
    setBusyIds((s) => new Set(s).add(list.id));

    try {
      if (wasAdded) {
        await removeListFromUser(list.id);
      } else {
        await addListToUser(list.id);
      }
    } catch (err) {
      // Revert on error
      setLists((curr) =>
        curr.map((l) => (l.id === list.id ? { ...l, isAdded: wasAdded } : l)),
      );
      console.warn(`[discover] toggle failed: ${(err as Error).message}`);
    } finally {
      setBusyIds((s) => {
        const next = new Set(s);
        next.delete(list.id);
        return next;
      });
    }
  };

  return (
    <View className="flex-1 bg-night-950">
      <LinearGradient
        colors={["#00e5ff", "#ff2e93", "#170933", "#050506"]}
        locations={[0, 0.2, 0.55, 1]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 420,
          opacity: 0.35,
        }}
      />
      <SafeAreaView edges={["top"]} className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 110 }}
        >
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 15,
              color: "rgba(245,241,255,0.55)",
              letterSpacing: 0.2,
            }}
          >
            Explore
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
            Discover
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 16,
              lineHeight: 22,
              color: "rgba(245,241,255,0.7)",
              marginTop: 8,
            }}
          >
            Curated lists from FlickApp. Add any you want to scratch off.
          </Text>

          <View className="mt-6">
            {loading ? (
              <View className="items-center py-12">
                <ActivityIndicator color="#ff2e93" />
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
              lists.map((list) => (
                <DiscoverListRow
                  key={list.id}
                  list={list}
                  busy={busyIds.has(list.id)}
                  onToggle={() => toggle(list)}
                  onOpen={() =>
                    router.push({
                      pathname: "/list/[slug]",
                      params: { slug: list.slug },
                    })
                  }
                />
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

type RowProps = {
  list: DiscoverList;
  busy: boolean;
  onToggle: () => void;
  onOpen: () => void;
};

function DiscoverListRow({ list, busy, onToggle, onOpen }: RowProps) {
  return (
    <Pressable
      onPress={onOpen}
      android_ripple={{ color: "rgba(255,46,147,0.2)" }}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
      className="mb-3 overflow-hidden rounded-card"
    >
      <View
        className="flex-row gap-3 bg-night-900 p-3"
        style={{
          borderWidth: 0.5,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <View
          className="h-20 w-32 overflow-hidden rounded-card bg-night-800"
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
              transition={200}
            />
          ) : (
            <LinearGradient
              colors={["#221152", "#170933", "#050506"]}
              style={{ flex: 1 }}
            />
          )}
        </View>

        <View className="flex-1 justify-between py-1">
          <View>
            <Text
              style={{
                fontFamily: "Orbitron_700Bold",
                fontSize: 15,
                lineHeight: 19,
                letterSpacing: 0.2,
                color: "#f5f1ff",
              }}
              numberOfLines={1}
            >
              {list.title}
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                lineHeight: 16,
                color: "rgba(245,241,255,0.55)",
                marginTop: 2,
              }}
              numberOfLines={2}
            >
              {list.description ?? ""}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 11,
              color: "rgba(245,241,255,0.45)",
              letterSpacing: 0.3,
            }}
          >
            {list.total === 0 ? "Coming soon" : `${list.total} movies`}
          </Text>
        </View>

        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          disabled={busy}
          hitSlop={8}
          className="h-9 w-9 items-center justify-center self-center rounded-full"
          style={({ pressed }) => ({
            backgroundColor: list.isAdded
              ? "rgba(0,229,255,0.18)"
              : "rgba(255,46,147,0.18)",
            borderWidth: 0.5,
            borderColor: list.isAdded
              ? "rgba(0,229,255,0.5)"
              : "rgba(255,46,147,0.5)",
            opacity: pressed || busy ? 0.6 : 1,
          })}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 16,
              lineHeight: 18,
              color: list.isAdded ? "#5cf0ff" : "#ff5fa8",
            }}
          >
            {list.isAdded ? "✓" : "+"}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
