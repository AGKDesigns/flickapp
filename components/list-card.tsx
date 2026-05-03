import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, View } from "react-native";

type Props = {
  title: string;
  coverUrl: string | null;
  watched: number;
  total: number;
  onPress?: () => void;
};

export function ListCard({ title, coverUrl, watched, total, onPress }: Props) {
  const progress = total === 0 ? 0 : Math.min(1, watched / total);
  const complete = total > 0 && watched >= total;

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "rgba(255,46,147,0.25)", borderless: false }}
      className="mx-5 mt-4"
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.985 : 1 }],
      })}
    >
      <View
        className="h-56 overflow-hidden rounded-sheet bg-night-900"
        style={{
          borderWidth: 0.5,
          borderColor: "rgba(255,255,255,0.08)",
          shadowColor: complete ? "#00e5ff" : "#ff2e93",
          shadowOpacity: 0.35,
          shadowRadius: 22,
          shadowOffset: { width: 0, height: 10 },
        }}
      >
        {coverUrl ? (
          <Image
            source={{ uri: coverUrl }}
            contentFit="cover"
            style={{ position: "absolute", inset: 0 }}
            transition={250}
          />
        ) : (
          <LinearGradient
            colors={["#221152", "#170933", "#050506"]}
            style={{ position: "absolute", inset: 0 }}
          />
        )}
        <LinearGradient
          colors={[
            "rgba(5,5,6,0.0)",
            "rgba(5,5,6,0.55)",
            "rgba(5,5,6,0.95)",
          ]}
          locations={[0, 0.55, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ position: "absolute", inset: 0 }}
        />

        <View className="absolute inset-0 justify-end p-5">
          <Text
            style={{
              fontFamily: "Orbitron_700Bold",
              fontSize: 24,
              letterSpacing: 0.5,
              color: "#f5f1ff",
            }}
            numberOfLines={2}
          >
            {title}
          </Text>

          <View className="mt-2 flex-row items-center gap-2">
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 13,
                color: "rgba(245,241,255,0.75)",
              }}
            >
              {total === 0
                ? "Coming soon"
                : `${watched} of ${total} watched`}
            </Text>
            {complete ? (
              <View className="rounded-full bg-cyan-500/20 px-2 py-0.5">
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 10,
                    letterSpacing: 0.5,
                    color: "#5cf0ff",
                  }}
                >
                  COMPLETE
                </Text>
              </View>
            ) : null}
          </View>

          {total > 0 ? (
            <View
              className="mt-3 h-1 overflow-hidden rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.10)" }}
            >
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
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
