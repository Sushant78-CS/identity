import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { useAppTheme } from "@/theme/useAppTheme";

interface Props {
  title: string;
  subtitle?: string;
}

export function StaffScreenHeader({ title, subtitle }: Props) {
  const { theme } = useAppTheme();
  const colors = theme.colors;

  return (
    <View className="mb-6">
      <View className="flex-row items-center">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="mr-3 h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.surfaceSecondary }}
        >
          <ArrowLeft size={20} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>

        <View className="flex-1 justify-center">
          <AppText variant="body" className="text-xl font-semibold">
            {title}
          </AppText>

          {subtitle ? (
            <AppText variant="caption" color="secondary" className="mt-0.5">
              {subtitle}
            </AppText>
          ) : null}
        </View>
      </View>
    </View>
  );
}
