import { Switch, View } from "react-native";
import { Bell, CalendarDays, ShieldCheck, UserRound } from "lucide-react-native";

import { AppText } from "@/components/ui/AppText";
import {
  SettingsNotice,
  SettingsPage,
  SettingsSection,
} from "@/features/profile/components/SettingsPage";
import { useProfilePreferencesStore } from "@/features/profile/stores/profile-preferences.store";
import { useAppTheme } from "@/theme/useAppTheme";

const ITEMS = [
  {
    key: "campusUpdates",
    title: "Campus updates",
    description: "Announcements and important college notices",
    icon: Bell,
    color: "#3478E5",
  },
  {
    key: "eventReminders",
    title: "Event reminders",
    description: "Reminders for campus events and activities",
    icon: CalendarDays,
    color: "#7856D9",
  },
  {
    key: "accountActivity",
    title: "Account activity",
    description: "Updates related to your Identity account",
    icon: UserRound,
    color: "#D96A29",
  },
  {
    key: "securityAlerts",
    title: "Security alerts",
    description: "Important account and verification notices",
    icon: ShieldCheck,
    color: "#39845A",
  },
] as const;

export default function NotificationsScreen() {
  const { theme } = useAppTheme();
  const notifications = useProfilePreferencesStore((state) => state.notifications);
  const setPreference = useProfilePreferencesStore(
    (state) => state.setNotificationPreference,
  );

  return (
    <SettingsPage
      title="Notifications"
      subtitle="Choose which types of Identity updates you want to receive."
    >
      <SettingsSection>
        {ITEMS.map((item, index) => {
          const Icon = item.icon;
          const enabled = notifications[item.key];

          return (
            <View key={item.key}>
              <View className="flex-row items-center px-3.5 py-3">
                <View
                  className="mr-3 h-9 w-9 items-center justify-center rounded-full"
                  style={{ backgroundColor: item.color }}
                >
                  <Icon size={18} color="#FFFFFF" />
                </View>

                <View className="flex-1 pr-2">
                  <AppText
                    className="text-[14px] font-medium"
                    style={{ color: theme.colors.textPrimary }}
                  >
                    {item.title}
                  </AppText>
                  <AppText
                    className="mt-0.5 text-[11px] leading-[16px]"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    {item.description}
                  </AppText>
                </View>

                <Switch
                  value={enabled}
                  onValueChange={(value) => setPreference(item.key, value)}
                  trackColor={{
                    false: theme.colors.border,
                    true: theme.colors.success,
                  }}
                  thumbColor={theme.colors.inverse}
                />
              </View>

              {index !== ITEMS.length - 1 ? (
                <View
                  className="ml-[63px] h-px"
                  style={{ backgroundColor: theme.colors.border }}
                />
              ) : null}
            </View>
          );
        })}
      </SettingsSection>

      <SettingsNotice
        title="Preferences saved on this device"
        message="These choices are stored locally. Push notification delivery will take effect after the app's notification service is connected."
      />
    </SettingsPage>
  );
}
