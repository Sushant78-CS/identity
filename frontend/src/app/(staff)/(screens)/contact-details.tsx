import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { StaffDetailContainer } from "@/features/staff/components/StaffDetailContainer";
import { StaffInfoRow } from "@/features/staff/components/StaffInfoRow";
import { useStaffStore } from "@/features/staff/store/staff.store";
import { useAppTheme } from "@/theme/useAppTheme";

export default function ContactDetailsScreen() {
  const profile = useStaffStore((state) => state.profile);
  const isLoading = useStaffStore((state) => state.isLoading);
  const error = useStaffStore((state) => state.error);
  const fetchProfile = useStaffStore((state) => state.fetchProfile);

  const { theme } = useAppTheme();

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  return (
    <StaffDetailContainer
      title="Contact details"
      subtitle="Your registered contact information"
    >
      {!profile && isLoading ? (
        <View className="items-center py-10">
          <ActivityIndicator color={theme.colors.primary} />
          <AppText variant="caption" color="secondary" className="mt-3">
            Loading contact details...
          </AppText>
        </View>
      ) : error && !profile ? (
        <View className="items-center px-4 py-8">
          <AppText variant="body">{error}</AppText>
          <AppText
            variant="body"
            color="brand"
            className="mt-3"
            onPress={() => void fetchProfile()}
          >
            Try again
          </AppText>
        </View>
      ) : profile ? (
        <>
          <StaffInfoRow label="Email address" value={profile.email} />
          <StaffInfoRow label="Phone number" value={profile.phoneNumber} last />
        </>
      ) : null}
    </StaffDetailContainer>
  );
}
