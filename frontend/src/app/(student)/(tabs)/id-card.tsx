import { useCallback, useEffect, useRef, useState } from "react";

import {
  ChevronRight,
  QrCode,
  ShieldCheck,
  UserRound,
} from "lucide-react-native";

import { Pressable, ScrollView, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  StudentQrBottomSheet,
  VerificationQrStatus,
} from "@/features/digital-id/components/StudentQrBottomSheet";
// import { DEMO_STUDENT_CREDENTIAL } from "@/features/digital-id/constants/demo-credential";
import {
  DigitalIdQrService,
  getQrErrorMessage,
} from "@/features/digital-id/services/qr.service";
import { useTabBarStore } from "@/features/student/stores/tab-bar.store";
import { useAppTheme } from "@/theme/useAppTheme";

// --------------------------------------------------
// STUDENT ID SCREEN
// --------------------------------------------------

export default function StudentIdScreen() {
  const { theme, isDark } = useAppTheme();
  const colors = theme.colors;

  // const studentProfile = useAuthStore((state) => state.studentProfile);

  const studentProfile = useAuthStore((state) => state.studentProfile);
  const user = useAuthStore((state) => state.user);

  const studentName = studentProfile?.fullName ?? user?.fullName ?? "Student";

  const studentId =
    studentProfile?.studentId ?? user?.studentId ?? "Not available";

  const collegeName = studentProfile?.college?.name ?? "Not available";

  const [qrSheetVisible, setQrSheetVisible] = useState(false);
  const [qrStatus, setQrStatus] = useState<VerificationQrStatus>("loading");

  const [qrPayload, setQrPayload] = useState<string | null>(null);

  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const [isRefreshingQr, setIsRefreshingQr] = useState(false);

  const [qrErrorMessage, setQrErrorMessage] = useState<string | undefined>();

  const qrRequestInFlight = useRef(false);

  // ------------------------------------------------
  // Floating tab bar visibility during scrolling
  // ------------------------------------------------

  const setTabBarVisible = useTabBarStore((state) => state.setVisible);

  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearScrollTimeout = () => {
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
      scrollTimeout.current = null;
    }
  };

  const handleScrollBeginDrag = () => {
    clearScrollTimeout();
    setTabBarVisible(false);
  };

  const handleScrollEndDrag = () => {
    clearScrollTimeout();

    scrollTimeout.current = setTimeout(() => {
      setTabBarVisible(true);
      scrollTimeout.current = null;
    }, 200);
  };

  const handleMomentumScrollBegin = () => {
    clearScrollTimeout();
    setTabBarVisible(false);
  };

  const handleMomentumScrollEnd = () => {
    clearScrollTimeout();
    setTabBarVisible(true);
  };

  useEffect(() => {
    setTabBarVisible(true);

    return () => {
      clearScrollTimeout();
      setTabBarVisible(true);
    };
  }, [setTabBarVisible]);

  // ------------------------------------------------
  // Theme-aware styles
  // ------------------------------------------------

  const heroBackground = isDark ? "#164CA5" : "#2468DF";
  const heroText = "#FFFFFF";
  const heroMuted = "#D9E7FF";
  const heroAccent = "#FFD84D";

  const cardStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  };

  const secondaryStyle = {
    backgroundColor: colors.surfaceSecondary,
  };

  // ------------------------------------------------
  // Credential details
  // ------------------------------------------------

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
        throw new Error("The generated QR code has already expired.");
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

        // Request a completely new, single-use QR.
        void generateStudentQr();
      }
    };

    const interval = setInterval(updateCountdown, 1000);

    updateCountdown();

    return () => clearInterval(interval);
  }, [qrSheetVisible, qrStatus, expiresAt, generateStudentQr]);

  const handleOpenQrSheet = () => {
    setQrSheetVisible(true);

    // Request a fresh single-use credential for each opening.
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
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pb-32"
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollBegin={handleMomentumScrollBegin}
        onMomentumScrollEnd={handleMomentumScrollEnd}
      >
        {/* ====================================== */}
        {/* HEADER */}
        {/* ====================================== */}

        <View className="mt-2 flex-row items-center justify-between">
          <View>
            <AppText className="text-[23px] font-extrabold tracking-tight">
              My Digital ID
            </AppText>

            {/* <AppText color="muted" className="mt-1 text-[11px]">
              Your campus identity credential
            </AppText> */}
          </View>

          {/* <View
            className="h-11 w-11 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: "rgba(57,120,216,0.13)",
            }}
          >
            <IdCard size={21} color="#3978D8" />
          </View> */}
        </View>

        {/* ====================================== */}
        {/* CREDENTIAL CARD */}
        {/* ====================================== */}

        <View
          className="mt-6 overflow-hidden rounded-[26px] p-5"
          style={{ backgroundColor: heroBackground }}
        >
          {/* Decorative background */}

          <View
            pointerEvents="none"
            className="absolute -right-14 -top-16 h-52 w-52 rounded-full"
            style={{
              backgroundColor: "rgba(255,255,255,0.09)",
            }}
          />

          <View
            pointerEvents="none"
            className="absolute -bottom-20 right-16 h-40 w-40 rounded-full"
            style={{
              backgroundColor: "rgba(255,255,255,0.07)",
            }}
          />

          {/* Card header */}

          <View className="flex-row items-center justify-between">
            <View>
              <AppText
                className="text-[19px] font-extrabold tracking-[2px]"
                style={{ color: heroText }}
              >
                IDENTITY
              </AppText>

              <AppText
                className="mt-0.5 text-[9px] font-semibold tracking-[1.5px]"
                style={{ color: heroMuted }}
              >
                DIGITAL STUDENT CREDENTIAL
              </AppText>
            </View>

            <View
              className="rounded-full px-3 py-1.5"
              style={{
                backgroundColor: "rgba(255,255,255,0.16)",
              }}
            >
              <AppText
                className="text-[9px] font-bold tracking-wider"
                style={{ color: heroText }}
              >
                STUDENT
              </AppText>
            </View>
          </View>

          {/* Student identity */}

          <View className="mt-7 flex-row items-center">
            <View
              className="h-[66px] w-[66px] items-center justify-center rounded-2xl"
              style={{
                backgroundColor: "rgba(255,255,255,0.17)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.22)",
              }}
            >
              <UserRound size={34} color="#FFFFFF" />
            </View>

            <View className="ml-4 flex-1">
              <AppText
                className="text-[10px] font-semibold tracking-wider"
                style={{ color: heroMuted }}
              >
                STUDENT NAME
              </AppText>

              <AppText
                className="mt-1 text-lg font-extrabold"
                style={{ color: heroText }}
                numberOfLines={2}
              >
                {studentName}
              </AppText>

              <AppText
                className="mt-1 text-[11px] font-medium"
                style={{ color: heroMuted }}
              >
                {studentId}
              </AppText>
            </View>
          </View>

          {/* College information */}

          <View
            className="my-5 h-[1px]"
            style={{
              backgroundColor: "rgba(255,255,255,0.22)",
            }}
          />

          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <AppText
                className="text-[9px] font-semibold tracking-wider"
                style={{ color: heroMuted }}
              >
                ISSUED BY
              </AppText>

              <AppText
                className="mt-1 text-xs font-bold"
                style={{ color: heroText }}
                numberOfLines={2}
              >
                {collegeName}
              </AppText>
            </View>

            <View className="items-center">
              <ShieldCheck size={25} color={heroAccent} />

              <AppText
                className="mt-1 text-[8px] font-bold tracking-wider"
                style={{ color: heroMuted }}
              >
                DEMO
              </AppText>
            </View>
          </View>

          {/* Credential footer */}

          <View
            className="mt-5 flex-row items-center justify-between rounded-xl px-3 py-2.5"
            style={{
              backgroundColor: "rgba(255,255,255,0.12)",
            }}
          >
            <AppText
              className="text-[9px] font-bold tracking-wider"
              style={{ color: heroText }}
            >
              IDENTITY CAMPUS PLATFORM
            </AppText>

            <AppText
              className="text-[9px] font-bold"
              style={{ color: heroAccent }}
            >
              SAMPLE
            </AppText>
          </View>
        </View>

        {/* ====================================== */}
        {/* DEMO CREDENTIAL NOTICE */}
        {/* ====================================== */}

        {/* <View
          className="mt-4 flex-row items-start rounded-2xl p-3.5"
          style={{
            backgroundColor: "rgba(217,154,43,0.12)",
          }}
        >
          <Info size={18} color="#D99A2B" />

          <View className="ml-3 flex-1">
            <AppText className="text-xs font-bold" style={{ color: "#D99A2B" }}>
              Demo credential
            </AppText>

            <AppText
              color="secondary"
              className="mt-1 text-[10px] leading-[16px]"
            >
              This is sample identity information for interface testing. It is
              not valid for actual campus entry.
            </AppText>
          </View>
        </View> */}

        {/* ====================================== */}
        {/* VERIFICATION QR ACTION */}
        {/* ====================================== */}

        <View className="mt-7">
          <AppText className="text-lg font-bold">Campus verification</AppText>

          <AppText color="muted" className="mt-1 text-[11px]">
            Present your digital QR to authorized campus staff.
          </AppText>

          <Pressable
            onPress={handleOpenQrSheet}
            accessibilityRole="button"
            accessibilityLabel="Show verification QR"
            className="mt-4 flex-row items-center rounded-2xl p-4 active:opacity-80"
            style={{
              backgroundColor: "#2867C7",
            }}
          >
            <View
              className="h-11 w-11 items-center justify-center rounded-xl"
              style={{
                backgroundColor: "rgba(255,255,255,0.16)",
              }}
            >
              <QrCode size={24} color="#FFFFFF" />
            </View>

            <View className="ml-3 flex-1">
              <AppText
                className="text-sm font-bold"
                style={{ color: "#FFFFFF" }}
              >
                Show verification QR
              </AppText>

              <AppText
                className="mt-1 text-[10px]"
                style={{ color: "#DCE9FF" }}
              >
                Open your scannable identity code
              </AppText>
            </View>

            <ChevronRight size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* ====================================== */}
        {/* CREDENTIAL INFORMATION */}
        {/* ====================================== */}

        {/* <View className="mt-7">
          <AppText className="text-lg font-bold">
            Credential information
          </AppText>

          <AppText color="muted" className="mt-1 text-[11px]">
            Academic information linked to your identity
          </AppText>

          <View
            className="mt-4 overflow-hidden rounded-2xl border"
            style={cardStyle}
          >
            {credentialDetails.map((detail, index) => {
              const Icon = detail.icon;
              const isLast = index === credentialDetails.length - 1;

              return (
                <View key={detail.label}>
                  <View className="flex-row items-center px-4 py-3.5">
                    <View
                      className="h-10 w-10 items-center justify-center rounded-xl"
                      style={secondaryStyle}
                    >
                      <Icon size={18} color={colors.textSecondary} />
                    </View>

                    <View className="ml-3 flex-1">
                      <AppText color="muted" className="text-[10px]">
                        {detail.label}
                      </AppText>

                      <AppText className="mt-1 text-xs font-semibold">
                        {detail.value}
                      </AppText>
                    </View>
                  </View>

                  {!isLast && (
                    <View
                      className="ml-[68px] h-[1px]"
                      style={{
                        backgroundColor: colors.border,
                      }}
                    />
                  )}
                </View>
              );
            })}
          </View>
        </View> */}

        {/* ====================================== */}
        {/* HOW VERIFICATION WORKS */}
        {/* ====================================== */}

        <View className="mt-7">
          <AppText className="text-lg font-bold">
            How verification works
          </AppText>

          <View className="mt-3 rounded-2xl border p-4" style={cardStyle}>
            <View className="flex-row items-start gap-3">
              <View
                className="h-8 w-8 items-center justify-center rounded-full"
                style={{
                  backgroundColor: "rgba(57,120,216,0.13)",
                }}
              >
                <AppText
                  className="text-xs font-bold"
                  style={{ color: "#3978D8" }}
                >
                  1
                </AppText>
              </View>

              <View className="flex-1">
                <AppText className="text-xs font-bold">
                  Open your verification QR
                </AppText>

                <AppText color="muted" className="mt-1 text-[10px] leading-4">
                  Open the QR when campus staff asks for your ID.
                </AppText>
              </View>
            </View>

            <View
              className="my-3 ml-4 h-5 w-[1px]"
              style={{ backgroundColor: colors.border }}
            />

            <View className="flex-row items-start gap-3">
              <View
                className="h-8 w-8 items-center justify-center rounded-full"
                style={{
                  backgroundColor: "rgba(57,120,216,0.13)",
                }}
              >
                <AppText
                  className="text-xs font-bold"
                  style={{ color: "#3978D8" }}
                >
                  2
                </AppText>
              </View>

              <View className="flex-1">
                <AppText className="text-xs font-bold">
                  Present it to authorized staff
                </AppText>

                <AppText color="muted" className="mt-1 text-[10px] leading-4">
                  Let the authorized staff member scan your QR.
                </AppText>
              </View>
            </View>

            <View
              className="my-3 ml-4 h-5 w-[1px]"
              style={{ backgroundColor: colors.border }}
            />

            <View className="flex-row items-start gap-3">
              <View
                className="h-8 w-8 items-center justify-center rounded-full"
                style={{
                  backgroundColor: "rgba(54,168,121,0.13)",
                }}
              >
                <ShieldCheck size={16} color="#36A879" />
              </View>

              <View className="flex-1">
                <AppText className="text-xs font-bold">
                  Server verifies your credential
                </AppText>

                <AppText color="muted" className="mt-1 text-[10px] leading-4">
                  The campus system checks the verification credential and
                  returns the result.
                </AppText>
              </View>
            </View>
          </View>
        </View>

        {/* FOOTER */}

        <View className="mt-8 items-center pb-2">
          {/* <AppText
            color="muted"
            className="text-[9px] font-semibold tracking-[2px]"
          >
            IDENTITY • DIGITAL CREDENTIAL
          </AppText> */}
        </View>
      </ScrollView>

      {/* ====================================== */}
      {/* SHARED QR BOTTOM SHEET */}
      {/* ====================================== */}

      {/* <StudentQrBottomSheet
        visible={qrSheetVisible}
        onClose={() => setQrSheetVisible(false)}
        status="ready"
        qrPayload={DEMO_STUDENT_CREDENTIAL.qrPayload}
        studentName={DEMO_STUDENT_CREDENTIAL.studentName}
        studentId={DEMO_STUDENT_CREDENTIAL.studentId}
        collegeName={DEMO_STUDENT_CREDENTIAL.collegeName}
      /> */}

      <StudentQrBottomSheet
        visible={qrSheetVisible}
        onClose={handleCloseQrSheet}
        status={qrStatus}
        qrPayload={qrPayload}
        studentName={studentName}
        studentId={studentId}
        collegeName={studentProfile?.college?.name ?? null}
        expiresAt={expiresAt}
        remainingSeconds={remainingSeconds}
        onRefresh={generateStudentQr}
        isRefreshing={isRefreshingQr}
        errorMessage={qrErrorMessage}
      />
    </SafeAreaView>
  );
}
