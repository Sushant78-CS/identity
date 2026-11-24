import { useState } from "react";
import { Alert, Linking, Pressable, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import {
  SettingsNotice,
  SettingsPage,
  SettingsSection,
} from "@/features/profile/components/SettingsPage";
import { useAppTheme } from "@/theme/useAppTheme";

export default function PermissionsScreen() {
  const { theme } = useAppTheme();
  const [opening, setOpening] = useState(false);

  const openDeviceSettings = async () => {
    try {
      setOpening(true);
      await Linking.openSettings();
    } catch {
      Alert.alert(
        "Unable to open settings",
        "Open your device settings and find Identity under Apps to review its permissions.",
      );
    } finally {
      setOpening(false);
    }
  };

  return (
    <SettingsPage
      title="Permissions"
      subtitle="Manage the access Identity has to features on your device."
    >
      <SettingsSection>
        <View className="px-4 py-4">
          <AppText
            className="text-[14px] font-semibold"
            style={{ color: theme.colors.textPrimary }}
          >
            Device permissions
          </AppText>
          <AppText
            className="mt-1 text-[12px] leading-[18px]"
            style={{ color: theme.colors.textSecondary }}
          >
            Permission availability depends on your device and the features enabled for your account. Android controls the actual permission status.
          </AppText>

          <Pressable
            onPress={openDeviceSettings}
            disabled={opening}
            className="mt-4 items-center rounded-full px-4 py-3 active:opacity-70"
            style={{ backgroundColor: theme.colors.primary }}
          >
            <AppText
              className="text-[13px] font-semibold"
              style={{ color: theme.colors.inverse }}
            >
              {opening ? "Opening settings..." : "Open device settings"}
            </AppText>
          </Pressable>
        </View>
      </SettingsSection>

      <SettingsNotice
        title="Permission changes"
        message="You can review or change app permissions from Android Settings. Some features may not work when their required permission is disabled."
      />
    </SettingsPage>
  );
}
