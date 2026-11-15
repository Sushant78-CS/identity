import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  mode: ThemeMode;
  systemDark: boolean;

  setMode: (mode: ThemeMode) => void;
  setSystemDark: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: "system",

      systemDark:
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches,

      setMode: (mode) => set({ mode }),

      setSystemDark: (systemDark) => set({ systemDark }),
    }),
    {
      name: "identity-activation-theme",

      partialize: (state) => ({
        mode: state.mode,
      }),
    },
  ),
);
