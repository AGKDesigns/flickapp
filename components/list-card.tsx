import { ImageSourcePropType, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  title: string;
  image: ImageSourcePropType;
  watched: number;
  total: number;
  onPress?: () => void;
};

export function ListCard({ title, image, watched, total, onPress }: Props) {
  const progress = Math.min(1, watched / Math.max(1, total));
  const complete = watched >= total;

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "#ff2e93", borderless: false }}
      className="mx-5 mt-5 overflow-hidden rounded-3xl"
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.98 : 1 }],
        shadowColor: "#ff2e93",
        shadowOpacity: 0.45,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
      })}
    >
      <View className="h-56 overflow-hidden rounded-3xl border border-magenta-500/40 bg-night-800">
        <Image
          source={image}
          contentFit="cover"
          style={{ position: "absolute", inset: 0 }}
        />
        <LinearGradient
          colors={[
            "rgba(7, 0, 20, 0.0)",
            "rgba(13, 4, 33, 0.55)",
            "rgba(255, 46, 147, 0.7)",
          ]}
          locations={[0, 0.55, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: "absolute", inset: 0 }}
        />
        <View className="absolute inset-0 justify-end p-5">
          <Text
            className="text-right text-white"
            style={{ fontFamily: "Orbitron_900Black", fontSize: 26, letterSpacing: 1.5 }}
            numberOfLines={2}
          >
            {title.toUpperCase()}
          </Text>

          <View className="mt-3 flex-row items-center justify-end gap-2">
            <Text
              className="text-cyan-400"
              style={{ fontFamily: "JetBrainsMono_700Bold", fontSize: 13 }}
            >
              {watched.toString().padStart(2, "0")} / {total} WATCHED
            </Text>
            {complete ? (
              <View className="rounded-md border border-sunset-400 bg-sunset-400/20 px-2 py-0.5">
                <Text
                  style={{ fontFamily: "Orbitron_700Bold", fontSize: 10 }}
                  className="text-sunset-400"
                >
                  COMPLETE
                </Text>
              </View>
            ) : null}
          </View>

          <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-night-950/60">
            <LinearGradient
              colors={["#00e5ff", "#ff2e93"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: "100%",
                width: `${Math.round(progress * 100)}%`,
              }}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}
