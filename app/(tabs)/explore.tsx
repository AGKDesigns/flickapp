import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DiscoverScreen() {
  return (
    <View className="flex-1 bg-ink-950">
      <SafeAreaView edges={["top"]} className="flex-1">
        <View className="px-5 pt-2">
          <Text className="text-3xl font-bold text-white">Discover</Text>
          <Text className="mt-1 text-base text-white/60">
            Sponsored picks, friend lists, and trending challenges
          </Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View className="rounded-2xl bg-ink-800 p-6">
            <Text className="text-white/80">Coming soon.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
