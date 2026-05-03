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
        // Deep midnight ground
        night: {
          950: "#070014",
          900: "#0d0421",
          800: "#170933",
          700: "#221152",
          600: "#2e1a6b",
        },
        // Hot magenta — primary brand neon
        magenta: {
          500: "#ff2e93",
          400: "#ff5fa8",
          300: "#ff8fc1",
        },
        // Electric cyan — secondary accent / progress
        cyan: {
          500: "#00e5ff",
          400: "#5cf0ff",
        },
        // Sunset warmth — used in gradients / streaks
        sunset: {
          500: "#ff5b3c",
          400: "#ffd166",
        },
        // Text
        ink: {
          50: "#f5e9ff",
          200: "#cdb8e8",
          400: "#a795c8",
          600: "#6b5c8a",
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
      boxShadow: {
        neon: "0 0 24px rgba(255, 46, 147, 0.6)",
        "neon-cyan": "0 0 24px rgba(0, 229, 255, 0.55)",
      },
    },
  },
  plugins: [],
};
