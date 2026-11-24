import { ShieldAlert } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useAppTheme } from "@/theme/useAppTheme";

export default function AccessDeniedScreen() {
  const { theme } = useAppTheme();
  const logout = useAuthStore((state) => state.logout);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logout();
    } catch {
      // The store still clears the in-memory session.
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 items-center justify-center px-8"
      style={{ backgroundColor: theme.colors.background }}
    >
      <View
        className="mb-5 h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: theme.colors.surfaceSecondary }}
      >
        <ShieldAlert size={30} color={theme.colors.danger} />
      </View>

      <AppText
        className="text-center text-[22px] font-bold"
        style={{ color: theme.colors.textPrimary }}
      >
        Mobile access unavailable
      </AppText>

      <AppText
        className="mt-3 text-center text-[14px] leading-6"
        style={{ color: theme.colors.textSecondary }}
      >
        This account role is not supported by the Identity mobile application.
        Please use the college administration web platform.
      </AppText>

      <Pressable
        onPress={() => void handleLogout()}
        disabled={isLoggingOut}
        className="mt-7 rounded-full px-8 py-3.5"
        style={{ backgroundColor: theme.colors.primary }}
      >
        <AppText
          className="text-[14px] font-semibold"
          style={{ color: theme.colors.inverse }}
        >
          {isLoggingOut ? "Signing out..." : "Sign out"}
        </AppText>
      </Pressable>
    </SafeAreaView>
  );
}
