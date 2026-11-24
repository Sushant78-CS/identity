import { Switch, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { useAppTheme } from "@/theme/useAppTheme";

interface AppSwitchProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function AppSwitch({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
}: AppSwitchProps) {
  const { theme } = useAppTheme();
  const colors = theme.colors;

  return (
    <View className="flex-row items-center justify-between py-2">
      <View className="flex-1 mr-4">
        <AppText variant="bodyMedium">{label}</AppText>

        {description && (
          <AppText variant="caption" color="secondary" className="mt-1">
            {description}
          </AppText>
        )}
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: colors.surfaceSecondary,
          true: colors.primary,
        }}
        thumbColor={value ? colors.inverse : colors.textMuted}
        ios_backgroundColor={colors.surfaceSecondary}
      />
    </View>
  );
}
