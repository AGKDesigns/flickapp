import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ListCard } from "@/components/list-card";

const LISTS = [
  {
    id: "top-100",
    title: "Top 100 movies",
    image: require("@/assets/img/ListCardBG01.png"),
    watched: 12,
    total: 100,
  },
  {
    id: "best-horror",
    title: "Best Horror",
    image: require("@/assets/img/TheConjouring.jpg"),
    watched: 4,
    total: 25,
  },
  {
    id: "laughable",
    title: "Laughable Movies",
    image: require("@/assets/img/stepbrothers.jpeg"),
    watched: 7,
    total: 30,
  },
  {
    id: "best-2019",
    title: "Best of 2019",
    image: require("@/assets/img/parasite.jpg"),
    watched: 3,
    total: 20,
  },
];

export default function ListsScreen() {
  return (
    <View className="flex-1 bg-night-950">
      {/* Sunset glow at top */}
      <LinearGradient
        colors={["#ff2e93", "#ff5b3c", "#170933", "#070014"]}
        locations={[0, 0.18, 0.55, 1]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 380,
          opacity: 0.55,
        }}
      />

      <SafeAreaView edges={["top"]} className="flex-1">
        <View className="flex-row items-center justify-between px-5 pt-2">
          <Pressable hitSlop={14}>
            <Image
              source={require("@/assets/img/ic_hamburger.png")}
              style={{ width: 24, height: 24, tintColor: "#f5e9ff" }}
              contentFit="contain"
            />
          </Pressable>
          <Image
            source={require("@/assets/img/FlickApp_TopLogo.png")}
            style={{ width: 158, height: 74 }}
            contentFit="contain"
          />
          <Pressable hitSlop={14}>
            <Image
              source={require("@/assets/img/ic_badges.png")}
              style={{ width: 24, height: 24, tintColor: "#00e5ff" }}
              contentFit="contain"
            />
          </Pressable>
        </View>

        <View className="mt-2 px-5">
          <Text
            className="text-ink-400"
            style={{ fontFamily: "JetBrainsMono_400Regular", fontSize: 11, letterSpacing: 2 }}
          >
            // YOUR COLLECTIONS
          </Text>
          <Text
            className="mt-1 text-ink-50"
            style={{ fontFamily: "Orbitron_900Black", fontSize: 30, letterSpacing: 1 }}
          >
            MY LISTS
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
        >
          {LISTS.map((list) => (
            <ListCard
              key={list.id}
              title={list.title}
              image={list.image}
              watched={list.watched}
              total={list.total}
              onPress={() =>
                router.push({ pathname: "/list/[id]", params: { id: list.id } })
              }
            />
          ))}
          <View className="mt-10 items-center">
            <Text
              className="text-ink-600"
              style={{ fontFamily: "JetBrainsMono_400Regular", fontSize: 11, letterSpacing: 1.5 }}
            >
              MADE IN TOKYO
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
