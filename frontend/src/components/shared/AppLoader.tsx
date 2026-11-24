import { ActivityIndicator, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { useAppTheme } from "@/theme/useAppTheme";

interface AppLoaderProps {
  message?: string;
  fullScreen?: boolean;
  size?: "small" | "large";
}

export function AppLoader({
  message = "Please wait...",
  fullScreen = false,
  size = "large",
}: AppLoaderProps) {
  const { theme } = useAppTheme();
  const colors = theme.colors;

  return (
    <View
      className="items-center justify-center"
      style={[
        fullScreen && {
          flex: 1,
          backgroundColor: colors.background,
        },
      ]}
    >
      <ActivityIndicator size={size} color={colors.textPrimary} />

      {message && (
        <AppText variant="caption" color="secondary" className="mt-3">
          {message}
        </AppText>
      )}
    </View>
  );
}
