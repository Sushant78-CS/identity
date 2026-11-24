import type { ReactNode } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { useAppTheme } from "@/theme/useAppTheme";

type Theme = ReturnType<typeof useAppTheme>["theme"];

export function SettingsPage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const { theme } = useAppTheme();

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1"
      style={{ backgroundColor: theme.colors.background }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 36 }}
      >
        <View className="flex-row items-center px-5 pb-4 pt-4">
          <Pressable
            onPress={() => router.back()}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: theme.colors.surface }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={20} color={theme.colors.textPrimary} />
          </Pressable>

          <AppText
            className="flex-1 text-[23px] font-bold"
            style={{ color: theme.colors.textPrimary }}
          >
            {title}
          </AppText>
        </View>

        {subtitle ? (
          <AppText
            className="mx-5 mb-5 text-[12px] leading-[18px]"
            style={{ color: theme.colors.textSecondary }}
          >
            {subtitle}
          </AppText>
        ) : null}

        <View className="px-5">{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function SettingsSection({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  const { theme } = useAppTheme();

  return (
    <View className="mb-5">
      {title ? (
        <AppText
          className="mb-2 ml-1 text-[12px] font-semibold"
          style={{ color: theme.colors.textSecondary }}
        >
          {title}
        </AppText>
      ) : null}
      <View
        className="overflow-hidden rounded-[20px]"
        style={{ backgroundColor: theme.colors.surface }}
      >
        {children}
      </View>
    </View>
  );
}

export function SettingsInfoRow({
  label,
  value,
  showDivider = true,
}: {
  label: string;
  value: string;
  showDivider?: boolean;
}) {
  const { theme } = useAppTheme();

  return (
    <View>
      <View className="px-4 py-3">
        <AppText
          className="text-[11px]"
          style={{ color: theme.colors.textSecondary }}
        >
          {label}
        </AppText>
        <AppText
          className="mt-1 text-[14px] font-medium"
          style={{ color: theme.colors.textPrimary }}
        >
          {value || "Not connected"}
        </AppText>
      </View>
      {showDivider ? (
        <View
          className="mx-4 h-px"
          style={{ backgroundColor: theme.colors.border }}
        />
      ) : null}
    </View>
  );
}

export function SettingsActionRow({
  title,
  description,
  icon,
  iconColor = "#64748B",
  onPress,
  showDivider = true,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  iconColor?: string;
  onPress: () => void;
  showDivider?: boolean;
}) {
  const { theme } = useAppTheme();

  return (
    <View>
      <Pressable
        onPress={onPress}
        className="flex-row items-center px-3.5 py-3 active:opacity-70"
      >
        {icon ? (
          <View
            className="mr-3 h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: iconColor }}
          >
            {icon}
          </View>
        ) : null}
        <View className="flex-1">
          <AppText
            className="text-[14px] font-medium"
            style={{ color: theme.colors.textPrimary }}
          >
            {title}
          </AppText>
          {description ? (
            <AppText
              className="mt-0.5 text-[11px] leading-[16px]"
              style={{ color: theme.colors.textSecondary }}
            >
              {description}
            </AppText>
          ) : null}
        </View>
        <ChevronRight size={17} color={theme.colors.textMuted} />
      </Pressable>
      {showDivider ? (
        <View
          className={icon ? "ml-[63px] h-px" : "mx-4 h-px"}
          style={{ backgroundColor: theme.colors.border }}
        />
      ) : null}
    </View>
  );
}

export function SettingsNotice({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  const { theme } = useAppTheme();

  return (
    <View
      className="mb-5 rounded-[18px] p-4"
      style={{ backgroundColor: theme.colors.surfaceSecondary }}
    >
      <AppText
        className="text-[13px] font-semibold"
        style={{ color: theme.colors.textPrimary }}
      >
        {title}
      </AppText>
      <AppText
        className="mt-1 text-[12px] leading-[18px]"
        style={{ color: theme.colors.textSecondary }}
      >
        {message}
      </AppText>
    </View>
  );
}

export type { Theme };
