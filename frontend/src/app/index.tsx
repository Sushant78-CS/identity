import { useRouter } from "expo-router";
import {
  BriefcaseBusiness,
  ChevronRight,
  GraduationCap,
} from "lucide-react-native";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
import { useAppTheme } from "@/theme/useAppTheme";

const roles = [
  {
    title: "I'm a Student",
    icon: GraduationCap,
    role: "student" as const,
  },
  {
    title: "I'm a Staff Member",
    icon: BriefcaseBusiness,
    role: "staff" as const,
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const colors = theme.colors;

  // const status = useAuthStore((state) => state.status);
  // const user = useAuthStore((state) => state.user);

  // // Already logged in? Open the correct application.
  // if (status === "authenticated") {
  //   if (user?.role === "STUDENT") {
  //     return <Redirect href="/(student)/(tabs)/home" />;
  //   }

  //   if (user?.role === "STAFF") {
  //     return <Redirect href="/(staff)" />;
  //   }

  //   return <Redirect href="/access-denied" />;
  // }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <View className="flex-1 justify-between px-6 py-10">
        {/* Brand */}
        <AppText
          style={{
            fontSize: 24,
            fontWeight: "800",
            letterSpacing: -0.8,
          }}
        >
          IDENTITY
        </AppText>

        {/* Main content */}
        <View className="w-full items-center gap-10">
          {/* Heading */}
          <View className="items-center gap-3">
            <AppText
              style={{
                fontSize: 36,
                fontWeight: "700",
                lineHeight: 44,
                letterSpacing: -1.2,
                textAlign: "center",
              }}
            >
              One identity.{"\n"}Your entire campus.
            </AppText>

            <AppText
              color="secondary"
              style={{
                fontSize: 14,
                textAlign: "center",
              }}
            >
              Choose how you'd like to continue.
            </AppText>
          </View>

          {/* Role selection */}
          <View className="w-full gap-4">
            {roles.map(({ title, icon: Icon, role }) => (
              <Pressable
                key={role}
                onPress={() =>
                  router.push({
                    pathname: "/(auth)/login",
                    params: { role },
                  })
                }
                accessibilityRole="button"
                accessibilityLabel={title}
                className="flex-row items-center rounded-2xl px-5"
                style={({ pressed }) => ({
                  height: 84,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  shadowColor: "#000000",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: pressed ? 0 : 0.06,
                  shadowRadius: 8,
                  elevation: pressed ? 0 : 2,
                })}
              >
                <View
                  className="items-center justify-center rounded-2xl"
                  style={{
                    width: 50,
                    height: 50,
                    backgroundColor: colors.surfaceSecondary,
                  }}
                >
                  <Icon
                    size={25}
                    color={colors.textPrimary}
                    strokeWidth={1.8}
                  />
                </View>

                <View className="ml-4 flex-1">
                  <AppText
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                    }}
                  >
                    {title}
                  </AppText>
                </View>

                <View
                  className="items-center justify-center rounded-full"
                  style={{
                    width: 32,
                    height: 32,
                    backgroundColor: colors.surfaceSecondary,
                  }}
                >
                  <ChevronRight size={18} color={colors.textSecondary} />
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View className="items-center gap-1">
          <AppText
            color="secondary"
            style={{
              fontSize: 12,
              fontWeight: "500",
            }}
          >
            Secure • Simple • Connected
          </AppText>
        </View>
      </View>
    </SafeAreaView>
  );
}
