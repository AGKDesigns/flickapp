import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Compass, Library, Sparkles } from "lucide-react-native";
import { Platform, StyleSheet, View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";

function TabBarBackground() {
  if (Platform.OS === "ios") {
    return (
      <BlurView
        tint="dark"
        intensity={80}
        style={StyleSheet.absoluteFill}
      />
    );
  }
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: "rgba(10,10,12,0.94)" },
      ]}
    />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarActiveTintColor: "#ff2e93",
        tabBarInactiveTintColor: "#8a849c",
        tabBarLabelStyle: {
          fontFamily: "Inter_600SemiBold",
          fontSize: 11,
          letterSpacing: 0.2,
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Tonight",
          tabBarIcon: ({ color }) => (
            <Sparkles size={22} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          title: "Lists",
          tabBarIcon: ({ color }) => (
            <Library size={22} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Discover",
          tabBarIcon: ({ color }) => (
            <Compass size={22} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
