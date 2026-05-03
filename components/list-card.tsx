import { ImageSourcePropType } from "react-native";
import { Image } from "expo-image";
import { Pressable, View, Text } from "react-native";

type Props = {
  title: string;
  image: ImageSourcePropType;
  watched: number;
  total: number;
  onPress?: () => void;
};

export function ListCard({ title, image, watched, total, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="mx-4 mt-6 h-52 overflow-hidden rounded-2xl bg-ink-900"
    >
      <Image source={image} contentFit="cover" style={{ flex: 1 }} />
      <View className="absolute inset-0 bg-black/40" />
      <View className="absolute inset-0 justify-end p-5">
        <Text className="text-right text-3xl font-bold text-white">
          {title}
        </Text>
        <Text className="mt-1 text-right text-base font-semibold text-white/90">
          {watched} / {total} Watched
        </Text>
      </View>
    </Pressable>
  );
}
