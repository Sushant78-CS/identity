import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  SettingsInfoRow,
  SettingsNotice,
  SettingsPage,
  SettingsSection,
} from "@/features/profile/components/SettingsPage";

function displayValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "Not available";
  }

  return String(value);
}

export default function PersonalInformationScreen() {
  const student = useAuthStore((state) => state.studentProfile);

  return (
    <SettingsPage
      title="Personal information"
      subtitle="Your identity and academic details associated with this campus account."
    >
      {!student ? (
        <SettingsNotice
          title="Information unavailable"
          message="Your student information could not be loaded. Please try again."
        />
      ) : (
        <>
          <SettingsSection title="Personal details">
            <SettingsInfoRow
              label="Full name"
              value={displayValue(student.fullName)}
            />
            <SettingsInfoRow
              label="Student ID"
              value={displayValue(student.studentId)}
            />
            <SettingsInfoRow
              label="Account status"
              value={displayValue(student.accountStatus)}
              showDivider={false}
            />
          </SettingsSection>

          <SettingsSection title="College details">
            <SettingsInfoRow
              label="College"
              value={displayValue(student.college?.name)}
            />
            <SettingsInfoRow
              label="College code"
              value={displayValue(student.college?.code)}
            />
            <SettingsInfoRow
              label="Admission year"
              value={displayValue(student.admissionYear)}
              showDivider={false}
            />
          </SettingsSection>

          <SettingsSection title="Academic details">
            <SettingsInfoRow
              label="Course"
              value={displayValue(student.enrollment?.course)}
            />
            <SettingsInfoRow
              label="Department"
              value={displayValue(student.enrollment?.department)}
            />
            <SettingsInfoRow
              label="Academic year"
              value={displayValue(student.enrollment?.academicYear)}
            />
            <SettingsInfoRow
              label="Semester"
              value={displayValue(student.enrollment?.semester)}
            />
            <SettingsInfoRow
              label="Enrollment status"
              value={displayValue(student.enrollment?.status)}
              showDivider={false}
            />
          </SettingsSection>

          <SettingsNotice
            title="Managed by your college"
            message="Your identity and academic details are provided by your college. Editing these details is not available in the mobile app yet."
          />
        </>
      )}
    </SettingsPage>
  );
}
