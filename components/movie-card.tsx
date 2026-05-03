import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

import { posterUrl } from "@/lib/tmdb";

type Props = {
  id: number;
  title: string;
  posterPath: string | null;
  voteAverage: number;
  watched?: boolean;
  onPress?: () => void;
};

export function MovieCard({
  title,
  posterPath,
  voteAverage,
  watched = false,
  onPress,
}: Props) {
  const url = posterUrl(posterPath, "w342");

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "#ff2e93" }}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
      className="mb-4 w-[48%]"
    >
      <View
        className={`aspect-[2/3] overflow-hidden rounded-xl border ${
          watched
            ? "border-cyan-500/70"
            : "border-magenta-500/30"
        } bg-night-800`}
        style={{
          shadowColor: watched ? "#00e5ff" : "#ff2e93",
          shadowOpacity: watched ? 0.5 : 0.3,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
        }}
      >
        {url ? (
          <Image
            source={{ uri: url }}
            contentFit="cover"
            style={{
              flex: 1,
              opacity: watched ? 0.5 : 1,
            }}
            transition={200}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text
              className="text-ink-600"
              style={{ fontFamily: "JetBrainsMono_400Regular", fontSize: 10 }}
            >
              NO POSTER
            </Text>
          </View>
        )}

        {watched ? (
          <View className="absolute right-2 top-2 h-7 w-7 items-center justify-center rounded-full border border-cyan-400 bg-night-950/80">
            <Text
              className="text-cyan-400"
              style={{ fontFamily: "Orbitron_900Black", fontSize: 12 }}
            >
              ✓
            </Text>
          </View>
        ) : null}

        <View className="absolute left-2 top-2 rounded-md border border-sunset-400/60 bg-night-950/80 px-1.5 py-0.5">
          <Text
            className="text-sunset-400"
            style={{ fontFamily: "JetBrainsMono_700Bold", fontSize: 10 }}
          >
            ★ {voteAverage.toFixed(1)}
          </Text>
        </View>
      </View>
      <Text
        className="mt-1.5 text-ink-50"
        style={{ fontFamily: "Inter_600SemiBold", fontSize: 13 }}
        numberOfLines={2}
      >
        {title}
      </Text>
    </Pressable>
  );
}
