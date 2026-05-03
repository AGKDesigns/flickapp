import { Tabs } from "expo-router";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: "#ff2e93",
        tabBarInactiveTintColor: "#6b5c8a",
        tabBarLabelStyle: {
          fontFamily: "JetBrainsMono_700Bold",
          fontSize: 10,
          letterSpacing: 1.5,
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: "#070014",
          borderTopColor: "rgba(255, 46, 147, 0.25)",
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "LISTS",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="list.bullet" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "DISCOVER",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="sparkles" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
