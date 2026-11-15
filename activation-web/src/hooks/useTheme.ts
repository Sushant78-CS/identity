import { useEffect, type ReactNode } from "react";
import { useThemeStore } from "../store/themeStore";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode = useThemeStore((state) => state.mode);
  const systemDark = useThemeStore((state) => state.systemDark);
  const setSystemDark = useThemeStore((state) => state.setSystemDark);

  const isDark = mode === "system" ? systemDark : mode === "dark";

  // Listen for system appearance changes
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (event: MediaQueryListEvent) => {
      setSystemDark(event.matches);
    };

    setSystemDark(media.matches);

    media.addEventListener("change", handleChange);

    return () => {
      media.removeEventListener("change", handleChange);
    };
  }, [setSystemDark]);

  // Apply theme globally
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);

    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  }, [isDark]);

  return { children };
}

// Convenient theme hook
export function useTheme() {
  const mode = useThemeStore((state) => state.mode);
  const systemDark = useThemeStore((state) => state.systemDark);
  const setMode = useThemeStore((state) => state.setMode);

  return {
    mode,
    isDark: mode === "system" ? systemDark : mode === "dark",
    setMode,
  };
}
