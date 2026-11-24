import { Tabs } from "expo-router";
import { History, House, ScanLine, UserRound } from "lucide-react-native";

import { StaffFloatingTabBar } from "@/components/navigation/StaffFloatingTabBar";
import { useAppTheme } from "@/theme/useAppTheme";

export default function StaffTabsLayout() {
  const { theme } = useAppTheme();
  const colors = theme.colors;

  return (
    <Tabs
      tabBar={(props) => <StaffFloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        sceneStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="scan"
        options={{
          title: "Scanner",
          tabBarIcon: ({ color, size }) => (
            <ScanLine color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => (
            <History color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <UserRound color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
