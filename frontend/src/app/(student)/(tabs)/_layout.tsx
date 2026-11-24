import { Tabs } from "expo-router";
import { Home, IdCard, UserRound } from "lucide-react-native";

import { FloatingTabBar } from "@/components/navigation/FloatingTabBar";
import { useAppTheme } from "@/theme/useAppTheme";

export default function StudentLayout() {
  const { theme } = useAppTheme();

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="id-card"
        options={{
          title: "My ID",
          tabBarIcon: ({ color, size }) => <IdCard color={color} size={size} />,
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
