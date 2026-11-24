import { useRouter } from "expo-router";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  Bell,
  ChevronRight,
  CircleHelp,
  Info,
  LockKeyhole,
  LogOut,
  Mail,
  Share2,
  ShieldCheck,
  Sun,
  UserRound,
} from "lucide-react-native";

import { AppBottomSheet } from "@/components/shared/AppBottomSheet";
import { AppToast } from "@/components/shared/AppToast";
import { AppText } from "@/components/ui/AppText";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useTabBarStore } from "@/features/student/stores/tab-bar.store";
import { useAppTheme } from "@/theme/useAppTheme";

type Theme = ReturnType<typeof useAppTheme>["theme"];

type SettingsRowProps = {
  icon: ReactNode;
  iconColor: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  theme: Theme;
  showDivider?: boolean;
};

function SettingsRow({
  icon,
  iconColor,
  title,
  subtitle,
  onPress,
  theme,
  showDivider = true,
}: SettingsRowProps) {
  return (
    <View>
      <Pressable
        onPress={onPress}
        className="flex-row items-center px-3.5 py-3 active:opacity-70"
      >
        <View
          className="mr-3 h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: iconColor }}
        >
          {icon}
        </View>

        <View className="flex-1">
          <AppText
            className="text-[14px] font-medium"
            style={{ color: theme.colors.textPrimary }}
          >
            {title}
          </AppText>

          {subtitle ? (
            <AppText
              className="mt-0.5 text-[11px]"
              style={{ color: theme.colors.textSecondary }}
            >
              {subtitle}
            </AppText>
          ) : null}
        </View>

        <ChevronRight size={17} color={theme.colors.textMuted} />
      </Pressable>

      {showDivider && (
        <View
          className="ml-[66px] h-px"
          style={{ backgroundColor: theme.colors.border }}
        />
      )}
    </View>
  );
}

function SettingsGroup({
  children,
  theme,
}: {
  children: ReactNode;
  theme: Theme;
}) {
  return (
    <View
      className="overflow-hidden rounded-[21px]"
      style={{ backgroundColor: theme.colors.surface }}
    >
      {children}
    </View>
  );
}

