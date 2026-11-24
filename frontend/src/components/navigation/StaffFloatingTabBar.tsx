import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
import { useAppTheme } from "@/theme/useAppTheme";

type StaffTabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];

const BAR_HEIGHT = 68;

export function StaffFloatingTabBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
}: StaffTabBarProps) {
  const { theme, isDark } = useAppTheme();
  const colors = theme.colors;
  const insets = useSafeAreaInsets();

  const bottom = Math.max(insets.bottom, 12) + 8;

  const activeBackground = isDark
    ? "rgba(255,255,255,0.13)"
    : "rgba(0,0,0,0.06)";

  const overlayBackground = isDark
    ? "rgba(39,39,42,0.78)"
    : "rgba(250,249,246,0.82)";

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { bottom }]}>
      <View
        style={[
          styles.bar,
          {
            borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
          },
        ]}
      >
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

        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const options = descriptors[route.key].options;
            const focused = state.index === index;

            const label =
              typeof options.tabBarLabel === "string"
                ? options.tabBarLabel
                : typeof options.title === "string"
                  ? options.title
                  : route.name;

            const color = focused ? colors.textPrimary : colors.textMuted;

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

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel={`${label} tab`}
                accessibilityState={{
                  selected: focused,
                }}
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
                  numberOfLines={1}
                  className="text-[10px] font-semibold"
                  style={{ color }}
                >
                  {label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    alignSelf: "center",
    width: "90%",
    maxWidth: 420,
  },
  bar: {
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    borderWidth: 1,
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  row: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 5,
  },
  item: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    borderRadius: 25,
    marginVertical: 4,
  },
});
