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
  onToggleWatched?: () => void;
};

export function MovieCard({
  title,
  posterPath,
  voteAverage,
  watched = false,
  onPress,
  onToggleWatched,
}: Props) {
  const url = posterUrl(posterPath, "w342");

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "rgba(255,46,147,0.25)" }}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
      className="mb-5 w-[48%]"
    >
      <View
        className="aspect-[2/3] overflow-hidden rounded-card bg-night-900"
        style={{
          borderWidth: 0.5,
          borderColor: watched ? "rgba(0,229,255,0.35)" : "rgba(255,255,255,0.08)",
          shadowColor: watched ? "#00e5ff" : "#000",
          shadowOpacity: watched ? 0.35 : 0.45,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
        }}
      >
        {url ? (
          <Image
            source={{ uri: url }}
            contentFit="cover"
            style={{
              flex: 1,
              opacity: watched ? 0.45 : 1,
            }}
            transition={200}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text
              style={{ fontFamily: "Inter_500Medium", fontSize: 11, color: "rgba(245,241,255,0.4)" }}
            >
              No poster
            </Text>
          </View>
        )}

        {/* Quick-watch toggle in top-right — tap to mark/unmark without opening detail */}
        {onToggleWatched ? (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onToggleWatched();
            }}
            hitSlop={8}
            className="absolute right-2 top-2 h-9 w-9 items-center justify-center rounded-full"
            style={({ pressed }) => ({
              backgroundColor: watched ? "rgba(0,229,255,0.95)" : "rgba(5,5,6,0.7)",
              borderWidth: 0.5,
              borderColor: watched ? "rgba(0,229,255,1)" : "rgba(255,255,255,0.18)",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                lineHeight: 18,
                color: watched ? "#050506" : "#f5f1ff",
              }}
            >
              {watched ? "✓" : "+"}
            </Text>
          </Pressable>
        ) : watched ? (
          <View
            className="absolute right-2 top-2 h-7 w-7 items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(0,229,255,0.95)" }}
          >
            <Text
              style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#050506" }}
            >
              ✓
            </Text>
          </View>
        ) : null}

        <View
          className="absolute left-2 top-2 rounded-full px-2 py-0.5"
          style={{ backgroundColor: "rgba(5,5,6,0.7)" }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 11,
              color: "#ffd166",
            }}
          >
            ★ {voteAverage.toFixed(1)}
          </Text>
        </View>
      </View>
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 14,
          color: "#f5f1ff",
          marginTop: 8,
        }}
        numberOfLines={2}
      >
        {title}
      </Text>
    </Pressable>
  );
}
