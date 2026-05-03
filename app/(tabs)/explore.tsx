import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassCard } from "@/components/glass-card";

export default function DiscoverScreen() {
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
            Sponsored picks, friend lists, and trending challenges.
          </Text>

          <GlassCard glow="cyan" className="mt-8 p-6">
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 11,
                letterSpacing: 1.5,
                color: "#5cf0ff",
              }}
            >
              COMING SOON
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
              Curated feeds
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
              Discover lists from sponsors, follow friends to see what
              they&apos;re watching, and find new challenges to chase.
            </Text>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
