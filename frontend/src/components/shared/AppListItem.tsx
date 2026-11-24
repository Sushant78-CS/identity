import { ChevronRight, type LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, View, type ViewStyle } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { useAppTheme } from "@/theme/useAppTheme";

interface AppListItemProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  rightElement?: ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function AppListItem({
  title,
  subtitle,
  icon: Icon,
  rightElement,
  showChevron = false,
  onPress,
  style,
}: AppListItemProps) {
  const { theme } = useAppTheme();
  const colors = theme.colors;

  const content = (
    <View className="flex-row items-center py-3" style={style}>
      {Icon && (
        <View className="mr-4">
          <Icon size={22} color={colors.textSecondary} />
        </View>
      )}

      <View className="flex-1">
        <AppText variant="bodyMedium">{title}</AppText>

        {subtitle && (
          <AppText variant="caption" color="secondary" className="mt-1">
            {subtitle}
          </AppText>
        )}
      </View>

      {rightElement}

      {showChevron && (
        <ChevronRight
          size={20}
          color={colors.textMuted}
          style={{ marginLeft: 8 }}
        />
      )}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({
        opacity: pressed ? 0.65 : 1,
      })}
    >
      {content}
    </Pressable>
  );
}
