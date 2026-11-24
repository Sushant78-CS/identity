import { useColorScheme } from "react-native";

import { useThemeStore } from "./theme.store";
import { darkTheme, lightTheme } from "./themes";

export function useAppTheme() {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  const systemColorScheme = useColorScheme();

  const resolvedTheme =
    mode === "system" ? (systemColorScheme ?? "light") : mode;

  const theme = resolvedTheme === "dark" ? darkTheme : lightTheme;

  return {
    mode,
    setMode,
    theme,
    resolvedTheme,
    isDark: resolvedTheme === "dark",
  };
}
