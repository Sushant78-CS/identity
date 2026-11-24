import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type NotificationPreferences = {
  campusUpdates: boolean;
  eventReminders: boolean;
  accountActivity: boolean;
  securityAlerts: boolean;
};

type ProfilePreferencesState = {
  notifications: NotificationPreferences;
  setNotificationPreference: (
    key: keyof NotificationPreferences,
    value: boolean,
  ) => void;
};

export const useProfilePreferencesStore = create<ProfilePreferencesState>()(
  persist(
    (set) => ({
      notifications: {
        campusUpdates: true,
        eventReminders: true,
        accountActivity: true,
        securityAlerts: true,
      },
      setNotificationPreference: (key, value) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            [key]: value,
          },
        })),
    }),
    {
      name: "identity-profile-preferences",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ notifications: state.notifications }),
    },
  ),
);
