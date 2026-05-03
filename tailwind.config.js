/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Cinematic dark ground — no pure #000 (OLED smear)
        night: {
          950: "#050506",
          900: "#0a0a0c",
          800: "#101015",
          700: "#16161e",
          600: "#1d1d28",
        },
        // Translucent surface tones (use with /n opacity in classes)
        surface: {
          DEFAULT: "rgba(255,255,255,0.05)",
          raised: "rgba(255,255,255,0.07)",
          high: "rgba(255,255,255,0.10)",
        },
        // Synthwave accents — used for glow + state, not as solid backgrounds
        magenta: {
          500: "#ff2e93",
          400: "#ff5fa8",
          300: "#ff8fc1",
        },
        cyan: {
          500: "#00e5ff",
          400: "#5cf0ff",
        },
        sunset: {
          500: "#ff5b3c",
          400: "#ffd166",
        },
        // Foreground / text scale
        ink: {
          50: "#f5f1ff",
          100: "#e6dff5",
          200: "#c8c1d9",
          400: "#8a849c",
          600: "#5a5567",
          800: "#2a2731",
        },
      },
      fontFamily: {
        display: ["Orbitron_700Bold"],
        displayBlack: ["Orbitron_900Black"],
        body: ["Inter_400Regular"],
        bodyMedium: ["Inter_500Medium"],
        bodySemibold: ["Inter_600SemiBold"],
        mono: ["JetBrainsMono_400Regular"],
        monoBold: ["JetBrainsMono_700Bold"],
      },
      borderWidth: {
        hairline: "0.5",
      },
      borderRadius: {
        card: "16px",
        sheet: "24px",
      },
    },
  },
  plugins: [],
};
