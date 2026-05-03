import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DiscoverScreen() {
  return (
    <View className="flex-1 bg-night-950">
      <LinearGradient
        colors={["#00e5ff", "#ff2e93", "#170933", "#070014"]}
        locations={[0, 0.18, 0.55, 1]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 380,
          opacity: 0.45,
        }}
      />
      <SafeAreaView edges={["top"]} className="flex-1">
        <View className="px-5 pt-2">
          <Text
            className="text-ink-400"
            style={{ fontFamily: "JetBrainsMono_400Regular", fontSize: 11, letterSpacing: 2 }}
          >
            // EXPLORE
          </Text>
          <Text
            className="mt-1 text-ink-50"
            style={{ fontFamily: "Orbitron_900Black", fontSize: 30, letterSpacing: 1 }}
          >
            DISCOVER
          </Text>
          <Text
            className="mt-2 text-ink-200"
            style={{ fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21 }}
          >
            Sponsored picks, friend lists, and trending challenges.
          </Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 24 }}>
          <View className="rounded-2xl border border-cyan-500/40 bg-night-800/80 p-6">
            <Text
              className="text-cyan-400"
              style={{ fontFamily: "JetBrainsMono_700Bold", fontSize: 11, letterSpacing: 2 }}
            >
              COMING SOON
            </Text>
            <Text
              className="mt-2 text-ink-50"
              style={{ fontFamily: "Orbitron_700Bold", fontSize: 18, letterSpacing: 1 }}
            >
              CURATED FEEDS
            </Text>
            <Text
              className="mt-2 text-ink-200"
              style={{ fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20 }}
            >
              Discover lists from sponsors, follow friends to see what they&apos;re
              watching, and find new challenges to chase.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
