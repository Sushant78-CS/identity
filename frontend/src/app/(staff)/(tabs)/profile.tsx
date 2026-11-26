import {
  Bell,
  Building2,
  ChevronRight,
  CircleHelp,
  Info,
  LockKeyhole,
  LogOut,
  Mail,
  Moon,
  ShieldCheck,
  Sun,
  UserRound,
} from "lucide-react-native";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppBottomSheet } from "@/components/shared/AppBottomSheet";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { StaffService } from "@/features/staff/services/staff.service";
import type { StaffProfileResponse } from "@/features/staff/types/staff.types";
import { clearBiometricPreference } from "@/services/storage/biometric-storage";
import { useAppTheme } from "@/theme/useAppTheme";
import { Href, useRouter } from "expo-router";

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatRole(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

type ProfileMenuItemProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  iconBackground: string;
  route: Href;
  last?: boolean;
};

function ProfileMenuItem({
  icon,
  title,
  description,
  iconBackground,
  route,
  last = false,
}: ProfileMenuItemProps) {
  const { theme } = useAppTheme();
  const router = useRouter();
  const colors = theme.colors;

  return (
    <View>
      <Pressable
        onPress={() => router.push(route)}
        className="flex-row items-center px-3 py-3"
      >
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: iconBackground }}
        >
          {icon}
        </View>

        <View className="ml-3 flex-1">
          <AppText variant="body" className="font-semibold">
            {title}
          </AppText>

          {description ? (
            <AppText variant="caption" color="secondary" className="mt-0.5">
              {description}
            </AppText>
          ) : null}
        </View>

        <ChevronRight size={19} color={colors.textMuted} />
      </Pressable>

      {!last && (
        <View
          className="ml-[64px] h-px"
          style={{ backgroundColor: colors.border }}
        />
      )}
    </View>
  );
}

function ProfileSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View className="mt-7">
      <AppText
        variant="body"
        color="secondary"
        className="mb-3 ml-1 font-semibold"
      >
        {title}
      </AppText>

      <AppCard padding={0} gap={0}>
        {children}
      </AppCard>
    </View>
  );
}

export default function StaffProfileScreen() {
  const { theme, isDark } = useAppTheme();
  const colors = theme.colors;

  // const logout = useAuthStore((state) => state.logout);
  const { user, logout } = useAuthStore();

  const [profile, setProfile] = useState<StaffProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showSignOutSheet, setShowSignOutSheet] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);

    try {
      if (user?.userId != null) {
        await clearBiometricPreference(user.userId);
      }

      await logout();
      setShowSignOutSheet(false);
    } finally {
      setIsSigningOut(false);
    }
  };

  const fetchProfile = useCallback(async () => {
    try {
      setError(null);
      const response = await StaffService.getProfile();
      setProfile(response);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your profile. Please try again.",
      );
    }
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      await fetchProfile();
      setLoading(false);
    };

    void loadProfile();
  }, [fetchProfile]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText color="secondary" className="mt-3">
          Loading profile...
        </AppText>
      </SafeAreaView>
    );
  }

  if (error && !profile) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: colors.background }}
      >
        <AppText variant="h1">Unable to load profile</AppText>

        <AppText color="secondary" className="mt-2 text-center">
          {error}
        </AppText>

        <Pressable
          onPress={async () => {
            setLoading(true);
            await fetchProfile();
            setLoading(false);
          }}
          className="mt-5 rounded-xl px-6 py-3"
          style={{ backgroundColor: colors.primary }}
        >
          <AppText color="inverse" className="font-semibold">
            Try again
          </AppText>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!profile) return null;

  const isActive = profile.status.toUpperCase() === "ACTIVE";

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={["top"]}
    >
      {/* Screen heading */}
      <View className="px-5 pt-4">
        <AppText variant="h1">Profile</AppText>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 0,
          paddingBottom: 130,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Account */}
        <ProfileSection title="Account">
          <ProfileMenuItem
            icon={<UserRound size={20} color="#FFFFFF" />}
            iconBackground="#8052D6"
            title="Personal information"
            description="Name and staff details"
            route="/(staff)/(screens)/personal-information"
          />

          <ProfileMenuItem
            icon={<Mail size={20} color="#FFFFFF" />}
            iconBackground="#3478DB"
            title="Contact details"
            description="Email and phone number"
            route="/(staff)/(screens)/contact-details"
          />

          <ProfileMenuItem
            icon={<Building2 size={20} color="#FFFFFF" />}
            iconBackground="#398B70"
            title="College information"
            description={profile?.college?.name ?? "College details"}
            route="/(staff)/(screens)/college-information"
            last
          />
        </ProfileSection>

        {/* Preferences */}
        <ProfileSection title="Preferences">
          <ProfileMenuItem
            icon={<Bell size={25} color="#FFFFFF" />}
            iconBackground="#D97832"
            title="Notifications"
            description="Campus updates and alerts"
            route={"/(staff)/(screens)/notifications"}
          />

          <ProfileMenuItem
            icon={
              isDark ? (
                <Moon size={25} color="#FFFFFF" />
              ) : (
                <Sun size={25} color={"#FFFFFF"} />
              )
            }
            iconBackground="#75B832"
            title="Appearance"
            description={isDark ? "Dark mode" : "Light mode"}
            last
            route={"/(staff)/(screens)/appearance"}
          />
        </ProfileSection>

        {/* Security */}
        <ProfileSection title="Security and privacy">
          <ProfileMenuItem
            icon={<ShieldCheck size={25} color="#FFFFFF" />}
            iconBackground="#398B70"
            title="Security and privacy"
            description="Account protection"
            route={"/(staff)/(screens)/security"}
          />

          <ProfileMenuItem
            icon={<LockKeyhole size={25} color="#FFFFFF" />}
            iconBackground="#527DBD"
            title="Permissions"
            description="App access and permissions"
            last
            route={"/(staff)/(screens)/permissions"}
          />
        </ProfileSection>

        {/* Support */}
        <ProfileSection title="Support">
          <ProfileMenuItem
            icon={<CircleHelp size={25} color="#FFFFFF" />}
            iconBackground="#8052D6"
            title="Help and support"
            last={false}
            route={"/(staff)/(screens)/help-support"}
          />

          <ProfileMenuItem
            icon={<Info size={25} color="#FFFFFF" />}
            iconBackground="#64748B"
            title="About Identity"
            last
            route={"/(staff)/(screens)/about"}
          />
        </ProfileSection>

        {/* Sign out */}
        <Pressable
          onPress={() => setShowSignOutSheet(true)}
          disabled={loggingOut}
          className="mt-8 flex-row items-center justify-center rounded-2xl py-4"
          style={{
            backgroundColor: colors.surface,
            opacity: loggingOut ? 0.6 : 1,
          }}
        >
          {loggingOut ? (
            <ActivityIndicator color={colors.danger} />
          ) : (
            <>
              <LogOut size={21} color={colors.danger} />
              <AppText
                color="danger"
                variant="body"
                className="ml-3 font-semibold"
              >
                Sign out
              </AppText>
            </>
          )}
        </Pressable>

        {/* <AppText variant="caption" color="muted" className="mt-5 text-center">
          Identity · Staff Portal
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
    </SafeAreaView>
  );
}
