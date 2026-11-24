import { View, type ViewStyle } from "react-native";

import { useAppTheme } from "@/theme/useAppTheme";

interface AppDividerProps {
  spacing?: number;
  inset?: number;
  thickness?: number;
  style?: ViewStyle;
}

export function AppDivider({
  spacing = 12,
  inset = 0,
  thickness = 1,
  style,
}: AppDividerProps) {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        {
          height: thickness,
          backgroundColor: theme.colors.border,
          marginVertical: spacing,
          marginHorizontal: inset,
        },
        style,
      ]}
    />
  );
}
