import { Linking, Pressable, Text, View } from "react-native";

// Web fallback — react-native-youtube-iframe pulls in react-native-web-webview
// which isn't compatible with our setup. On web we just show a tile that
// opens the trailer in a new tab.
type Props = {
  videoId: string;
  width: number;
  height: number;
  onEnd?: () => void;
};

export function TrailerPlayer({ videoId, width, height }: Props) {
  return (
    <Pressable
      onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${videoId}`)}
      style={{
        width,
        height,
        backgroundColor: "#000",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 14,
          color: "#5cf0ff",
          letterSpacing: 0.5,
        }}
      >
        Open trailer on YouTube ↗
      </Text>
    </Pressable>
  );
}
