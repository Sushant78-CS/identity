import { Tabs } from "expo-router";
import type { ComponentProps } from "react";

import { BlurView } from "expo-blur";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

import { useEffect, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
import { useTabBarStore } from "@/features/student/stores/tab-bar.store";
import { useAppTheme } from "@/theme/useAppTheme";

// Infer the exact custom tab-bar props from installed Expo Router.
type FloatingTabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];

const BAR_HEIGHT = 60;
const ITEM_WIDTH = 82;
const HORIZONTAL_PADDING = 6;

export function FloatingTabBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
}: FloatingTabBarProps) {
  const { theme, isDark } = useAppTheme();
  const colors = theme.colors;

  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const isVisible = useTabBarStore((s) => s.visible);

  const bottom = Math.max(insets.bottom, 12) + 8;

  const barWidth = Math.min(
    state.routes.length * ITEM_WIDTH + HORIZONTAL_PADDING * 2,
    screenWidth - 40,
  );

  // 0 = visible, 1 = hidden
  const progress = useRef(new Animated.Value(isVisible ? 0 : 1)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: isVisible ? 0 : 1,
      duration: isVisible ? 220 : 170,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    animation.start();

    return () => animation.stop();
  }, [isVisible, progress]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, BAR_HEIGHT + bottom + 20],
  });

  const opacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const activeBackground = isDark
    ? "rgba(255,255,255,0.15)"
    : "rgba(0,0,0,0.07)";

  const overlayBackground = isDark
    ? "rgba(39,39,42,0.78)"
    : "rgba(250,249,246,0.82)";

  return (
    <Animated.View
      pointerEvents={isVisible ? "auto" : "none"}
      style={[
        styles.wrapper,
        {
          bottom,
          width: barWidth,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.shadow}>
        <View
          style={[
            styles.bar,
            {
              borderColor: isDark
                ? "rgba(255,255,255,0.12)"
                : "rgba(0,0,0,0.08)",
            },
          ]}
        >
          {/* Blur background */}

          <BlurView
            tint={isDark ? "dark" : "light"}
            intensity={75}
            style={StyleSheet.absoluteFill}
          />

          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: overlayBackground },
            ]}
          />

          {/* Navigation items */}

          <View style={styles.row}>
            {state.routes.map((route, index) => {
              const options = descriptors[route.key].options;
              const focused = state.index === index;

              const color = focused ? colors.textPrimary : colors.textMuted;

              const label =
                typeof options.tabBarLabel === "string"
                  ? options.tabBarLabel
                  : typeof options.title === "string"
                    ? options.title
                    : route.name;

              const onPress = () => {
                const event = emitter.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!focused && !event.defaultPrevented) {
                  navigateToTab(route.key);
                }
              };

              const onLongPress = () => {
                emitter.emit({
                  type: "tabLongPress",
                  target: route.key,
                });
              };

              return (
                <Pressable
                  key={route.key}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  accessibilityRole="button"
                  accessibilityLabel={
                    options.tabBarAccessibilityLabel ?? `${label} tab`
                  }
                  accessibilityState={{
                    selected: focused,
                  }}
                  testID={options.tabBarButtonTestID}
                  style={[
                    styles.item,
                    focused && {
                      backgroundColor: activeBackground,
                    },
                  ]}
                >
                  {options.tabBarIcon?.({
                    focused,
                    color,
                    size: 21,
                  })}

                  <AppText
                    className="text-[10px] font-semibold"
                    style={{ color }}
                    numberOfLines={1}
                  >
                    {label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    alignSelf: "center",
    alignItems: "center",
  },

  shadow: {
    width: "100%",
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,

    elevation: 12,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.23,
    shadowRadius: 12,
  },

  bar: {
    flex: 1,
    borderRadius: BAR_HEIGHT / 2,
    borderWidth: 1,
    overflow: "hidden",
  },

  row: {
    flex: 1,
    flexDirection: "row",
    padding: HORIZONTAL_PADDING - 1,
  },

  item: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    borderRadius: 25,
    paddingHorizontal: 2,
  },
});
