import { BadgeCheck, UserRound } from "lucide-react-native";
import { View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { formatTime } from "@/features/staff/services/date";
import type { DailyVerificationHistory } from "@/features/verification/types/history.types";
import { useAppTheme } from "@/theme/useAppTheme";

export type VerificationRecord =
  DailyVerificationHistory["verifications"][number];

export function VerificationRecordList({
  records,
}: {
  records: VerificationRecord[];
}) {
  const { theme } = useAppTheme();
  const colors = theme.colors;

  return (
    <AppCard padding={0} gap={0}>
      {records.map((record, index) => (
        <View key={record.id}>
          <View className="flex-row items-center px-4 py-3.5">
            <View
              className="h-11 w-11 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.surfaceSecondary }}
            >
              <UserRound size={20} color={colors.textSecondary} />
            </View>

            <View className="ml-3 flex-1">
              <AppText
                variant="body"
                className="font-semibold"
                numberOfLines={1}
              >
                {record.studentName}
              </AppText>
              <AppText variant="caption" color="secondary" className="mt-0.5">
                {record.studentId}
              </AppText>
            </View>

            <View className="items-end">
              <AppText variant="caption" className="font-semibold">
                {formatTime(record.verifiedAt)}
              </AppText>
              <View className="mt-1 flex-row items-center gap-1">
                <BadgeCheck size={13} color={colors.primary} />
                <AppText variant="caption" color="secondary">
                  Verified
                </AppText>
              </View>
            </View>
          </View>

          {index !== records.length - 1 && (
            <View
              className="ml-[72px] h-px"
              style={{ backgroundColor: colors.border }}
            />
          )}
        </View>
      ))}
    </AppCard>
  );
}
