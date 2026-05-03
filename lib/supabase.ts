import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

const isBrowser = typeof window !== "undefined";

const safeStorage = {
  getItem: async (key: string) => {
    if (!isBrowser) return null;
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (!isBrowser) return;
    return AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (!isBrowser) return;
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabasePublishableKey || "placeholder-publishable-key",
  {
    auth: {
      storage: safeStorage,
      autoRefreshToken: isSupabaseConfigured,
      persistSession: isSupabaseConfigured,
      detectSessionInUrl: false,
    },
  },
);
