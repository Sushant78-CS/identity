import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import {
  formatDayLabel,
  formatWeekdayShort,
  getLastDays,
  getLocalDateString,
  parseLocalDate,
} from "@/features/staff/services/date";
import { HistoryService } from "@/features/verification/services/history.service";
import type { VerificationHistorySummary } from "@/features/verification/types/history.types";
import { useAppTheme } from "@/theme/useAppTheme";

const CHART_HEIGHT = 120;

export default function TotalVerificationsScreen() {
  const { theme } = useAppTheme();
  const colors = theme.colors;
  const router = useRouter();

  const today = getLocalDateString();
  const days = useMemo(() => getLastDays(today, 7), [today]);

  const [summary, setSummary] = useState<VerificationHistorySummary | null>(
    null,
  );
  const [counts, setCounts] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);

    try {
      const [summaryResult, ...daily] = await Promise.all([
        HistoryService.getSummary(),
        ...days.map((d) => HistoryService.getDailyHistory(d)),
      ]);

      setSummary(summaryResult);
      setCounts(daily.map((d) => d.totalVerifications ?? 0));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to load verification totals.",
      );
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const weekTotal = counts.reduce((a, b) => a + b, 0);
  const average = counts.length ? Math.round(weekTotal / counts.length) : 0;
  const max = Math.max(...counts, 1);
  const bestIndex = counts.length ? counts.indexOf(Math.max(...counts)) : -1;
  const bestDay =
    bestIndex >= 0 && counts[bestIndex] > 0 ? days[bestIndex] : null;

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top"]}
      style={{ backgroundColor: colors.background }}
    >
      <View
        className="flex-row items-center px-5 pb-3 pt-3"
        style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          className="h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.surfaceSecondary }}
        >
          <ArrowLeft size={22} color={colors.textPrimary} />
        </Pressable>

        <View className="ml-3">
          <AppText variant="h2">Total verifications</AppText>
          {/* <AppText variant="caption" color="secondary" className="mt-0.5">
            Your all-time activity
          </AppText> */}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 80,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {loading ? (
          <View className="items-center py-20">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : error ? (
          <AppCard padding={4} gap={3}>
            <AppText variant="body" color="danger">
              {error}
            </AppText>
            <Pressable onPress={() => void load()}>
              <AppText variant="body" className="font-semibold">
                Try again
              </AppText>
            </Pressable>
          </AppCard>
        ) : (
          <>
            {/* All-time hero */}
            <View
              className="rounded-3xl p-6"
              style={{ backgroundColor: colors.primary }}
            >
              <AppText
                variant="caption"
                color="inverse"
                style={{ opacity: 0.85 }}
              >
                Students verified, all time
              </AppText>
              <AppText
                variant="h1"
                color="inverse"
                className="mt-2"
                style={{ fontSize: 60, lineHeight: 64, fontWeight: "700" }}
              >
                {summary?.totalVerifications ?? 0}
              </AppText>
              <AppText
                variant="caption"
                color="inverse"
                className="mt-2"
                style={{ opacity: 0.85 }}
              >
                {summary?.todayVerifications ?? 0} of them today
              </AppText>
            </View>

            {/* Week stats */}
            <View className="mt-3 flex-row gap-3">
              {[
                { label: "Last 7 days", value: String(weekTotal) },
                { label: "Daily average", value: String(average) },
                {
                  label: "Busiest day",
                  value: bestDay ? formatWeekdayShort(bestDay) : "–",
                },
              ].map((stat) => (
                <View
                  key={stat.label}
                  className="flex-1 rounded-2xl p-4"
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <AppText variant="h2" className="font-semibold">
                    {stat.value}
                  </AppText>
                  <AppText variant="caption" color="secondary" className="mt-1">
                    {stat.label}
                  </AppText>
                </View>
              ))}
            </View>

            {/* Bar chart */}
            <AppCard padding={4} gap={4} className="mt-3">
              <View>
                <AppText variant="body" className="font-semibold">
                  Last 7 days
                </AppText>
                <AppText variant="caption" color="secondary" className="mt-0.5">
                  Verifications per day
                </AppText>
              </View>

              <View className="flex-row items-end justify-between">
                {days.map((date, i) => {
                  const count = counts[i] ?? 0;
                  const height = Math.max(6, (count / max) * CHART_HEIGHT);
                  const isToday = date === today;

                  return (
                    <View key={date} className="flex-1 items-center">
                      <AppText
                        variant="caption"
                        color="secondary"
                        className="mb-1.5"
                      >
                        {count}
                      </AppText>
                      <View
                        style={{
                          height,
                          width: 22,
                          borderRadius: 8,
                          backgroundColor: isToday
                            ? colors.primary
                            : colors.surfaceSecondary,
                          borderWidth: isToday ? 0 : 1,
                          borderColor: colors.border,
                        }}
                      />
                      <AppText
                        variant="caption"
                        color={isToday ? "primary" : "secondary"}
                        className={`mt-2 ${isToday ? "font-semibold" : ""}`}
                      >
                        {parseLocalDate(date).toLocaleDateString("en-IN", {
                          weekday: "narrow",
                        })}
                      </AppText>
                    </View>
                  );
                })}
              </View>
            </AppCard>

            {/* Day-by-day list */}
            <AppCard padding={0} gap={0} className="mt-3">
              {[...days].reverse().map((date, index, arr) => {
                const count = counts[days.indexOf(date)] ?? 0;
                return (
                  <View key={date}>
                    <View className="flex-row items-center justify-between px-4 py-3.5">
                      <AppText variant="body">
                        {formatDayLabel(date, today)}
                      </AppText>
                      <AppText variant="body" className="font-semibold">
                        {count}
                      </AppText>
                    </View>
                    {index !== arr.length - 1 && (
                      <View
                        className="mx-4 h-px"
                        style={{ backgroundColor: colors.border }}
                      />
                    )}
                  </View>
                );
              })}
            </AppCard>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
