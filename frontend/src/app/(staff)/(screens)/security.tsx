import { Fingerprint, LockKeyhole, ShieldCheck } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Switch, View } from "react-native";

import { AppToast } from "@/components/shared/AppToast";
import { AppText } from "@/components/ui/AppText";
import { BiometricService } from "@/features/auth/services/biometric.service";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  SettingsActionRow,
  SettingsPage,
  SettingsSection,
} from "@/features/profile/components/SettingsPage";
import {
  getBiometricEnabled,
  setBiometricEnabled,
} from "@/services/storage/biometric-storage";
import { useAppTheme } from "@/theme/useAppTheme";

export default function SecurityScreen() {
  const { theme, isDark } = useAppTheme();
  const colors = theme.colors;

  type ToastType = "success" | "error" | "warning" | "info";

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: ToastType;
  }>({
    visible: false,
    message: "",
    type: "success",
  });

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      setToast({ visible: true, message, type });
    },
    [],
  );

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  const userId = useAuthStore((state) => state.user?.userId);

  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState("Biometrics");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  // Load saved preference and device biometric availability.
  useEffect(() => {
    let isMounted = true;

    async function loadBiometricSettings() {
      if (userId === undefined || userId === null) {
        setIsLoading(false);
        return;
      }

      try {
        const [enabled, availability] = await Promise.all([
          getBiometricEnabled(userId),
          BiometricService.getAvailability(),
        ]);

        if (!isMounted) return;

        setBiometricEnabledState(enabled);
        setBiometricLabel(availability.label);
        setIsAvailable(availability.isAvailable);
      } catch {
        if (isMounted) {
          setIsAvailable(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadBiometricSettings();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const getAuthenticationError = (reason: string): string | null => {
    switch (reason) {
      case "user_cancel":
      case "system_cancel":
      case "app_cancel":
        return null;

      case "not_enrolled":
        return "Please register your fingerprint or face in your device settings first.";

      case "authentication_failed":
        return "Biometric verification failed. Please try again.";

      case "lockout":
      case "lockout_permanent":
        return "Biometric authentication is temporarily locked. Unlock your phone using its screen lock and try again.";

      default:
        return "Biometric authentication could not be completed. Please try again.";
    }
  };

  // Enable or disable biometric unlocking.
  const handleBiometricToggle = async (value: boolean) => {
    if (userId === undefined || userId === null) {
      showToast("Please sign in again to update this setting.", "error");
      return;
    }

    setIsSaving(true);

    try {
      if (value) {
        const availability = await BiometricService.getAvailability();

        setIsAvailable(availability.isAvailable);
        setBiometricLabel(availability.label);

        if (!availability.isAvailable) {
          const message = !availability.hasHardware
            ? "Your device does not support biometric authentication."
            : !availability.isEnrolled
              ? "Register your fingerprint or face in device settings first."
              : "No supported biometric authentication method is available.";

          showToast(message, "warning");
          return;
        }

        // Verify the user before enabling biometric unlock.
        const result = await BiometricService.authenticate(
          "Enable biometric unlock",
        );

        if (!result.success) {
          const message = getAuthenticationError(result.reason);

          if (message) {
            showToast(message, "error");
          }

          return;
        }

        await setBiometricEnabled(userId, true);
        setBiometricEnabledState(true);

        showToast(
          `Biometric unlock enabled using ${availability.label}.`,
          "success",
        );
      } else {
        await setBiometricEnabled(userId, false);
        setBiometricEnabledState(false);

        showToast("Biometric lock disabled.", "success");
      }
    } catch {
      showToast(
        "Couldn't update your biometric preference. Please try again.",
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const unavailableMessage = isAvailable
    ? `Use ${biometricLabel} to unlock your Identity app.`
    : "Set up fingerprint or face authentication on your device to use this feature.";

  const unavailable = (feature: string) => {
    Alert.alert(
      feature,
      "This security action is not connected to the authentication service yet.",
    );
  };

  return (
    <>
      <SettingsPage
        title="Security & privacy"
        subtitle="Manage your account protection and privacy."
      >
        {/* App lock */}

        <SettingsSection title="APP LOCK">
          <View className="px-4 py-4">
            {/* Main setting */}
            <View className="flex-row items-center">
              {/* Icon */}
              <View
                className="mr-3 h-12 w-12 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: colors.primaryLight,
                }}
              >
                <Fingerprint
                  size={25}
                  color={colors.primary}
                  strokeWidth={1.7}
                />
              </View>

              {/* Information */}
              <View className="flex-1 pr-3">
                <AppText
                  className="text-[14px] font-semibold"
                  style={{ color: colors.textPrimary }}
                >
                  Biometric lock
                </AppText>

                <AppText
                  className="mt-1 text-[11px] leading-[17px]"
                  style={{ color: colors.textSecondary }}
                >
                  Use your fingerprint or face to unlock Identity.
                </AppText>
              </View>

              {/* Toggle */}
              {isLoading || isSaving ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleBiometricToggle}
                  disabled={!userId || !isAvailable}
                  trackColor={{
                    false: colors.border,
                    true: colors.primary,
                  }}
                  thumbColor="#FFFFFF"
                  accessibilityRole="switch"
                  accessibilityLabel="Enable biometric lock"
                />
              )}
            </View>

            {/* Security status */}
            {/* <View
            className="mt-4 flex-row items-center justify-between rounded-xl px-3 py-2.5"
            style={{
              backgroundColor: colors.surfaceSecondary,
            }}
          >
            <View className="flex-row flex-1 items-center gap-2">
              <View
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: isLoading
                    ? colors.textMuted
                    : biometricEnabled
                      ? colors.success
                      : isAvailable
                        ? colors.textMuted
                        : colors.danger,
                }}
              />

              <AppText
                className="text-[11px] font-medium"
                style={{ color: colors.textSecondary }}
              >
                {isLoading
                  ? "Checking device security..."
                  : !isAvailable
                    ? "Biometrics unavailable"
                    : biometricEnabled
                      ? "Your app is protected"
                      : "Biometric protection is off"}
              </AppText>
            </View>

            {!isLoading && (
              <AppText
                className="text-[10px] font-bold tracking-wider"
                style={{
                  color: biometricEnabled ? colors.success : colors.textMuted,
                }}
              >
                {biometricEnabled ? "ON" : "OFF"}
              </AppText>
            )}
          </View> */}

            {/* Device availability information */}
            {!isLoading && !isAvailable && (
              <AppText
                className="mt-2 px-1 text-[11px] leading-[17px]"
                style={{ color: colors.textSecondary }}
              >
                Set up fingerprint or face authentication in your device
                settings to enable app lock.
              </AppText>
            )}
          </View>
        </SettingsSection>

        {/* Account security */}
        <SettingsSection title="ACCOUNT SECURITY">
          <SettingsActionRow
            icon={<ShieldCheck size={19} color="#FFFFFF" />}
            iconColor="#39845A"
            title="Campus account"
            description="Account managed by your college"
            onPress={() => unavailable("Campus account")}
          />

          <SettingsActionRow
            icon={<LockKeyhole size={19} color="#FFFFFF" />}
            iconColor="#5176B9"
            title="Password and sign-in"
            description="Password and recovery options"
            onPress={() => unavailable("Password and sign-in")}
            showDivider={false}
          />
        </SettingsSection>

        {/* Privacy */}
        {/* <SettingsSection title="PRIVACY">
          <SettingsActionRow
            icon={<Smartphone size={19} color="#FFFFFF" />}
            iconColor="#7856D9"
            title="Digital ID sharing"
            description="Manage how your identity is shared"
            onPress={() => unavailable("Digital ID sharing")}
            showDivider={false}
          />
        </SettingsSection> */}

        {/* Privacy notice */}
        {/* <SettingsNotice
          title="Protect your digital identity"
          message="Share your verification QR only with authorized campus staff. Demo QR codes are not valid for campus entry."
        /> */}
      </SettingsPage>
      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        duration={3500}
        onHide={hideToast}
      />
    </>
  );
}
