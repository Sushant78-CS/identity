import { useRouter } from "expo-router";
import {
  CalendarDays,
  ChartNoAxesCombined,
  ChevronRight,
  Minus,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react-native";
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
import { DatePickerModal } from "@/features/staff/components/DatePickerModal";
import { VerificationRecordList } from "@/features/staff/components/VerificationRecordList";
import {
  formatDate,
  formatDayLabel,
  getLastDays,
  getLocalDateString,
  parseLocalDate,
  shiftDate,
} from "@/features/staff/services/date";
import { HistoryService } from "@/features/verification/services/history.service";
import type {
  DailyVerificationHistory,
  VerificationHistorySummary,
} from "@/features/verification/types/history.types";
import { useAppTheme } from "@/theme/useAppTheme";

const WHITE_SOFT = "rgba(255,255,255,0.16)";

export default function StaffHistoryScreen() {
  const { theme, isDark } = useAppTheme();
  const colors = theme.colors;
  const router = useRouter();

  const today = getLocalDateString();
  const weekStrip = useMemo(() => getLastDays(today, 7).reverse(), [today]);

  const [summary, setSummary] = useState<VerificationHistorySummary | null>(
    null,
  );
  const [yesterdayCount, setYesterdayCount] = useState<number | null>(null);
  const [dailyHistory, setDailyHistory] =
    useState<DailyVerificationHistory | null>(null);

  const [selectedDate, setSelectedDate] = useState(today);
  const [calendarVisible, setCalendarVisible] = useState(false);

  const [summaryLoading, setSummaryLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    setSummaryError(null);

    try {
      const [result, yesterday] = await Promise.all([
        HistoryService.getSummary(),
        HistoryService.getDailyHistory(shiftDate(today, -1)).catch(() => null),
      ]);
      setSummary(result);
      setYesterdayCount(yesterday?.totalVerifications ?? null);
    } catch (error) {
      setSummaryError(
        error instanceof Error
          ? error.message
          : "Unable to load verification summary.",
      );
    } finally {
      setSummaryLoading(false);
    }
  }, [today]);

  const loadDailyHistory = useCallback(async (date: string) => {
    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const result = await HistoryService.getDailyHistory(date);
      setDailyHistory(result);
    } catch (error) {
      setDailyHistory(null);
      setHistoryError(
        error instanceof Error
          ? error.message
          : "Unable to load verification history.",
      );
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    void loadDailyHistory(selectedDate);
  }, [selectedDate, loadDailyHistory]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadSummary(), loadDailyHistory(selectedDate)]);
    setRefreshing(false);
  };

  const records = dailyHistory?.verifications ?? [];

  const todayCount = summary?.todayVerifications ?? 0;
  const delta = yesterdayCount === null ? null : todayCount - yesterdayCount;

  const openSearch = () =>
    router.push({
      pathname: "/history/search",
      params: { date: selectedDate },
    });

  const openTotal = () => router.push("/history/total");

  const pickDate = (date: string) => {
    if (date > today) return;
    setSelectedDate(date);
    setCalendarVisible(false);
  };

  const DeltaIcon =
    delta === null || delta === 0
      ? Minus
      : delta > 0
        ? TrendingUp
        : TrendingDown;

  const deltaText =
    delta === null
      ? null
      : delta === 0
        ? "Same as yesterday"
        : delta > 0
          ? `${delta} more than yesterday`
          : `${Math.abs(delta)} fewer than yesterday`;

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top"]}
      style={{ backgroundColor: colors.background }}
    >
      {/* Fixed header: title + search entry */}
      <View
        className="px-5 pb-3 pt-3"
        style={{
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <AppText variant="h1">History</AppText>
        {/* <AppText variant="caption" color="secondary" className="mt-1">
          Every student you've verified
        </AppText> */}

        <Pressable
          onPress={openSearch}
          className="mt-3 flex-row items-center rounded-xl px-3 py-3"
          style={{ backgroundColor: colors.surface }}
        >
          <Search size={18} color={colors.textMuted} />
          <AppText variant="body" color="secondary" className="ml-2 flex-1">
            Search student name or ID
          </AppText>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 120,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Today hero */}
        <Pressable
          onPress={() => setSelectedDate(today)}
          className="overflow-hidden rounded-3xl p-5"
          style={{ backgroundColor: colors.primary }}
        >
          <View className="flex-row items-center">
            <AppText variant="caption" color="inverse">
              Today · {formatDate(today).split(",")[1]?.trim() ?? ""}
            </AppText>
          </View>

          <View className="mt-4 flex-row items-end">
            <AppText
              variant="h1"
              color="inverse"
              style={{ fontSize: 64, lineHeight: 68, fontWeight: "700" }}
            >
              {summaryLoading && !summary ? "–" : todayCount}
            </AppText>
            <AppText
              variant="body"
              color="inverse"
              className="mb-2 ml-2"
              style={{ opacity: 0.85 }}
            >
              {todayCount === 1 ? "student verified" : "students verified"}
            </AppText>
          </View>

          {deltaText && (
            <View
              className="mt-4 flex-row items-center self-start rounded-full px-3 py-1.5"
              style={{ backgroundColor: WHITE_SOFT }}
            >
              <DeltaIcon size={14} color={isDark ? "black" : "white"} />
              <AppText variant="caption" color="inverse" className="ml-1.5">
                {deltaText}
              </AppText>
            </View>
          )}

          {summaryError && (
            <AppText variant="caption" color="inverse" className="mt-3">
              {summaryError}
            </AppText>
          )}
        </Pressable>

        {/* Total verifications → opens page */}
        <Pressable
          onPress={openTotal}
          className="mt-3 flex-row items-center rounded-2xl px-4 py-4"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View
            className="h-11 w-11 items-center justify-center rounded-xl"
            style={{ backgroundColor: colors.surfaceSecondary }}
          >
            <ChartNoAxesCombined size={21} color={colors.primary} />
          </View>

          <View className="ml-3 flex-1">
            <AppText variant="body" className="font-semibold">
              Total verifications
            </AppText>
            <AppText variant="caption" color="secondary" className="mt-0.5">
              {summaryLoading && !summary
                ? "Loading…"
                : `${summary?.totalVerifications ?? 0} all time · see trends`}
            </AppText>
          </View>

          <ChevronRight size={20} color={colors.textSecondary} />
        </Pressable>

        {/* Date browsing */}
        <View className="mt-8 flex-row items-center justify-between">
          <View>
            <AppText variant="body" className="font-semibold">
              Daily activity
            </AppText>
            <AppText variant="caption" color="secondary" className="mt-0.5">
              {formatDate(selectedDate)}
            </AppText>
          </View>

          <Pressable
            onPress={() => setCalendarVisible(true)}
            hitSlop={8}
            className="flex-row items-center rounded-full px-3 py-2"
            style={{ backgroundColor: colors.surfaceSecondary }}
          >
            <CalendarDays size={16} color={colors.primary} />
            <AppText variant="caption" className="ml-1.5 font-semibold">
              Calendar
            </AppText>
          </Pressable>
        </View>

        {/* Week strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4"
          contentContainerStyle={{ gap: 8 }}
        >
          {weekStrip.map((date) => {
            const selected = date === selectedDate;
            const d = parseLocalDate(date);

            return (
              <Pressable
                key={date}
                onPress={() => setSelectedDate(date)}
                className="items-center rounded-2xl px-3.5 py-3"
                style={{
                  minWidth: 56,
                  backgroundColor: selected
                    ? colors.primary
                    : colors.surfaceSecondary,
                }}
              >
                <AppText
                  variant="caption"
                  color={selected ? "inverse" : "secondary"}
                >
                  {d.toLocaleDateString("en-IN", { weekday: "short" })}
                </AppText>
                <AppText
                  variant="body"
                  color={selected ? "inverse" : "primary"}
                  className="mt-1 font-semibold"
                >
                  {d.getDate()}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Records */}
        <View className="mt-6">
          <View className="mb-3 flex-row items-end justify-between">
            <View>
              <AppText variant="caption" color="secondary">
                {formatDayLabel(selectedDate, today)}
              </AppText>
              <AppText variant="h2" className="mt-0.5 font-semibold">
                {historyLoading
                  ? "…"
                  : `${dailyHistory?.totalVerifications ?? 0} ${
                      (dailyHistory?.totalVerifications ?? 0) === 1
                        ? "verification"
                        : "verifications"
                    }`}
              </AppText>
            </View>
          </View>

          {historyLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator color={colors.primary} />
              <AppText variant="caption" color="secondary" className="mt-3">
                Loading records…
              </AppText>
            </View>
          ) : historyError ? (
            <AppCard padding={4} gap={3}>
              <AppText variant="body" color="danger">
                {historyError}
              </AppText>
              <Pressable onPress={() => void loadDailyHistory(selectedDate)}>
                <AppText variant="body" className="font-semibold">
                  Try again
                </AppText>
              </Pressable>
            </AppCard>
          ) : records.length === 0 ? (
            <AppCard padding={5} gap={2}>
              <View className="items-center">
                <CalendarDays size={30} color={colors.textMuted} />
                <AppText variant="body" className="mt-3 font-semibold">
                  Nothing verified this day
                </AppText>
                <AppText
                  variant="caption"
                  color="secondary"
                  className="mt-1 text-center"
                >
                  Pick another date from the strip or calendar.
                </AppText>
              </View>
            </AppCard>
          ) : (
            <VerificationRecordList records={records} />
          )}
        </View>
      </ScrollView>

      <DatePickerModal
        visible={calendarVisible}
        selectedDate={selectedDate}
        today={today}
        onSelect={pickDate}
        onClose={() => setCalendarVisible(false)}
      />
    </SafeAreaView>
  );
}
