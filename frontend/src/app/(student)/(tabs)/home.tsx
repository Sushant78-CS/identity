import { useCallback, useEffect, useRef, useState } from "react";
import { useTabBarStore } from "../../../features/student/stores/tab-bar.store";

import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronRight,
  CircleCheck,
  Ellipsis,
  IdCard,
  Megaphone,
  QrCode,
  Search,
  Share2,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react-native";

import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Share,
  useWindowDimensions,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  StudentQrBottomSheet,
  VerificationQrStatus,
} from "@/features/digital-id/components/StudentQrBottomSheet";
import {
  DigitalIdQrService,
  getQrErrorMessage,
} from "@/features/digital-id/services/qr.service";
import { useAppTheme } from "@/theme/useAppTheme";
import { useRouter } from "expo-router";
import type { ViewInstance } from "react-native";

// const categories = ["Discover", "Announcements", "Events", "Campus services"];

type HomeCategory = "Discover" | "Announcements" | "Events" | "Campus services";

type HomeFeedItem = {
  id: string;
  category: string;
  title: string;
  description: string;
  meta: string;
};

const categories: HomeCategory[] = [
  "Discover",
  "Announcements",
  "Events",
  "Campus services",
];

const announcementItems: HomeFeedItem[] = [
  {
    id: "notice-1",
    category: "EXAMINATION",
    title: "Semester 4 examination timetable",
    description:
      "The examination timetable will be available for students to review.",
    meta: "Sample notice",
  },
  {
    id: "notice-2",
    category: "ACADEMIC",
    title: "Academic calendar update",
    description: "Check important academic dates and upcoming activities.",
    meta: "Sample notice",
  },
  {
    id: "notice-3",
    category: "GENERAL",
    title: "Library notice",
    description:
      "Check the latest information about library facilities and timings.",
    meta: "Sample notice",
  },
];

const eventItems: HomeFeedItem[] = [
  {
    id: "event-1",
    category: "WORKSHOP",
    title: "Web development workshop",
    description:
      "Learn about modern frontend development through practical sessions.",
    meta: "Sample event",
  },
  {
    id: "event-2",
    category: "TECHNICAL",
    title: "Inter-college technical fest",
    description: "Explore technical competitions and student activities.",
    meta: "Sample event",
  },
  {
    id: "event-3",
    category: "CULTURAL",
    title: "Annual cultural celebration",
    description:
      "Explore upcoming cultural activities and student performances.",
    meta: "Sample event",
  },
];

const serviceItems: HomeFeedItem[] = [
  {
    id: "service-1",
    category: "LIBRARY",
    title: "College library",
    description: "Access books, reading spaces and academic resources.",
    meta: "Campus facility",
  },
  {
    id: "service-2",
    category: "LABORATORY",
    title: "Computer laboratories",
    description: "Information about available computer laboratory facilities.",
    meta: "Campus facility",
  },
  {
    id: "service-3",
    category: "FOOD",
    title: "College canteen",
    description: "Find information about campus food and refreshments.",
    meta: "Campus facility",
  },
  {
    id: "service-4",
    category: "CONNECTIVITY",
    title: "Campus Wi-Fi",
    description: "Information about student access to campus connectivity.",
    meta: "Campus facility",
  },
];

const highlights = [
  {
    id: "1",
    category: "ACADEMIC",
    title: "Academic resources",
    description: "Find important academic information and updates.",
    action: "Explore resources",
    icon: BookOpen,
    accent: "#4788EC",
    accentBackground: "rgba(71,136,236,0.14)",
  },
  {
    id: "2",
    category: "CAMPUS",
    title: "Campus events",
    description: "Stay informed about activities happening on campus.",
    action: "Explore events",
    icon: CalendarDays,
    accent: "#B17CE8",
    accentBackground: "rgba(177,124,232,0.14)",
  },
  {
    id: "3",
    category: "SECURITY",
    title: "Campus access",
    description: "Your digital identity for campus verification.",
    action: "View digital ID",
    icon: ShieldCheck,
    accent: "#36A879",
    accentBackground: "rgba(54,168,121,0.14)",
  },
];