function ProfileDetail({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: Theme;
}) {
  return (
    <View className="flex-1">
      <AppText
        className="text-[11px]"
        style={{ color: theme.colors.textMuted }}
      >
        {label}
      </AppText>

      <AppText
        className="mt-1 text-[13px] font-medium"
        style={{ color: theme.colors.textPrimary }}
      >
        {value}
      </AppText>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();

  const { theme, mode } = useAppTheme();

  const setTabBarVisible = useTabBarStore((state) => state.setVisible);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const user = useAuthStore((state) => state.user);
  const studentProfile = useAuthStore((state) => state.studentProfile);

  const fetchStudentProfile = useAuthStore(
    (state) => state.fetchStudentProfile,
  );

  const colors = theme.colors;

  const [showSignOutSheet, setShowSignOutSheet] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const [showStudentSheet, setShowStudentSheet] = useState(false);

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

  const hideToast = useCallback(() => {
    setToast((previous) => ({
      ...previous,
      visible: false,
    }));
  }, []);

  const enrollment = studentProfile?.enrollment;
  const college = studentProfile?.college;

  const logout = useAuthStore((state) => state.logout);
  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);

    try {
      await logout();
      setShowSignOutSheet(false);
    } finally {
      setIsSigningOut(false);
    }
  };

  // Fetch profile when it has not been loaded yet.
  useEffect(() => {
    if (!studentProfile) {
      void fetchStudentProfile().catch(() => {
        // The store handles the error.
      });
    }
  }, [studentProfile, fetchStudentProfile]);

  const studentName = studentProfile?.fullName ?? user?.fullName ?? "Student";

  const studentId =
    studentProfile?.studentId ?? user?.studentId ?? "Not available";

  const initials = studentName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const themeLabel =
    mode === "system"
      ? "System default"
      : mode === "light"
        ? "Light mode"
        : "Dark mode";

  // Tab bar visibility.
  useEffect(() => {
    setTabBarVisible(true);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setTabBarVisible(true);
    };
  }, [setTabBarVisible]);

  const hideTabBar = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setTabBarVisible(false);
  };

  const showTabBarSoon = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => setTabBarVisible(true), 180);
  };

  // Refresh profile from backend.
  const refreshProfile = async () => {
    setIsRefreshing(true);

    try {
      await fetchStudentProfile();
    } catch {
      Alert.alert(
        "Unable to refresh",
        "Please check your connection and try again.",
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  // Settings navigation.
  const goTo = (
    page:
      | "personal-information"
      | "contact-details"
      | "notifications"
      | "appearance"
      | "security"
      | "permissions"
      | "help-support"
      | "about",
  ) => {
    switch (page) {
      case "personal-information":
        router.push("/(student)/settings/personal-information");
        break;

      case "contact-details":
        router.push("/(student)/settings/contact-details");
        break;

      case "notifications":
        router.push("/(student)/settings/notifications");
        break;

      case "appearance":
        router.push("/(student)/settings/appearance");
        break;

      case "security":
        router.push("/(student)/settings/security");
        break;

      case "permissions":
        router.push("/(student)/settings/permissions");
        break;

      case "help-support":
        router.push("/(student)/settings/help-support");
        break;

      case "about":
        router.push("/(student)/settings/about");
        break;
    }
  };

  const handleShareStudentDetails = async () => {
    const details = [
      "IDENTITY - STUDENT DETAILS",
      "",
      `Full Name: ${studentName}`,
      `Student ID: ${studentId}`,
      `College: ${college?.name ?? "Not available"}`,
      `College Code: ${college?.code ?? "Not available"}`,
      `Department: ${enrollment?.department ?? "Not available"}`,
      `Course: ${enrollment?.course ?? "Not available"}`,
      `Admission Year: ${studentProfile?.admissionYear ?? "Not available"}`,
      `Academic Year: ${enrollment?.academicYear ?? "Not available"}`,
      `Semester: ${enrollment?.semester ?? "Not available"}`,
      `Email: ${studentProfile?.email ?? "Not available"}`,
      `Phone Number: ${studentProfile?.phoneNumber ?? "Not available"}`,
    ].join("\n");

    try {
      await Share.share(
        {
          message: details,
          title: "Student Details",
        },
        {
          dialogTitle: "Share Student Details",
          subject: "Student Details",
        },
      );
    } catch {
      setToast({
        visible: true,
        message: "Unable to share student details. Please try again.",
        type: "error",
      });
    }
  };

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1"
      style={{ backgroundColor: theme.colors.background }}
    >
      {/* FIXED PROFILE HEADER */}
      <View className="px-5 pb-4 pt-4">
        <AppText
          className="text-[27px] font-bold tracking-tight"
          style={{ color: theme.colors.textPrimary }}
        >
          Profile
        </AppText>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshProfile}
            tintColor={theme.colors.primary}
          />
        }
        onScrollBeginDrag={hideTabBar}
        onScrollEndDrag={showTabBarSoon}
        onMomentumScrollBegin={hideTabBar}
        onMomentumScrollEnd={() => setTabBarVisible(true)}
        scrollEventThrottle={16}
      >
        {/* Header */}
        {/* <View className="px-5 pb-5 pt-4">
          <View className="flex-row items-center justify-between">
            <AppText
              className="text-[27px] font-bold tracking-tight"
              style={{ color: theme.colors.textPrimary }}
            >
              Profile
            </AppText>
          </View>
        </View> */}

        <Pressable
          onPress={() => setShowStudentSheet(true)}
          accessibilityRole="button"
          accessibilityLabel="Open student profile overview"
          className="mx-5 mb-5 flex-row items-center justify-between rounded-[22px] px-4 py-4"
          style={{ backgroundColor: theme.colors.surface }}
        >
          <View className="flex-1 pr-3">
            <AppText
              className="text-[18px] font-semibold"
              style={{ color: theme.colors.textPrimary }}
            >
              {studentName}
            </AppText>

            <AppText
              className="mt-1 text-[12px]"
              style={{ color: theme.colors.textSecondary }}
            >
              Student ID: {studentId}
            </AppText>

            <AppText
              className="mt-2 text-[11px]"
              style={{ color: theme.colors.primary }}
            >
              View personal information
            </AppText>
          </View>

          <View
            className="h-[66px] w-[66px] items-center justify-center rounded-full border-2"
            style={{
              backgroundColor: theme.colors.primaryLight,
              borderColor: theme.colors.border,
            }}
          >
            <AppText
              className="text-[21px] font-semibold"
              style={{ color: theme.colors.primary }}
            >
              {initials || "S"}
            </AppText>
          </View>
        </Pressable>

        {/* Account */}
        <AppText
          className="mb-2 ml-6 text-[12px] font-semibold"
          style={{ color: theme.colors.textSecondary }}
        >
          Account
        </AppText>

        <View className="mx-5 mb-5">
          <SettingsGroup theme={theme}>
            <SettingsRow
              icon={<UserRound size={19} color="#FFFFFF" />}
              iconColor="#3478E5"
              title="Personal information"
              subtitle="Name and student details"
              onPress={() => goTo("personal-information")}
              theme={theme}
            />

            <SettingsRow
              icon={<Mail size={19} color="#FFFFFF" />}
              iconColor="#7856D9"
              title="Contact details"
              subtitle="Email and phone number"
              onPress={() => goTo("contact-details")}
              theme={theme}
              showDivider={false}
            />
          </SettingsGroup>
        </View>

        {/* Preferences */}
        <AppText
          className="mb-2 ml-6 text-[12px] font-semibold"
          style={{ color: theme.colors.textSecondary }}
        >
          Preferences
        </AppText>

        <View className="mx-5 mb-5">
          <SettingsGroup theme={theme}>
            <SettingsRow
              icon={<Bell size={19} color="#FFFFFF" />}
              iconColor="#D96A29"
              title="Notifications"
              subtitle="Campus updates and alerts"
              onPress={() => goTo("notifications")}
              theme={theme}
            />

            <SettingsRow
              icon={<Sun size={19} color="#FFFFFF" />}
              iconColor="#75B82A"
              title="Appearance"
              subtitle={themeLabel}
              onPress={() => goTo("appearance")}
              theme={theme}
              showDivider={false}
            />
          </SettingsGroup>
        </View>

        {/* Security and privacy */}
        <AppText
          className="mb-2 ml-6 text-[12px] font-semibold"
          style={{ color: theme.colors.textSecondary }}
        >
          Security and privacy
        </AppText>

        <View className="mx-5 mb-5">
          <SettingsGroup theme={theme}>
            <SettingsRow
              icon={<ShieldCheck size={19} color="#FFFFFF" />}
              iconColor="#39845A"
              title="Security and privacy"
              subtitle="Account protection"
              onPress={() => goTo("security")}
              theme={theme}
            />

            <SettingsRow
              icon={<LockKeyhole size={19} color="#FFFFFF" />}
              iconColor="#5176B9"
              title="Permissions"
              subtitle="App access and permissions"
              onPress={() => goTo("permissions")}
              theme={theme}
              showDivider={false}
            />
          </SettingsGroup>
        </View>

        {/* Support */}
        <AppText
          className="mb-2 ml-6 text-[12px] font-semibold"
          style={{ color: theme.colors.textSecondary }}
        >
          Support
        </AppText>

        <View className="mx-5 mb-5">
          <SettingsGroup theme={theme}>
            <SettingsRow
              icon={<CircleHelp size={19} color="#FFFFFF" />}
              iconColor="#8B5CF6"
              title="Help and support"
              onPress={() => goTo("help-support")}
              theme={theme}
            />

            <SettingsRow
              icon={<Info size={19} color="#FFFFFF" />}
              iconColor="#64748B"
              title="About Identity"
              onPress={() => goTo("about")}
              theme={theme}
              showDivider={false}
            />
          </SettingsGroup>
        </View>

        {/* Sign out */}
        <Pressable
          onPress={() => setShowSignOutSheet(true)}
          disabled={isSigningOut}
          className="mx-5 mb-4 flex-row items-center justify-center rounded-[18px] py-3.5"
          style={{ backgroundColor: theme.colors.surface }}
        >
          {isSigningOut ? (
            <ActivityIndicator color={theme.colors.danger} />
          ) : (
            <>
              <LogOut size={17} color={theme.colors.danger} />

              <AppText
                className="ml-2 text-[14px] font-semibold"
                style={{ color: theme.colors.danger }}
              >
                Sign out
              </AppText>
            </>
          )}
        </Pressable>

        <View>
          <AppText></AppText>
        </View>
        {/* <AppText
          className="text-center text-[10px]"
          style={{ color: theme.colors.textMuted }}
        >
          IDENTITY · CAMPUS PLATFORM
        </AppText> */}
      </ScrollView>
      <AppBottomSheet
        visible={showSignOutSheet}
        onClose={() => {
          if (!isSigningOut) {
            setShowSignOutSheet(false);
          }
        }}
        title="Sign out?"
        description="Are you sure you want to sign out of your Identity account?"
      >
        <View className="gap-3 pb-2">
          {/* Sign out button */}
          <Pressable
            onPress={() => void handleSignOut()}
            disabled={isSigningOut}
            className="h-[52px] flex-row items-center justify-center rounded-xl"
            style={{
              backgroundColor: colors.primary,
              opacity: isSigningOut ? 0.7 : 1,
            }}
          >
            {isSigningOut ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text
                style={{
                  color: colors.background,
                  fontSize: 15,
                  fontWeight: "600",
                }}
              >
                Sign out
              </Text>
            )}
          </Pressable>

          {/* Cancel button */}
          <Pressable
            onPress={() => setShowSignOutSheet(false)}
            disabled={isSigningOut}
            className="h-[52px] items-center justify-center rounded-xl"
            style={{
              backgroundColor: colors.surfaceSecondary,
              opacity: isSigningOut ? 0.5 : 1,
            }}
          >
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: 15,
                fontWeight: "600",
              }}
            >
              Cancel
            </Text>
          </Pressable>
        </View>
      </AppBottomSheet>
      <AppBottomSheet
        visible={showStudentSheet}
        onClose={() => setShowStudentSheet(false)}
        title="Student profile"
        description="A quick overview of your college information."
      >
        <View className="gap-4 pb-2">
          {/* Student identity */}
          <View className="flex-row items-center gap-3">
            <View
              className="h-14 w-14 items-center justify-center rounded-full"
              style={{
                backgroundColor: colors.primaryLight,
              }}
            >
              <AppText
                className="text-xl font-semibold"
                style={{ color: colors.primary }}
              >
                {initials || "S"}
              </AppText>
            </View>

            <View className="flex-1">
              <AppText
                className="text-[16px] font-semibold"
                style={{ color: colors.textPrimary }}
              >
                {studentName}
              </AppText>

              <AppText
                className="mt-1 text-[12px]"
                style={{ color: colors.textSecondary }}
              >
                Student ID: {studentId}
              </AppText>
            </View>
          </View>

          {/* Student overview */}
          <View
            className="gap-4 rounded-2xl p-4"
            style={{
              backgroundColor: colors.surfaceSecondary,
            }}
          >
            <View className="flex-row gap-4">
              <ProfileDetail
                label="College"
                value={college?.name ?? "Not available"}
                theme={theme}
              />

              <ProfileDetail
                label="Course"
                value={enrollment?.course ?? "Not available"}
                theme={theme}
              />
            </View>

            <View className="flex-row gap-4">
              <ProfileDetail
                label="Department"
                value={enrollment?.department ?? "Not available"}
                theme={theme}
              />

              <ProfileDetail
                label="Academic year"
                value={
                  enrollment?.academicYear != null
                    ? String(enrollment.academicYear)
                    : "Not available"
                }
                theme={theme}
              />
            </View>
          </View>

          {/* View all information */}
          <Pressable
            onPress={() => {
              setShowStudentSheet(false);
              goTo("personal-information");
            }}
            className="h-[50px] flex-row items-center justify-center rounded-xl"
            style={{
              backgroundColor: colors.surfaceSecondary,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <AppText
              className="text-[14px] font-semibold"
              style={{ color: colors.textPrimary }}
            >
              View all information
            </AppText>

            <ChevronRight size={17} color={colors.textSecondary} />
          </Pressable>

          {/* Share student details */}
          <Pressable
            onPress={() => void handleShareStudentDetails()}
            className="h-[50px] flex-row items-center justify-center rounded-xl"
            style={{
              backgroundColor: colors.primary,
            }}
          >
            <Share2 size={18} color={colors.background} />

            <AppText
              className="ml-2 text-[14px] font-semibold"
              style={{ color: colors.background }}
            >
              Share student details
            </AppText>
          </Pressable>
        </View>
      </AppBottomSheet>
      <AppToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        duration={3500}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
}
