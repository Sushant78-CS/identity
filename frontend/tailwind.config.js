/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  presets: [require("nativewind/preset")],

  theme: {
    extend: {
      colors: {
        identity: {
          navy: "#12233D",
          blue: "#2563EB",
          "blue-light": "#EFF6FF",

          background: "#F8FAFC",
          surface: "#FFFFFF",

          "text-primary": "#0F172A",
          "text-secondary": "#475569",
          "text-muted": "#94A3B8",

          border: "#E2E8F0",

          success: "#16A34A",
          warning: "#D97706",
          danger: "#DC2626",
          info: "#2563EB",
        },
      },
    },
  },

  plugins: [],
};
