import { useRouter } from "expo-router";
import { ArrowLeft, Check, Monitor, Moon, Sun } from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
import { ThemeMode } from "@/theme/themes";
import { useAppTheme } from "@/theme/useAppTheme";

const THEME_OPTIONS: {
  value: ThemeMode;
  label: string;
  description: string;
  icon: typeof Sun;
}[] = [
  {
    value: "system",
    label: "System default",
    description: "Automatically follow your device settings",
    icon: Monitor,
  },
  {
    value: "light",
    label: "Light",
    description: "Use the light appearance",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Use the dark appearance",
    icon: Moon,
  },
];

export default function AppearanceScreen() {
  const router = useRouter();
  const { theme, mode, setMode } = useAppTheme();

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1"
      style={{ backgroundColor: theme.colors.background }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="flex-row items-center px-5 pb-7 pt-4">
          <Pressable
            onPress={() => router.back()}
            className="mr-4 h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: theme.colors.surface }}
          >
            <ArrowLeft size={21} color={theme.colors.textPrimary} />
          </Pressable>

          <AppText
            className="text-[25px] font-bold"
            style={{ color: theme.colors.textPrimary }}
          >
            Appearance
          </AppText>
        </View>

        <View className="mx-5 mb-5">
          <AppText
            className="text-[13px]"
            style={{ color: theme.colors.textSecondary }}
          >
            Choose your preferred app theme.
          </AppText>
        </View>

        {/* Theme options */}
        <View
          className="mx-5 overflow-hidden rounded-[22px]"
          style={{ backgroundColor: theme.colors.surface }}
        >
          {THEME_OPTIONS.map((option, index) => {
            const selected = mode === option.value;
            const Icon = option.icon;

            return (
              <View key={option.value}>
                <Pressable
                  onPress={() => setMode(option.value)}
                  className="flex-row items-center px-4 py-4 active:opacity-70"
                  style={{
                    backgroundColor: selected
                      ? theme.colors.surfaceSecondary
                      : "transparent",
                  }}
                >
                  <View
                    className="mr-3 h-10 w-10 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: theme.colors.primaryLight,
                    }}
                  >
                    <Icon size={19} color={theme.colors.textPrimary} />
                  </View>

                  <View className="flex-1">
                    <AppText
                      className="text-[14px] font-semibold"
                      style={{ color: theme.colors.textPrimary }}
                    >
                      {option.label}
                    </AppText>

                    <AppText
                      className="mt-0.5 text-[11px]"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {option.description}
                    </AppText>
                  </View>

                  {selected ? (
                    <View
                      className="h-6 w-6 items-center justify-center rounded-full"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      <Check
                        size={15}
                        color={theme.colors.inverse}
                        strokeWidth={2.5}
                      />
                    </View>
                  ) : null}
                </Pressable>

                {index !== THEME_OPTIONS.length - 1 ? (
                  <View
                    className="mx-4 h-px"
                    style={{ backgroundColor: theme.colors.border }}
                  />
                ) : null}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
