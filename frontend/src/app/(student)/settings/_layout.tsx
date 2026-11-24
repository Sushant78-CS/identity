import { Stack } from "expo-router";
import { useAppTheme } from "@/theme/useAppTheme";

export default function SettingsLayout() {
  const { theme } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: "slide_from_right",
      }}
    />
  );
}
