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
