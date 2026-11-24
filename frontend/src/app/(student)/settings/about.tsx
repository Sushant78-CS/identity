import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import {
  SettingsInfoRow,
  SettingsPage,
  SettingsSection,
} from "@/features/profile/components/SettingsPage";
import { useAppTheme } from "@/theme/useAppTheme";

export default function AboutIdentityScreen() {
  const { theme } = useAppTheme();

  return (
    <SettingsPage
      title="About Identity"
      subtitle="Learn about the Identity campus platform."
    >
      <View
        className="mb-5 items-center rounded-[20px] px-5 py-7"
        style={{ backgroundColor: theme.colors.surface }}
      >
        {/* <View
          className="h-[68px] w-[68px] items-center justify-center rounded-[21px]"
          style={{ backgroundColor: theme.colors.primaryLight }}
        >
          <Fingerprint size={34} color={theme.colors.primary} />
        </View> */}
        <AppText
          className="mt-3 text-[22px] font-bold"
          style={{ color: theme.colors.textPrimary }}
        >
          IDENTITY
        </AppText>
        <AppText
          className="mt-1 text-center text-[12px] leading-[18px]"
          style={{ color: theme.colors.textSecondary }}
        >
          Digital College Identity & Campus Access Management Platform
        </AppText>
      </View>

      <SettingsSection title="Application">
        <SettingsInfoRow label="Platform" value="Mobile application" />
        <SettingsInfoRow
          label="Access roles"
          value="Students and authorized staff"
        />
        <SettingsInfoRow
          label="Purpose"
          value="Digital identity and campus access"
          showDivider={false}
        />
      </SettingsSection>
    </SettingsPage>
  );
}
