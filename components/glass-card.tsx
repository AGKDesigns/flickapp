import { BlurView } from "expo-blur";
import { Platform, View, type ViewProps } from "react-native";

type Props = ViewProps & {
  intensity?: number;
  glow?: "none" | "magenta" | "cyan";
  className?: string;
};

export function GlassCard({
  intensity = 24,
  glow = "none",
  className = "",
  style,
  children,
  ...rest
}: Props) {
  const glowColor =
    glow === "magenta" ? "#ff2e93" : glow === "cyan" ? "#00e5ff" : "transparent";

  const shadowStyle =
    glow === "none"
      ? {}
      : {
          shadowColor: glowColor,
          shadowOpacity: 0.35,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
        };

  // BlurView only blurs over real content on iOS; on Android/web fall back
  // to a translucent fill so we still get the layered look.
  if (Platform.OS === "ios") {
    return (
      <View
        className={`overflow-hidden rounded-card ${className}`}
        style={[shadowStyle, style]}
        {...rest}
      >
        <BlurView intensity={intensity} tint="dark" style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              borderWidth: 0.5,
              borderColor: "rgba(255,255,255,0.08)",
              borderRadius: 16,
            }}
          >
            {children}
          </View>
        </BlurView>
      </View>
    );
  }

  return (
    <View
      className={`overflow-hidden rounded-card ${className}`}
      style={[
        {
          backgroundColor: "rgba(255,255,255,0.06)",
          borderWidth: 0.5,
          borderColor: "rgba(255,255,255,0.08)",
        },
        shadowStyle,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
