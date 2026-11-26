import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Fingerprint, LockKeyhole, LogOut, WifiOff } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, AppState, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import "../../global.css";

import { AppModal } from "@/components/shared/AppModal";
import { AppText } from "@/components/ui/AppText";
import { BiometricService } from "@/features/auth/services/biometric.service";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { shouldSuppressAppLock } from "@/services/app-lifecycle-guard";
import {
  clearBiometricPreference,
  getBiometricEnabled,
} from "@/services/storage/biometric-storage";
import { useAppTheme } from "@/theme/useAppTheme";

type AppLockStatus = "checking" | "locked" | "unlocked" | "unavailable";

export default function RootLayout() {
  // Theme
  const { theme, isDark } = useAppTheme();
  const colors = theme.colors;

  const statusBar = <StatusBar style={isDark ? "light" : "dark"} animated />;

  // Authentication state
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const error = useAuthStore((state) => state.error);
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const logout = useAuthStore((state) => state.logout);

  const userId = user?.userId;

  // App lock state
  const [appLockStatus, setAppLockStatus] = useState<AppLockStatus>("checking");

  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  // Derived authentication states
  const isChecking = status === "idle" || status === "checking";

  const isUnavailable = status === "unavailable";

  const isAuthenticated = status === "authenticated" && user !== null;

  const isStudent = isAuthenticated && user.role === "STUDENT";

  const isStaff = isAuthenticated && user.role === "STAFF";

  const hasUnsupportedRole = isAuthenticated && !isStudent && !isStaff;

  // Restore the saved session when the app starts.
  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  // Check whether biometric unlock is enabled for this account.
  useEffect(() => {
    let isMounted = true;

    async function checkBiometricPreference() {
      if (!isAuthenticated || userId == null) {
        setAppLockStatus("unlocked");
        setUnlockError(null);
        return;
      }

      setAppLockStatus("checking");

      try {
        const enabled = await getBiometricEnabled(userId);

        if (!isMounted) return;

        setAppLockStatus(enabled ? "locked" : "unlocked");
        setUnlockError(null);
      } catch {
        if (isMounted) {
          setAppLockStatus("unavailable");
        }
      }
    }

    void checkBiometricPreference();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, userId]);

  // Lock the application when it returns from the background.
  useEffect(() => {
    if (!isAuthenticated || userId == null) {
      return;
    }

    let wasAwayFromApp = false;

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "inactive" || nextState === "background") {
        if (
          !BiometricService.isAuthenticationInProgress() &&
          !shouldSuppressAppLock()
        ) {
          wasAwayFromApp = true;
        }

        return;
      }

      if (nextState === "active" && wasAwayFromApp) {
        wasAwayFromApp = false;

        if (BiometricService.isAuthenticationInProgress()) {
          return;
        }

        void getBiometricEnabled(userId)
          .then((enabled) => {
            if (enabled) {
              setUnlockError(null);
              setAppLockStatus("locked");
            }
          })
          .catch(() => {
            setAppLockStatus("unavailable");
          });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, userId]);

  const authenticatedDestination = isStudent
    ? "/(student)/(tabs)/home"
    : isStaff
      ? "/(staff)/(tabs)/home"
      : "/access-denied";

  // Authenticate using fingerprint or Face ID.
  const handleUnlock = async () => {
    if (isUnlocking) return;

    setIsUnlocking(true);
    setUnlockError(null);

    try {
      const result = await BiometricService.authenticate("Unlock Identity");

      if (result.success) {
        setAppLockStatus("unlocked");
        return;
      }

      const reason = result.reason;

      if (
        reason === "user_cancel" ||
        reason === "system_cancel" ||
        reason === "app_cancel"
      ) {
        return;
      }

      if (reason === "not_enrolled") {
        setUnlockError(
          "No biometric credentials are enrolled. Please use the sign-out option to continue with password login.",
        );
        // } else if (reason === "lockout" || reason === "lockout_permanent") {
      } else if (reason === "lockout") {
        setUnlockError(
          "Biometric authentication is locked. Unlock your device and try again.",
        );
      } else if (reason === "authentication_failed") {
        setUnlockError("Verification failed. Please try again.");
      } else {
        setUnlockError(
          "Biometric authentication is unavailable. Please try again or sign out.",
        );
      }
    } finally {
      setIsUnlocking(false);
    }
  };

  // Retry reading the saved biometric preference.
  const retryAppLockCheck = async () => {
    if (userId == null) return;

    setAppLockStatus("checking");
    setUnlockError(null);

    try {
      const enabled = await getBiometricEnabled(userId);

      setAppLockStatus(enabled ? "locked" : "unlocked");
    } catch {
      setAppLockStatus("unavailable");
    }
  };

  // Disable biometric unlock and sign out.
  // Open the confirmation modal.
  const confirmSignOut = () => {
    setSignOutError(null);
    setShowSignOutModal(true);
  };

  // Disable biometrics and sign out.
  const handleDisableBiometricsAndSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    setSignOutError(null);

    try {
      if (userId != null) {
        await clearBiometricPreference(userId);
      }

      await logout();
      setShowSignOutModal(false);
    } catch {
      setSignOutError("Unable to sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {statusBar}

      {/* Always keep the root navigator mounted */}
      <Stack screenOptions={{ headerShown: false }}>
        {/* Welcome and authentication */}
        <Stack.Protected
          guard={!isAuthenticated}
          redirectTo={authenticatedDestination}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        {/* Student */}
        <Stack.Protected guard={isStudent} redirectTo="/">
          <Stack.Screen name="(student)" />
        </Stack.Protected>

        {/* Staff */}
        <Stack.Protected guard={isStaff} redirectTo="/">
          <Stack.Screen name="(staff)" />
        </Stack.Protected>

        {/* Unsupported roles */}
        <Stack.Protected guard={hasUnsupportedRole} redirectTo="/">
          <Stack.Screen name="access-denied" />
        </Stack.Protected>
      </Stack>

      {/* Initial session loading overlay */}
      {isChecking && (
        <SafeAreaView
          className="absolute inset-0 z-50 items-center justify-center"
          style={{ backgroundColor: colors.background }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </SafeAreaView>
      )}

      {/* Backend unavailable overlay */}
      {!isChecking && isUnavailable && (
        <SafeAreaView
          className="absolute inset-0 z-50 items-center justify-center px-7"
          style={{ backgroundColor: colors.background }}
        >
          <View className="w-full max-w-sm items-center">
            <WifiOff size={38} color={colors.textPrimary} />

            <AppText
              className="mt-6 text-center text-[25px] font-bold"
              style={{ color: colors.textPrimary }}
            >
              Connection unavailable
            </AppText>

            <AppText
              className="mt-3 text-center text-sm leading-6"
              style={{ color: colors.textSecondary }}
            >
              {error ??
                "Your session is saved. Please check your connection and try again."}
            </AppText>

            <Pressable
              onPress={() => void restoreSession()}
              className="mt-8 h-14 w-full items-center justify-center rounded-2xl"
              style={{ backgroundColor: colors.primary }}
            >
              <AppText className="font-bold" style={{ color: colors.inverse }}>
                Try Again
              </AppText>
            </Pressable>
          </View>
        </SafeAreaView>
      )}

      {/* Biometric app lock overlay */}
      {!isChecking &&
        !isUnavailable &&
        isAuthenticated &&
        appLockStatus !== "unlocked" && (
          <SafeAreaView
            className="absolute inset-0 z-50 px-7"
            style={{ backgroundColor: colors.background }}
          >
            {/* Center content */}
            <View className="flex-1 items-center justify-center">
              {appLockStatus === "checking" ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : (
                <>
                  {/* Tappable icon circle */}
                  <Pressable
                    onPress={() =>
                      appLockStatus === "locked"
                        ? void handleUnlock()
                        : void retryAppLockCheck()
                    }
                    disabled={isUnlocking}
                    className="h-28 w-28 items-center justify-center rounded-full"
                    style={({ pressed }) => ({
                      backgroundColor: colors.primary + "1A", // ~10% tint
                      borderWidth: 1.5,
                      borderColor: colors.primary + "40",
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    {isUnlocking ? (
                      <ActivityIndicator size="large" color={colors.primary} />
                    ) : appLockStatus === "unavailable" ? (
                      <LockKeyhole size={44} color={colors.primary} />
                    ) : (
                      <Fingerprint size={48} color={colors.primary} />
                    )}
                  </Pressable>

                  <AppText
                    className="mt-8 text-center text-[22px] font-semibold"
                    style={{ color: colors.textPrimary }}
                  >
                    {appLockStatus === "unavailable"
                      ? "Couldn't verify app lock"
                      : "App locked"}
                  </AppText>

                  <AppText
                    className="mt-2 text-center text-[15px]"
                    style={{
                      color: unlockError ? colors.danger : colors.textSecondary,
                    }}
                  >
                    {unlockError
                      ? unlockError
                      : isUnlocking
                        ? "Verifying..."
                        : appLockStatus === "unavailable"
                          ? "Tap to try again"
                          : "Tap to unlock with biometrics"}
                  </AppText>
                </>
              )}
            </View>

            {/* Bottom action */}
            {appLockStatus !== "checking" && (
              <View className="items-center pb-4">
                <Pressable
                  onPress={confirmSignOut}
                  hitSlop={12}
                  className="flex-row items-center gap-2 py-3"
                >
                  <LogOut size={16} color={colors.textSecondary} />
                  <AppText
                    className="text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    Sign out
                  </AppText>
                </Pressable>
              </View>
            )}
          </SafeAreaView>
        )}
      {/* <AppModal
        visible={showSignOutModal}
        title="Disable biometric unlock?"
        description="Biometric protection will be disabled for this account on this device. You will need your account credentials to sign in again."
        confirmLabel="Disable and sign out"
        cancelLabel="Cancel"
        variant="danger"
        loading={isSigningOut}
        onCancel={() => {
          if (!isSigningOut) {
            setShowSignOutModal(false);
            setSignOutError(null);
          }
        }}
        onConfirm={() => {
          void handleDisableBiometricsAndSignOut();
        }}
      >
        {signOutError && (
          <AppText className="text-sm" style={{ color: colors.danger }}>
            {signOutError}
          </AppText>
        )}
      </AppModal> */}
      <AppModal
        visible={showSignOutModal}
        title="Turn off biometric unlock?"
        description="You'll be signed out of Identity. You can sign in again using your account password."
        confirmLabel="Turn off & sign out"
        cancelLabel="Cancel"
        onCancel={() => setShowSignOutModal(false)}
        onConfirm={handleDisableBiometricsAndSignOut}
        loading={isSigningOut}
      />
    </View>
  );
}
export const unstable_settings = {
  anchor: "index",
};
