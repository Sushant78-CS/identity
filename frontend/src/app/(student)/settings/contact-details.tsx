import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  SettingsInfoRow,
  SettingsNotice,
  SettingsPage,
  SettingsSection,
} from "@/features/profile/components/SettingsPage";

export default function ContactDetailsScreen() {
  const student = useAuthStore((state) => state.studentProfile);

  const email = student?.email || "Not available";
  const phoneNumber = student?.phoneNumber || "Not available";

  return (
    <SettingsPage
      title="Contact details"
      subtitle="Contact information associated with your campus account."
    >
      {!student ? (
        <SettingsNotice
          title="Contact information unavailable"
          message="Your contact information could not be loaded. Please try again."
        />
      ) : (
        <>
          <SettingsSection title="Contact information">
            <SettingsInfoRow label="Email address" value={email} />
            <SettingsInfoRow
              label="Mobile number"
              value={phoneNumber}
              showDivider={false}
            />
          </SettingsSection>

          <SettingsNotice
            title="Managed by your college"
            message="Your official contact information is maintained by your college. Contact your college administrator to update your email address or mobile number."
          />
        </>
      )}
    </SettingsPage>
  );
}
