import "../global.css";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import {
  Orbitron_700Bold,
  Orbitron_900Black,
} from "@expo-google-fonts/orbitron";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_700Bold,
} from "@expo-google-fonts/jetbrains-mono";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import "react-native-reanimated";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { useSessionStore } from "@/store/session";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const setSession = useSessionStore((s) => s.setSession);
  const setInitialized = useSessionStore((s) => s.setInitialized);

  const [fontsLoaded] = useFonts({
    Orbitron_700Bold,
    Orbitron_900Black,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setInitialized(true);
      return;
    }

    let cancelled = false;

    (async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        if (!cancelled) {
          setSession(data.session);
          setInitialized(true);
        }
        return;
      }

      // No session yet — sign in anonymously so progress saves immediately.
      // The user can claim this account later by linking email / OAuth.
      const { data: anon, error } = await supabase.auth.signInAnonymously();
      if (cancelled) return;
      if (error) {
        console.warn("[supabase] anonymous sign-in failed:", error.message);
      } else {
        setSession(anon.session);
      }
      setInitialized(true);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!cancelled) setSession(session);
      },
    );

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, [setSession, setInitialized]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="movie/[id]"
          options={{ presentation: "card", animation: "slide_from_bottom" }}
        />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
