import { Image } from "expo-image";
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
    <View className="flex-1 bg-ink-950">
      <Image
        source={require("@/assets/img/BGGrad.png")}
        contentFit="cover"
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 280 }}
      />
      <SafeAreaView edges={["top"]} className="flex-1">
        <View className="flex-row items-center justify-between px-5 pt-2">
          <Pressable hitSlop={12}>
            <Image
              source={require("@/assets/img/ic_hamburger.png")}
              style={{ width: 24, height: 24 }}
            />
          </Pressable>
          <Image
            source={require("@/assets/img/FlickApp_TopLogo.png")}
            style={{ width: 158, height: 74 }}
            contentFit="contain"
          />
          <Pressable hitSlop={12}>
            <Image
              source={require("@/assets/img/ic_badges.png")}
              style={{ width: 24, height: 24 }}
            />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {LISTS.map((list) => (
            <ListCard
              key={list.id}
              title={list.title}
              image={list.image}
              watched={list.watched}
              total={list.total}
            />
          ))}
          <View className="mt-8 items-center">
            <Text className="text-sm text-white/40">Made with ❤️ in Tokyo</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
