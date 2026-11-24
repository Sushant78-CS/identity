import { ArrowRight, QrCode, ScanLine } from "lucide-react-native";
import { useEffect, useRef } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  View,
} from "react-native";

import { AppText } from "@/components/ui/AppText";
import { useAppTheme } from "@/theme/useAppTheme";

type Props = {
  onPress: () => void;
};

const PALETTES = {
  light: {
    card: "#FFFFFF",
    border: "#E5E7EB",
    title: "#171717",
    text: "#525252",
    muted: "#737373",
    surface: "#F5F5F5",
    surfaceBorder: "#E5E5E5",
    badge: "#F0FDF4",
    badgeText: "#15803D",
    badgeBorder: "#BBF7D0",
    button: "#171717",
    buttonText: "#FFFFFF",
    iconBg: "#EAEAEA",
    accent: "#16A34A",
    decoration: "rgba(0,0,0,0.025)",
  },
  dark: {
    card: "#202020",
    border: "#393939",
    title: "#FFFFFF",
    text: "#D4D4D4",
    muted: "#A3A3A3",
    surface: "#292929",
    surfaceBorder: "#424242",
    badge: "#183323",
    badgeText: "#86EFAC",
    badgeBorder: "#285C3A",
    button: "#FFFFFF",
    buttonText: "#171717",
    iconBg: "#383838",
    accent: "#4ADE80",
    decoration: "rgba(255,255,255,0.035)",
  },
};

function Viewfinder({
  size,
  lineColor,
  scanColor,
}: {
  size: number;
  lineColor: string;
  scanColor: string;
}) {
  const bracket = 22;
  const progress = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    let cancelled = false;
    let loop: Animated.CompositeAnimation | undefined;

    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled || reduce) return;

      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(progress, {
            toValue: 1,
            duration: 1700,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(progress, {
            toValue: 0,
            duration: 1700,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      );

      loop.start();
    });

    return () => {
      cancelled = true;
      loop?.stop();
    };
  }, [progress]);

  const travel = size / 2 - 14;

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-travel, travel],
  });

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

      <QrCode
        size={34}
        color={lineColor}
        strokeWidth={1.6}
        style={{ opacity: 0.65 }}
      />

      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 8,
          right: 8,
          height: 2,
          borderRadius: 2,
          backgroundColor: scanColor,
          shadowColor: scanColor,
          shadowOpacity: 0.8,
          shadowRadius: 6,
          transform: [{ translateY }],
        }}
      />
    </View>
  );
}

export function ScannerCard({ onPress }: Props) {
  const { isDark } = useAppTheme();
  const palette = isDark ? PALETTES.dark : PALETTES.light;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Start student verification"
      className="mb-5 overflow-hidden rounded-2xl p-5"
      style={({ pressed }) => ({
        backgroundColor: palette.card,

        // Complete border on all four sides
        borderWidth: 1.5,
        borderColor: isDark ? "#555555" : "#C8CDD4",

        // Lifted card appearance
        shadowColor: "#000000",
        shadowOpacity: isDark ? 0.35 : 0.12,
        shadowRadius: 12,
        shadowOffset: {
          width: 0,
          height: 5,
        },
        elevation: 6,

        opacity: pressed ? 0.96 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      {/* Main content */}
      <View className="flex-row items-center">
        <View className="mr-3 flex-1">
          <AppText
            className="text-[25px] font-extrabold leading-[32px]"
            style={{ color: palette.title }}
          >
            Verify a student ID
          </AppText>

          <AppText
            className="mt-2 text-sm leading-[21px]"
            style={{ color: palette.text }}
          >
            Scan the QR code on a student's digital ID to verify their campus
            access.
          </AppText>
        </View>

        {/* Scanner illustration */}
        <View
          className="items-center justify-center rounded-[20px] p-3"
          style={{
            backgroundColor: palette.surface,
            borderWidth: 1,
            borderColor: palette.surfaceBorder,
          }}
        >
          <Viewfinder
            size={80}
            lineColor={palette.title}
            scanColor={palette.accent}
          />
        </View>
      </View>

      {/* CTA */}
      <View
        className="mt-6 h-[54px] flex-row items-center justify-between rounded-2xl px-4"
        style={{ backgroundColor: palette.button }}
      >
        <View className="flex-row items-center">
          <ScanLine size={21} color={palette.buttonText} />

          <AppText
            className="ml-3 text-sm font-bold"
            style={{ color: palette.buttonText }}
          >
            Start scanning
          </AppText>
        </View>

        <View
          className="h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: palette.iconBg }}
        >
          <ArrowRight size={17} color={palette.title} />
        </View>
      </View>
    </Pressable>
  );
}
