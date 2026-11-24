import { ArrowLeft, type LucideIcon } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { useAppTheme } from "@/theme/useAppTheme";

interface HeaderAction {
  icon: LucideIcon;
  onPress: () => void;
  accessibilityLabel: string;
}

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  actions?: HeaderAction[];
}

export function AppHeader({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  actions = [],
}: AppHeaderProps) {
  const { theme } = useAppTheme();
  const colors = theme.colors;

  return (
    <View className="flex-row items-center justify-between py-3">
      <View className="flex-row items-center flex-1">
        {showBack && (
          <Pressable
            onPress={onBackPress}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={10}
            className="mr-4"
          >
            <ArrowLeft size={24} color={colors.textPrimary} />
          </Pressable>
        )}

        <View className="flex-1">
          <AppText variant="h2">{title}</AppText>

          {subtitle && (
            <AppText variant="caption" color="secondary" className="mt-1">
              {subtitle}
            </AppText>
          )}
        </View>
      </View>

      {actions.length > 0 && (
        <View className="flex-row items-center gap-5 ml-3">
          {actions.map((action, index) => {
            const Icon = action.icon;

            return (
              <Pressable
                key={`${action.accessibilityLabel}-${index}`}
                onPress={action.onPress}
                accessibilityRole="button"
                accessibilityLabel={action.accessibilityLabel}
                hitSlop={10}
              >
                <Icon size={22} color={colors.textPrimary} />
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}
