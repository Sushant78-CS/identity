import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { useAppTheme } from "@/theme/useAppTheme";

type BadgeStatus = "success" | "warning" | "danger" | "neutral" | "info";

interface AppBadgeProps {
  label: string;
  status?: BadgeStatus;
}

export function AppBadge({ label, status = "neutral" }: AppBadgeProps) {
  const { theme, resolvedTheme } = useAppTheme();
  const colors = theme.colors;

  const statusStyles = {
    success: {
      background: resolvedTheme === "dark" ? "#183126" : "#E8F5EC",
      text: colors.success,
    },
    warning: {
      background: resolvedTheme === "dark" ? "#342B19" : "#FFF4DC",
      text: colors.warning,
    },
    danger: {
      background: resolvedTheme === "dark" ? "#351F1F" : "#FCEAEA",
      text: colors.danger,
    },
    neutral: {
      background: colors.surfaceSecondary,
      text: colors.textSecondary,
    },
    info: {
      background: resolvedTheme === "dark" ? "#222B38" : "#E8EDF5",
      text: colors.textSecondary,
    },
  };

  const selectedStyle = statusStyles[status];

  return (
    <View
      className="self-start rounded-full px-3 py-1"
      style={{ backgroundColor: selectedStyle.background }}
    >
      <AppText
        variant="caption"
        style={{
          color: selectedStyle.text,
          fontWeight: "600",
        }}
      >
        {label}
      </AppText>
    </View>
  );
}
