import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { useAppTheme } from "@/theme/useAppTheme";

interface Props {
  label: string;
  value?: string | number | null;
  last?: boolean;
}

export function StaffInfoRow({ label, value, last = false }: Props) {
  const { theme } = useAppTheme();
  const colors = theme.colors;

  return (
    <View>
      <View className="px-3 py-3">
        <AppText variant="caption" color="secondary">
          {label}
        </AppText>

        <AppText variant="body" className="mt-1 font-medium">
          {value === null || value === undefined || value === ""
            ? "Not provided"
            : String(value)}
        </AppText>
      </View>

      {!last && (
        <View
          className="ml-3 h-px"
          style={{ backgroundColor: colors.border }}
        />
      )}
    </View>
  );
}