const recentActivities = [
  {
    id: "1",
    title: "Campus entry verified",
    description: "Example activity · Today, 9:42 AM",
    icon: CircleCheck,
    accent: "#36A879",
    accentBackground: "rgba(54,168,121,0.14)",
  },
  {
    id: "2",
    title: "Digital ID accessed",
    description: "Example activity · Yesterday",
    icon: IdCard,
    accent: "#4788EC",
    accentBackground: "rgba(71,136,236,0.14)",
  },
  {
    id: "3",
    title: "Profile details reviewed",
    description: "Example activity · Sample timeline",
    icon: UserRound,
    accent: "#B17CE8",
    accentBackground: "rgba(177,124,232,0.14)",
  },
];

const showComingSoon = (title: string) => {
  Alert.alert(title, "This feature will be available soon.");
};

// --------------------------------------------------
// Student Home
// --------------------------------------------------

export default function StudentDashboard() {
  const { theme, isDark } = useAppTheme();
  const router = useRouter();
  const colors = theme.colors;

  const backgroundCard = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  };

  const [showHomeMenu, setShowHomeMenu] = useState(false);
  const [activeCategory, setActiveCategory] =
    useState<HomeCategory>("Discover");

  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  const menuButtonRef = useRef<ViewInstance>(null);

  const { width: screenWidth } = useWindowDimensions();

  const openHomeMenu = () => {
    menuButtonRef.current?.measureInWindow((x, y, width, height) => {
      const menuWidth = 196;

      const left = Math.max(
        12,
        Math.min(x + width - menuWidth, screenWidth - menuWidth - 12),
      );

      setMenuPosition({
        top: y + height + 8,
        left,
      });

      setShowHomeMenu(true);
    });
  };

  const secondaryBackground = {
    backgroundColor: colors.surfaceSecondary,
  };

  const user = useAuthStore((state) => state.user);

  const studentName = user?.fullName || "Student";
  const firstName = studentName.split(" ")[0];

  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [qrSheetVisible, setQrSheetVisible] = useState(false);

  const [qrStatus, setQrStatus] = useState<VerificationQrStatus>("loading");

  const [qrPayload, setQrPayload] = useState<string | null>(null);

  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const [isRefreshingQr, setIsRefreshingQr] = useState(false);

  const [qrErrorMessage, setQrErrorMessage] = useState<string | undefined>();

  const qrRequestInFlight = useRef(false);
  const studentProfile = useAuthStore((state) => state.studentProfile);

  const studentId =
    studentProfile?.studentId ?? user?.studentId ?? "Not available";

  const collegeName = studentProfile?.college?.name ?? null;

  // Tab bar visibility
  const setTabBarVisible = useTabBarStore((state) => state.setVisible);

  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const DEMO_QR_PAYLOAD = "IDENTITY-DEMO|STUDENT|TEST-ONLY|NOT-VALID-FOR-ENTRY";

  const clearScrollTimeout = () => {
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
      scrollTimeout.current = null;
    }
  };

  const hideTabBar = () => {
    clearScrollTimeout();
    setTabBarVisible(false);
  };

  const scheduleShowTabBar = () => {
    clearScrollTimeout();

    scrollTimeout.current = setTimeout(() => {
      setTabBarVisible(true);
      scrollTimeout.current = null;
    }, 180);
  };

  // User starts dragging
  const handleScrollBeginDrag = () => {
    hideTabBar();
  };

  // User releases their finger
  const handleScrollEndDrag = () => {
    scheduleShowTabBar();
  };

  // Scroll momentum begins
  const handleMomentumScrollBegin = () => {
    hideTabBar();
  };

  // Scrolling completely stops
  const handleMomentumScrollEnd = () => {
    clearScrollTimeout();
    setTabBarVisible(true);
  };

  // Reset visibility when entering or leaving the screen
  useEffect(() => {
    setTabBarVisible(true);

    return () => {
      clearScrollTimeout();
      setTabBarVisible(true);
    };
  }, [setTabBarVisible]);

  const heroBackground = isDark ? "#164CA5" : "#2468DF";
  const heroText = "#FFFFFF";
  const heroMuted = "#D9E7FF";
  const heroAccent = "#FFD84D";

  const handleShareIdentity = async () => {
    setShowHomeMenu(false);

    try {
      await Share.share(
        {
          title: "Share Identity",
          message:
            "Discover Identity — your digital campus platform for student identity, campus updates and verification.",
        },
        {
          dialogTitle: "Share Identity",
          subject: "Discover Identity",
        },
      );
    } catch {
      // Display your existing AppToast error feedback here if needed.
    }
  };

  const renderCategoryFeed = (
    heading: string,
    subtitle: string,
    items: HomeFeedItem[],
    onViewAll?: () => void,
  ) => (
    <View className="mt-6">
      {/* <View className="mb-4">
        <AppText className="text-xl font-extrabold">{heading}</AppText>

        <AppText color="muted" className="mt-1 text-[11px]">
          {subtitle}
        </AppText>
      </View> */}

      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-1">
          <AppText className="text-xl font-extrabold">{heading}</AppText>

          <AppText color="muted" className="mt-1 text-[11px]">
            {subtitle}
          </AppText>
        </View>

        {onViewAll && (
          <Pressable
            onPress={onViewAll}
            accessibilityRole="button"
            className="ml-3 flex-row items-center"
          >
            <AppText
              className="text-[11px] font-semibold"
              style={{ color: colors.primary }}
            >
              View all
            </AppText>

            <ChevronRight size={15} color={colors.primary} />
          </Pressable>
        )}
      </View>

      <View className="gap-3">
        {items.map((item) => (
          <View
            key={item.id}
            className="rounded-[21px] border p-4"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <View className="mb-2 flex-row items-center justify-between">
              <AppText
                className="text-[9px] font-bold tracking-wider"
                style={{ color: colors.primary }}
              >
                {item.category}
              </AppText>

              <AppText
                className="text-[9px]"
                style={{ color: colors.textMuted }}
              >
                {item.meta}
              </AppText>
            </View>

            <AppText className="text-[14px] font-bold">{item.title}</AppText>

            <AppText
              color="secondary"
              className="mt-1 text-[11px] leading-[18px]"
            >
              {item.description}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );

  const generateStudentQr = useCallback(async () => {
    if (qrRequestInFlight.current) return;

    qrRequestInFlight.current = true;

    setIsRefreshingQr(true);
    setQrStatus("loading");
    setQrPayload(null);
    setExpiresAt(null);
    setRemainingSeconds(0);
    setQrErrorMessage(undefined);

    try {
      const response = await DigitalIdQrService.generateStudentQr();

      const expiryTimestamp = Date.parse(response.expiresAt);

      if (!Number.isFinite(expiryTimestamp) || expiryTimestamp <= Date.now()) {
        throw new Error("The generated QR code has expired.");
      }

      const secondsUntilExpiry = Math.ceil(
        (expiryTimestamp - Date.now()) / 1000,
      );

      setQrPayload(response.qrValue);
      setExpiresAt(response.expiresAt);

      setRemainingSeconds(
        Math.max(0, Math.min(response.expiresInSeconds, secondsUntilExpiry)),
      );

      setQrStatus("ready");
    } catch (error: unknown) {
      setQrPayload(null);
      setQrStatus("error");
      setQrErrorMessage(getQrErrorMessage(error));
    } finally {
      qrRequestInFlight.current = false;
      setIsRefreshingQr(false);
    }
  }, []);

  useEffect(() => {
    if (!qrSheetVisible || qrStatus !== "ready" || !expiresAt) {
      return;
    }

    const updateCountdown = () => {
      const remaining = Math.max(
        0,
        Math.ceil((Date.parse(expiresAt) - Date.now()) / 1000),
      );

      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        setQrPayload(null);
        setQrStatus("expired");

        // void generateStudentQr();
      }
    };

    const interval = setInterval(updateCountdown, 1000);

    updateCountdown();

    return () => clearInterval(interval);
  }, [qrSheetVisible, qrStatus, expiresAt, generateStudentQr]);

  const handleOpenQrSheet = () => {
    setQrSheetVisible(true);
    void generateStudentQr();
  };

  const handleCloseQrSheet = () => {
    setQrSheetVisible(false);
    setQrPayload(null);
    setExpiresAt(null);
    setRemainingSeconds(0);
    setQrStatus("loading");
  };

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top", "left", "right"]}
      style={{ backgroundColor: colors.background }}
    >
      {/* FIXED HEADER */}
      <View className="px-5 pb-2 pt-2">
        <View className="mt-2 flex-row items-center justify-between">
          <AppText className="text-[23px] font-extrabold tracking-tight">
            IDENTITY
          </AppText>

          <View className="flex-row items-center gap-1">
            <Pressable
              onPress={() => router.navigate("/(student)/(screens)/search")}
              accessibilityRole="button"
              accessibilityLabel="Search"
              hitSlop={8}
              className="h-10 w-10 items-center justify-center rounded-full"
            >
              <Search size={21} color={colors.textPrimary} />
            </Pressable>

            <Pressable
              onPress={() =>
                router.navigate("/(student)/(screens)/notification")
              }
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              hitSlop={8}
              className="h-10 w-10 items-center justify-center rounded-full"
            >
              <Bell size={21} color={colors.textPrimary} />
            </Pressable>

            <View ref={menuButtonRef} collapsable={false}>
              <Pressable
                onPress={openHomeMenu}
                className="h-10 w-10 items-center justify-center"
                accessibilityRole="button"
                accessibilityLabel="More options"
              >
                <Ellipsis size={25} color={colors.textPrimary} />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pb-32"
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollBegin={handleMomentumScrollBegin}
        onMomentumScrollEnd={handleMomentumScrollEnd}
      >
        {/*  */}
        <Modal
          visible={showHomeMenu}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => setShowHomeMenu(false)}
        >
          <View style={{ flex: 1 }}>
            {/* Outside press closes the menu */}
            <Pressable
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
              onPress={() => setShowHomeMenu(false)}
              accessibilityLabel="Close menu"
            />

            {/* Floating dropdown */}
            <View
              style={{
                position: "absolute",
                top: menuPosition.top,
                left: menuPosition.left,
                width: 196,
                backgroundColor: colors.surface,
                borderRadius: 22,
                paddingVertical: 7,
                borderWidth: 1,
                borderColor: colors.border,
                elevation: 12,
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.25,
                shadowRadius: 12,
              }}
            >
              <Pressable
                onPress={() => void handleShareIdentity()}
                className="flex-row items-center px-4 py-4 active:opacity-60"
                accessibilityRole="button"
                accessibilityLabel="Share Identity"
              >
                <Share2 size={19} color={colors.textPrimary} />

                <AppText
                  className="ml-3 text-[14px] font-medium"
                  style={{ color: colors.textPrimary }}
                >
                  Share Identity
                </AppText>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* FEATURE BANNER */}

        <View
          className="mt-6 overflow-hidden rounded-[26px] p-5"
          style={{
            backgroundColor: heroBackground,
            minHeight: 205,
          }}
        >
          {/* Decorative shapes */}

          <View
            pointerEvents="none"
            className="absolute -right-12 -top-14 h-52 w-52 rounded-full"
            style={{
              backgroundColor: "rgba(255,255,255,0.10)",
            }}
          />

          <View
            pointerEvents="none"
            className="absolute -bottom-12 right-12 h-36 w-36 rounded-full"
            style={{
              backgroundColor: "rgba(255,255,255,0.08)",
            }}
          />

          {/* Banner heading */}

          <View className="flex-row items-center justify-between">
            <View
              className="rounded-full px-3 py-1.5"
              style={{
                backgroundColor: "rgba(255,255,255,0.16)",
              }}
            >
              <AppText className="text-[9px] font-bold tracking-[1.4px] text-white">
                YOUR CAMPUS PLATFORM
              </AppText>
            </View>

            {/* <AppText
              className="text-[10px] font-semibold"
              style={{ color: heroMuted }}
            >
              01 / 03
            </AppText> */}
          </View>

          {/* QR quick access area */}

          {/* <Pressable
            onPress={() => setQrSheetVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Open your campus verification QR"
            className="mt-5 flex-row items-center active:opacity-80"
          > */}
          <Pressable
            onPress={handleOpenQrSheet}
            accessibilityRole="button"
            accessibilityLabel="Open your campus verification QR"
            className="mt-5 flex-row items-center active:opacity-80"
          >
            <View className="flex-1 pr-1">
              <AppText
                className="text-[29px] font-extrabold leading-[34px]"
                style={{ color: heroText }}
              >
                Your campus.
              </AppText>

              <AppText
                className="text-[29px] font-extrabold leading-[34px]"
                style={{ color: heroAccent }}
              >
                Your identity.
              </AppText>

              <AppText
                className="mt-2 max-w-[215px] text-[11px] leading-[17px]"
                style={{ color: heroMuted }}
              >
                Tap to quickly access your campus verification QR.
              </AppText>
            </View>

            <View className="items-center justify-center">
              <QrCode
                size={90}
                color="rgba(255,255,255,0.65)"
                strokeWidth={1.5}
              />

              <AppText
                className="mt-2 text-[8px] font-bold tracking-widest"
                style={{ color: heroMuted }}
              >
                TAP TO SCAN
              </AppText>
            </View>
          </Pressable>

          {/* Explore ID - separate navigation action */}

          <View className="mt-4 flex-row">
            <Pressable
              onPress={() => router.navigate("/(student)/(tabs)/id-card")}
              accessibilityRole="button"
              accessibilityLabel="Explore your digital ID"
              className="flex-row items-center rounded-full bg-white px-3 py-2 active:opacity-80"
            >
              <AppText
                className="text-[10px] font-bold"
                style={{ color: "#174B9B" }}
              >
                Explore your ID
              </AppText>

              <ChevronRight
                size={14}
                color="#174B9B"
                style={{ marginLeft: 4 }}
              />
            </Pressable>
          </View>
        </View>

        {/* CATEGORY CHIPS */}

        {/* <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-5"
          contentContainerClassName="gap-2 pr-2"
        >
          {categories.map((category, index) => (
            <Pressable
              key={category}
              onPress={() => {
                if (index !== 0) {
                  showComingSoon(category);
                }
              }}
              className="rounded-full px-4 py-3 active:opacity-70"
              style={{
                backgroundColor:
                  index === 0 ? colors.textPrimary : colors.surfaceSecondary,
              }}
            >
              <AppText
                className="text-xs font-bold"
                style={{
                  color: index === 0 ? colors.inverse : colors.textPrimary,
                }}
              >
                {category}
              </AppText>
            </Pressable>
          ))}
        </ScrollView> */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-5"
          contentContainerClassName="gap-2 pr-2"
        >
          {categories.map((category) => {
            const isActive = activeCategory === category;

            return (
              <Pressable
                key={category}
                onPress={() => {
                  setActiveCategory(category);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                className="rounded-full px-4 py-3 active:opacity-70"
                style={{
                  backgroundColor: isActive
                    ? colors.textPrimary
                    : colors.surfaceSecondary,
                }}
              >
                <AppText
                  className="text-xs font-bold"
                  style={{
                    color: isActive ? colors.inverse : colors.textPrimary,
                  }}
                >
                  {category}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/*  */}
        {/* COLLEGE CHANNEL SHORTCUT */}
        {activeCategory === "Discover" && (
          <Pressable
            onPress={() => router.push("/(student)/(screens)/college-channel")}
            accessibilityRole="button"
            accessibilityLabel="Open official College Channel"
            className="mt-5 rounded-[23px] border p-4 active:opacity-80"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-center">
              <View
                className="mr-3 h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: colors.primaryLight }}
              >
                <Megaphone size={22} color={colors.primary} />
              </View>

              <View className="flex-1">
                <View className="flex-row items-center">
                  <AppText className="text-[14px] font-extrabold">
                    College Channel
                  </AppText>
                  <ShieldCheck
                    size={14}
                    color={colors.success}
                    style={{ marginLeft: 5 }}
                  />
                </View>

                <AppText
                  className="mt-1 text-[10px]"
                  style={{ color: colors.textSecondary }}
                >
                  Official updates from your college
                </AppText>
              </View>

              <ChevronRight size={20} color={colors.textSecondary} />
            </View>

            <View
              className="mt-4 flex-row items-center justify-between border-t pt-3"
              style={{ borderTopColor: colors.border }}
            >
              <AppText
                className="text-[9px]"
                style={{ color: colors.textMuted }}
              >
                Admin-only posts · Read-only for students
              </AppText>

              <AppText
                className="text-[10px] font-bold"
                style={{ color: colors.primary }}
              >
                Open channel
              </AppText>
            </View>
          </Pressable>
        )}

        {/* ANNOUNCEMENTS FEED */}
        {activeCategory === "Announcements" &&
          renderCategoryFeed(
            "Announcements",
            "Official updates from your college",
            announcementItems,
            () => router.push("/(student)/(screens)/announcements"),
          )}

        {/* EVENTS FEED */}
        {activeCategory === "Events" &&
          renderCategoryFeed(
            "Campus events",
            "Explore activities happening around your campus",
            eventItems,
          )}

        {/* CAMPUS SERVICES FEED */}
        {activeCategory === "Campus services" &&
          renderCategoryFeed(
            "Campus services",
            "Explore facilities and services available to students",
            serviceItems,
          )}

        {/* ANNOUNCEMENT PANEL */}

        {announcementVisible && (
          <View
            className="mt-5 rounded-[25px] p-5"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View
                  className="h-10 w-10 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: "rgba(232,166,57,0.15)",
                  }}
                >
                  <Megaphone size={20} color="#D99A2B" />
                </View>

                <AppText className="text-base font-bold">Campus Notice</AppText>
              </View>

              <Pressable
                onPress={() => setAnnouncementVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Dismiss announcement"
                hitSlop={10}
                className="h-8 w-8 items-center justify-center rounded-full"
                style={secondaryBackground}
              >
                <X size={17} color={colors.textSecondary} />
              </Pressable>
            </View>

            <AppText className="mt-3 text-sm font-medium leading-6">
              Stay informed about important campus announcements and upcoming
              academic activities.
            </AppText>

            <View className="mt-3 flex-row items-center">
              <View
                className="rounded-full px-2.5 py-1"
                style={{
                  backgroundColor: "rgba(217,154,43,0.13)",
                }}
              >
                <AppText
                  className="text-[9px] font-bold"
                  style={{ color: "#D99A2B" }}
                >
                  SAMPLE NOTICE
                </AppText>
              </View>
            </View>
          </View>
        )}

        {/* CAMPUS HIGHLIGHTS */}

        {/* <View className="mt-7">
          <View className="flex-row items-center justify-between">
            <View>
              <AppText className="text-xl font-extrabold">
                Campus highlights
              </AppText>
              <AppText color="muted" className="mt-1 text-[11px]">
                Explore what's available to you
              </AppText>
            </View>

            <Pressable
              onPress={() => showComingSoon("Campus highlights")}
              accessibilityRole="button"
              className="h-9 w-9 items-center justify-center rounded-full active:opacity-60"
            >
              <ChevronRight size={23} color={colors.textPrimary} />
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-4"
            contentContainerClassName="gap-3 pr-2"
          >
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <Pressable
                  key={item.id}
                  onPress={() => showComingSoon(item.title)}
                  accessibilityRole="button"
                  className="w-[245px] rounded-[23px] border p-4 active:opacity-70"
                  style={backgroundCard}
                >
                  <View className="flex-row items-center justify-between">
                    <View
                      className="h-11 w-11 items-center justify-center rounded-2xl"
                      style={{
                        backgroundColor: item.accentBackground,
                      }}
                    >
                      <Icon size={21} color={item.accent} />
                    </View>

                    <View
                      className="rounded-full px-2.5 py-1"
                      style={{
                        backgroundColor: item.accentBackground,
                      }}
                    >
                      <AppText
                        className="text-[9px] font-bold"
                        style={{ color: item.accent }}
                      >
                        {item.category}
                      </AppText>
                    </View>
                  </View>

                  <AppText className="mt-5 text-base font-bold">
                    {item.title}
                  </AppText>

                  <AppText
                    color="secondary"
                    className="mt-1 text-[11px] leading-[17px]"
                  >
                    {item.description}
                  </AppText>

                  <View className="mt-5 flex-row items-center">
                    <AppText
                      className="text-[11px] font-bold"
                      style={{ color: item.accent }}
                    >
                      {item.action}
                    </AppText>
                    <ChevronRight
                      size={14}
                      color={item.accent}
                      style={{ marginLeft: 3 }}
                    />
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View> */}

        {/* RECENT ACTIVITY */}

        {/* <View className="mt-8">
          <View className="flex-row items-center justify-between">
            <View>
              <AppText className="text-xl font-extrabold">
                Recent activity
              </AppText>
              <AppText color="muted" className="mt-1 text-[11px]">
                Your recent campus interactions
              </AppText>
            </View>

            <View
              className="rounded-full px-2.5 py-1.5"
              style={{
                backgroundColor: "rgba(71,136,236,0.13)",
              }}
            >
              <AppText
                className="text-[9px] font-bold"
                style={{ color: "#4788EC" }}
              >
                DEMO DATA
              </AppText>
            </View>
          </View>

          <View
            className="mt-4 rounded-[23px] border p-4"
            style={backgroundCard}
          >
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon;
              const isLast = index === recentActivities.length - 1;

              return (
                <View key={activity.id} className="flex-row">
                  <View className="mr-3 items-center">
                    <View
                      className="h-10 w-10 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: activity.accentBackground,
                      }}
                    >
                      <Icon size={18} color={activity.accent} />
                    </View>

                    {!isLast && (
                      <View
                        className="my-1 h-7 w-[1px]"
                        style={{
                          backgroundColor: colors.border,
                        }}
                      />
                    )}
                  </View>

                  <View className="flex-1 pb-5">
                    <AppText className="text-xs font-bold">
                      {activity.title}
                    </AppText>

                    <AppText color="muted" className="mt-1 text-[10px]">
                      {activity.description}
                    </AppText>
                  </View>
                </View>
              );
            })}
          </View>
        </View> */}

        {/* FOOTER */}

        <View className="mt-8 items-center">
          {/* <AppText
            color="muted"
            className="text-[9px] font-semibold tracking-[2px]"
          >
            IDENTITY • CAMPUS PLATFORM
          </AppText> */}
        </View>
      </ScrollView>
      {/* <StudentQrBottomSheet
        visible={qrSheetVisible}
        onClose={() => setQrSheetVisible(false)}
        status="error"
        studentName={studentName}
        studentId={user?.studentId ?? "Not available"}
        errorMessage="Your live verification QR is not available yet."
      /> */}
      <StudentQrBottomSheet
        visible={qrSheetVisible}
        onClose={handleCloseQrSheet}
        status={qrStatus}
        qrPayload={qrPayload}
        studentName={studentName}
        studentId={studentId}
        collegeName={collegeName}
        expiresAt={expiresAt}
        remainingSeconds={remainingSeconds}
        onRefresh={generateStudentQr}
        isRefreshing={isRefreshingQr}
        errorMessage={qrErrorMessage}
      />
    </SafeAreaView>
  );
}
