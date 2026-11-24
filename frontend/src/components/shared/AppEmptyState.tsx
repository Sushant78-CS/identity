import { Inbox, type LucideIcon } from "lucide-react-native";
import { View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { useAppTheme } from "@/theme/useAppTheme";

interface AppEmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export function AppEmptyState({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
}: AppEmptyStateProps) {
  const { theme } = useAppTheme();
  const colors = theme.colors;

  return (
    <View className="flex-1 items-center justify-center px-6 py-10">
      <View
        className="h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: colors.surfaceSecondary }}
      >
        <Icon size={28} color={colors.textSecondary} />
      </View>

      <AppText variant="h3" className="mt-5 text-center">
        {title}
      </AppText>

      {description && (
        <AppText
          variant="bodyMedium"
          color="secondary"
          className="mt-2 text-center"
        >
          {description}
        </AppText>
      )}

      {actionLabel && onAction && (
        <AppButton
          title={actionLabel}
          onPress={onAction}
          variant="outline"
          className="mt-6"
        />
      )}
    </View>
  );
}
