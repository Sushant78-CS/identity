import { useRouter } from "expo-router";
import { ChevronRight, Clock3, QrCode } from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
import { ScannerCard } from "@/features/staff/components/ScannerCard";
import { useAppTheme } from "@/theme/useAppTheme";

const STEPS = [
  {
    title: "Open the scanner",
    description: "Tap Start scanning and allow camera access if asked.",
  },
  {
    title: "Scan the student's QR",
    description:
      "Ask them to open their digital ID and hold it inside the frame.",
  },
  {
    title: "Check the result",
    description: "The verification is saved to your history automatically.",
  },
];

function withAlpha(color: string, alpha: number) {
  const hex = color.trim();
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex);

  if (!match) return color;

  const raw =
    match[1].length === 3
      ? match[1]
          .split("")
          .map((c) => c + c)
          .join("")
      : match[1];

  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);

  return `rgba(${r},${g},${b},${alpha})`;
}

function Viewfinder({
  size = 88,
  lineColor,
  scanColor,
}: {
  size?: number;
  lineColor: string;
  scanColor: string;
}) {
  const bracket = 23;

  const base = {
    position: "absolute" as const,
    width: bracket,
    height: bracket,
    borderColor: lineColor,
  };

  return (
    <View
      style={{ width: size, height: size }}
      className="items-center justify-center"
    >
      <View
        style={[
          base,
          {
            top: 0,
            left: 0,
            borderTopWidth: 3,
            borderLeftWidth: 3,
            borderTopLeftRadius: 10,
          },
        ]}
      />

      <View
        style={[
          base,
          {
            top: 0,
            right: 0,
            borderTopWidth: 3,
            borderRightWidth: 3,
            borderTopRightRadius: 10,
          },
        ]}
      />

      <View
        style={[
          base,
          {
            bottom: 0,
            left: 0,
            borderBottomWidth: 3,
            borderLeftWidth: 3,
            borderBottomLeftRadius: 10,
          },
        ]}
      />

      <View
        style={[
          base,
          {
            bottom: 0,
            right: 0,
            borderBottomWidth: 3,
            borderRightWidth: 3,
            borderBottomRightRadius: 10,
          },
        ]}
      />

      <QrCode size={36} color={lineColor} strokeWidth={1.8} />

      <View
        style={{
          position: "absolute",
          left: 10,
          right: 10,
          top: size / 2 - 1,
          height: 2,
          borderRadius: 2,
          backgroundColor: scanColor,
        }}
      />
    </View>
  );
}

export default function StaffHomeScreen() {
  const router = useRouter();

  const { theme, isDark } = useAppTheme();
  const colors = theme.colors;

  // Theme-aware banner colors.
  const bannerForeground = isDark ? "#20201F" : "#FFFFFF";

  const openScanner = () => {
    router.push("/(staff)/(screens)/scanner");
  };

  const openHistory = () => {
    router.push("/(staff)/(tabs)/history");
  };

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top"]}
      style={{ backgroundColor: colors.background }}
    >
      {/* FIXED LEFT-ALIGNED HEADER */}
      <View
        className="px-5 py-4"
        style={{
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <AppText
          className="text-[23px] font-extrabold"
          style={{ letterSpacing: 3 }}
          accessibilityRole="header"
        >
          IDENTITY
        </AppText>
      </View>

      {/* ONLY CONTENT BELOW THE HEADER SCROLLS */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 22,
          paddingBottom: 125,
        }}
      >
        <View
          className="mb-5 rounded-[28px] p-[2px]"
          style={{
            backgroundColor: isDark ? "#484848" : "#D1D5DB",
            borderWidth: 1,
            borderColor: isDark ? "#5A5A5A" : "#C4CAD2",
          }}
        >
          <View
            className="rounded-[26px] p-[1px]"
            style={{
              backgroundColor: isDark ? "#303030" : "#F3F4F6",
            }}
          >
            <ScannerCard onPress={openScanner} />
          </View>
        </View>

        {/* VERIFICATION HISTORY */}
        <Pressable
          onPress={openHistory}
          accessibilityRole="button"
          accessibilityLabel="Open verification history"
          className="flex-row items-center rounded-2xl px-4 py-4"
          style={({ pressed }) => ({
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <View
            className="h-11 w-11 items-center justify-center rounded-xl"
            style={{
              backgroundColor: colors.surfaceSecondary,
            }}
          >
            <Clock3 size={21} color={colors.textPrimary} />
          </View>

          <View className="ml-3 flex-1">
            <AppText className="text-base font-semibold">
              Verification history
            </AppText>

            <AppText className="mt-0.5 text-xs" color="secondary">
              Browse past scans and search students
            </AppText>
          </View>

          <ChevronRight size={20} color={colors.textSecondary} />
        </Pressable>

        {/* HOW IT WORKS */}
        <AppText className="mb-3 mt-8 text-lg font-bold">How it works</AppText>

        <View
          className="rounded-2xl px-4 pt-4"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          {STEPS.map((step, index) => {
            const isLast = index === STEPS.length - 1;

            return (
              <View key={step.title} className="flex-row">
                <View className="items-center">
                  <View
                    className="h-8 w-8 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: colors.surfaceSecondary,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <AppText
                      className="text-sm font-bold"
                      style={{ color: colors.textPrimary }}
                    >
                      {index + 1}
                    </AppText>
                  </View>

                  {!isLast && (
                    <View
                      className="mt-1 w-px flex-1"
                      style={{
                        backgroundColor: colors.border,
                      }}
                    />
                  )}
                </View>

                <View className={`ml-3 flex-1 ${isLast ? "pb-4" : "pb-5"}`}>
                  <AppText className="text-sm font-semibold">
                    {step.title}
                  </AppText>

                  <AppText
                    className="mt-0.5 text-xs leading-5"
                    color="secondary"
                  >
                    {step.description}
                  </AppText>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
