import { View, type ViewProps, type ViewStyle } from "react-native";

import { useAppTheme } from "@/theme/useAppTheme";

interface AppCardProps extends ViewProps {
  className?: string;
  padding?: number;
  gap?: number;
  bordered?: boolean;
  style?: ViewStyle;
}

export function AppCard({
  children,
  className = "",
  padding = 16,
  gap = 0,
  bordered = true,
  style,
  ...props
}: AppCardProps) {
  const { theme } = useAppTheme();

  return (
    <View
      className={className}
      style={[
        {
          backgroundColor: theme.colors.surface,
          padding,
          gap,
          borderRadius: 16,
          borderWidth: bordered ? 1 : 0,
          borderColor: theme.colors.border,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
