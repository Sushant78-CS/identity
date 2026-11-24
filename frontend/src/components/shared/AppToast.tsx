import {
  CheckCircle2,
  CircleAlert,
  Info,
  TriangleAlert,
} from "lucide-react-native";
import { useEffect } from "react";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { useAppTheme } from "@/theme/useAppTheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ToastType = "success" | "error" | "warning" | "info";

interface AppToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide: () => void;
}

const icons = {
  success: CheckCircle2,
  error: CircleAlert,
  warning: TriangleAlert,
  info: Info,
};

export function AppToast({
  visible,
  message,
  type = "success",
  duration = 3000,
  onHide,
}: AppToastProps) {
  const { theme } = useAppTheme();
  const colors = theme.colors;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!visible) return;

    const timeout = setTimeout(onHide, duration);

    return () => clearTimeout(timeout);
  }, [visible, duration, onHide]);

  if (!visible) return null;

  const Icon = icons[type];

  const iconColors = {
    success: colors.success,
    error: colors.danger,
    warning: colors.warning,
    info: colors.textPrimary,
  };

  return (
    <View
      className="absolute left-4 right-4 z-50 flex-row items-center rounded-2xl px-4 py-4"
      style={{
        top: insets.top + 12,
        backgroundColor: colors.surfaceSecondary,
        borderWidth: 1,
        borderColor: colors.border,
        elevation: 8,
      }}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Icon size={22} color={iconColors[type]} />

      <AppText variant="bodyMedium" className="ml-3 flex-1">
        {message}
      </AppText>
    </View>
  );
}
