import {
  AlertCircle,
  Clock3,
  RefreshCw,
  ShieldCheck,
} from "lucide-react-native";
import { ActivityIndicator, Pressable, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { AppBottomSheet } from "@/components/shared/AppBottomSheet";
import { AppText } from "@/components/ui/AppText";
import { useAppTheme } from "@/theme/useAppTheme";

// --------------------------------------------------
// TYPES
// --------------------------------------------------

export type VerificationQrStatus = "loading" | "ready" | "expired" | "error";

interface StudentQrBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  status: VerificationQrStatus;

  // Backend-generated credential
  qrPayload?: string | null;

  // Kept for compatibility with existing callers
  studentName?: string | null;
  studentId?: string | null;
  collegeName?: string | null;
  expiresAt?: string | null;

  // Explicit user-triggered refresh only
  onRefresh?: () => void | Promise<void>;
  isRefreshing?: boolean;

  remainingSeconds?: number;
  errorMessage?: string;
}

// --------------------------------------------------
// CONSTANTS
// --------------------------------------------------

const QR_SIZE = 200;
const CARD_SIZE = 240;
const QR_PADDING = 16;
const WARNING_SECONDS = 30;
const QR_LIFETIME_SECONDS = 60;

const WARNING_COLOR = "#D97706";

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function formatCountdown(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));

  const minutes = Math.floor(safeSeconds / 60);
  const remaining = safeSeconds % 60;

  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

// --------------------------------------------------
// COMPONENT
// --------------------------------------------------

export function StudentQrBottomSheet({
  visible,
  onClose,
  status,
  qrPayload,
  onRefresh,
  isRefreshing = false,
  remainingSeconds,
  errorMessage,
}: StudentQrBottomSheetProps) {
  const { theme } = useAppTheme();
  const colors = theme.colors;

  const payload = qrPayload?.trim() ?? "";

  // ------------------------------------------------
  // STATUS
  // ------------------------------------------------

  const isLoading = status === "loading";

  const isExpired =
    status === "expired" ||
    (status === "ready" &&
      remainingSeconds !== undefined &&
      remainingSeconds <= 0);

  const isError =
    status === "error" || (status === "ready" && payload.length === 0);

  const isReady =
    status === "ready" && !isExpired && !isError && payload.length > 0;

  const isLowTime =
    isReady &&
    remainingSeconds !== undefined &&
    remainingSeconds <= WARNING_SECONDS;

  const progress =
    remainingSeconds === undefined
      ? 100
      : Math.min(
          100,
          Math.max(0, (remainingSeconds / QR_LIFETIME_SECONDS) * 100),
        );

  const timeColor = isLowTime ? WARNING_COLOR : colors.textSecondary;

  // ------------------------------------------------
  // ACTIONS
  // ------------------------------------------------

  const handleRefresh = () => {
    if (!onRefresh || isRefreshing) return;

    void onRefresh();
  };

  // ------------------------------------------------
  // REUSABLE REFRESH BUTTON
  // ------------------------------------------------

  const RefreshButton = (
    <Pressable
      onPress={handleRefresh}
      disabled={isRefreshing || !onRefresh}
      accessibilityRole="button"
      accessibilityLabel="Reload QR code"
      accessibilityState={{
        disabled: isRefreshing || !onRefresh,
        busy: isRefreshing,
      }}
      style={{
        width: 54,
        height: 54,
        borderRadius: 27,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.surfaceSecondary,
        opacity: isRefreshing ? 0.6 : 1,
      }}
    >
      {isRefreshing ? (
        <ActivityIndicator size="small" color={colors.textSecondary} />
      ) : (
        <RefreshCw size={23} color={colors.textSecondary} strokeWidth={2} />
      )}
    </Pressable>
  );

  // ------------------------------------------------
  // MAIN UI
  // ------------------------------------------------

  return (
    <AppBottomSheet
      visible={visible}
      onClose={onClose}
      title="Campus Verification"
    >
      <View className="items-center pb-8 pt-2">
        {/* HEADER DESCRIPTION */}

        <AppText className="mb-6 text-center text-xs" color="secondary">
          Show this QR code at your campus entry point.
        </AppText>

        {/* QR CARD */}

        <View
          style={{
            width: CARD_SIZE,
            height: CARD_SIZE,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.background,
            borderRadius: 28,
          }}
        >
          {/* LOADING */}

          {/* {isLoading && (
            <View className="items-center gap-4">
              <ActivityIndicator size="large" color={colors.primary} />

              <View className="items-center gap-1">
                <AppText
                  className="text-sm font-semibold"
                  style={{ color: "#16243A" }}
                >
                  Preparing your pass
                </AppText>

                <AppText className="text-xs" style={{ color: "#64748B" }}>
                  Please wait a moment...
                </AppText>
              </View>
            </View>
          )} */}

          {isLoading && (
            <ActivityIndicator size="large" color={colors.primary} />
          )}

          {/* ACTIVE QR */}

          {isReady && (
            <View
              style={{
                padding: 14,
                backgroundColor: "#FFFFFF",
                borderRadius: 22,
              }}
            >
              <QRCode
                value={payload}
                size={QR_SIZE}
                color="#161616"
                backgroundColor="#FFFFFF"
                quietZone={0}
                ecl="H"
              />
            </View>
          )}

          {/* EXPIRED */}
          {isExpired && (
            <View className="items-center">
              <AppText className="mb-5 text-sm font-semibold" color="secondary">
                QR code expired
              </AppText>

              {RefreshButton}
            </View>
          )}

          {/* ERROR */}

          {isError && (
            <View className="items-center px-6">
              <View
                className="mb-4 h-14 w-14 items-center justify-center rounded-full"
                style={{
                  backgroundColor: "#FEF2F2",
                }}
              >
                <AlertCircle
                  size={26}
                  color={colors.danger}
                  strokeWidth={1.8}
                />
              </View>

              <AppText
                className="mb-2 text-center text-sm font-bold"
                style={{ color: "#16243A" }}
              >
                Unable to generate QR
              </AppText>

              <AppText
                className="mb-5 text-center text-xs"
                style={{ color: "#64748B" }}
              >
                {errorMessage ?? "Something went wrong. Please try again."}
              </AppText>

              {RefreshButton}
            </View>
          )}
        </View>

        {/* COUNTDOWN */}

        {isReady && (
          <View className="mt-6 flex-row items-center gap-2">
            <Clock3 size={16} color={timeColor} />

            <AppText className="text-sm font-medium" color="secondary">
              {remainingSeconds !== undefined
                ? `Expires in ${formatCountdown(remainingSeconds)}`
                : "Your pass is active"}
            </AppText>
          </View>
        )}

        {/* SECURITY FOOTER */}

        <View className="mt-7 flex-row items-center gap-2">
          <ShieldCheck size={15} color={colors.success} strokeWidth={2} />

          <AppText className="text-xs" color="secondary">
            Single-use campus verification
          </AppText>
        </View>
      </View>
    </AppBottomSheet>
  );
}
