export const colors = {
  brand: {
    navy: "#12233D",
    blue: "#2563EB",
    blueLight: "#EFF6FF",
  },

  background: {
    primary: "#F8FAFC",
    secondary: "#F1F5F9",
    elevated: "#FFFFFF",
  },

  surface: {
    primary: "#FFFFFF",
    secondary: "#F8FAFC",
    tertiary: "#F1F5F9",
  },

  text: {
    primary: "#0F172A",
    secondary: "#475569",
    muted: "#94A3B8",
    inverse: "#FFFFFF",
  },

  border: {
    default: "#E2E8F0",
    strong: "#CBD5E1",
    focus: "#2563EB",
  },

  status: {
    success: "#16A34A",
    successBackground: "#F0FDF4",

    warning: "#D97706",
    warningBackground: "#FFFBEB",

    danger: "#DC2626",
    dangerBackground: "#FEF2F2",

    info: "#2563EB",
    infoBackground: "#EFF6FF",
  },

  common: {
    white: "#FFFFFF",
    black: "#000000",
    transparent: "transparent",
  },
} as const;

export type ColorPalette = typeof colors;
