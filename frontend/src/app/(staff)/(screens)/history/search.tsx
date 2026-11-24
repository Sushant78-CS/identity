import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Search, SearchX, X } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
import {
  VerificationRecordList,
  type VerificationRecord,
} from "@/features/staff/components/VerificationRecordList";
import {
  formatDayLabel,
  getLastDays,
  getLocalDateString,
} from "@/features/staff/services/date";
import { HistoryService } from "@/features/verification/services/history.service";
import { useAppTheme } from "@/theme/useAppTheme";

type Scope = "day" | "week";
type DayRecords = { date: string; records: VerificationRecord[] };

export default function HistorySearchScreen() {
  const { theme } = useAppTheme();
  const colors = theme.colors;
  const router = useRouter();

  const today = getLocalDateString();
  const params = useLocalSearchParams<{ date?: string }>();
  const focusDate = params.date ?? today;

  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>("week");
  const [data, setData] = useState<DayRecords[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // NOTE: this uses the existing getDailyHistory API. If you later add a
  // server-side search endpoint, replace this effect with that call.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const dates =
        scope === "day" ? [focusDate] : getLastDays(today, 7).reverse();

      try {
        const results = await Promise.all(
          dates.map(async (date) => {
            const res = await HistoryService.getDailyHistory(date);
            return { date, records: res.verifications ?? [] };
          }),
        );
        if (!cancelled) setData(results);
      } catch (e) {
        if (!cancelled) {
          setData([]);
          setError(e instanceof Error ? e.message : "Unable to load records.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [scope, focusDate, today]);

  const trimmed = query.trim().toLowerCase();

  const groups = useMemo(() => {
    if (!trimmed) return [];
    return data
      .map(({ date, records }) => ({
        date,
        records: records.filter(
          (r) =>
            r.studentName.toLowerCase().includes(trimmed) ||
            r.studentId.toLowerCase().includes(trimmed),
        ),
      }))
      .filter((g) => g.records.length > 0);
  }, [data, trimmed]);

  const totalMatches = groups.reduce((sum, g) => sum + g.records.length, 0);

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top"]}
      style={{ backgroundColor: colors.background }}
    >
      {/* Header with input */}
      <View
        className="px-5 pb-3 pt-3"
        style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
      >
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            className="h-11 w-11 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.surfaceSecondary }}
          >
            <ArrowLeft size={22} color={colors.textPrimary} />
          </Pressable>

          <View
            className="flex-1 flex-row items-center rounded-xl px-3"
            style={{ backgroundColor: colors.surface }}
          >
            <Search size={18} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search student name or ID"
              placeholderTextColor={colors.textMuted}
              className="ml-2 flex-1 py-3 text-sm"
              style={{ color: colors.textPrimary }}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              autoFocus
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")} hitSlop={8}>
                <X size={17} color={colors.textMuted} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Scope */}
        <View className="mt-3 flex-row gap-2">
          {(
            [
              { key: "week", label: "Last 7 days" },
              { key: "day", label: formatDayLabel(focusDate, today) },
            ] as const
          ).map((option) => {
            const active = scope === option.key;
            return (
              <Pressable
                key={option.key}
                onPress={() => setScope(option.key)}
                className="rounded-full px-4 py-2"
                style={{
                  backgroundColor: active
                    ? colors.primary
                    : colors.surfaceSecondary,
                }}
              >
                <AppText
                  variant="caption"
                  color={active ? "inverse" : "primary"}
                  className="font-semibold"
                >
                  {option.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 80,
        }}
      >
        {loading ? (
          <View className="items-center py-16">
            <ActivityIndicator color={colors.primary} />
            <AppText variant="caption" color="secondary" className="mt-3">
              Getting records…
            </AppText>
          </View>
        ) : error ? (
          <View className="items-center py-16">
            <AppText variant="body" color="danger" className="text-center">
              {error}
            </AppText>
          </View>
        ) : !trimmed ? (
          <View className="items-center py-16">
            <Search size={32} color={colors.textMuted} />
            <AppText variant="body" className="mt-3 font-semibold">
              Find a student
            </AppText>
            <AppText
              variant="caption"
              color="secondary"
              className="mt-1 text-center"
            >
              Type a name or student ID to see when they were verified.
            </AppText>
          </View>
        ) : totalMatches === 0 ? (
          <View className="items-center py-16">
            <SearchX size={32} color={colors.textMuted} />
            <AppText variant="body" className="mt-3 font-semibold">
              No matches for “{query.trim()}”
            </AppText>
            <AppText
              variant="caption"
              color="secondary"
              className="mt-1 text-center"
            >
              Check the spelling, or switch the range to another period.
            </AppText>
          </View>
        ) : (
          <>
            <AppText variant="caption" color="secondary">
              {totalMatches} {totalMatches === 1 ? "match" : "matches"}
            </AppText>

            {groups.map((group) => (
              <View key={group.date} className="mt-5">
                <AppText variant="body" className="mb-2 font-semibold">
                  {formatDayLabel(group.date, today)}
                </AppText>
                <VerificationRecordList records={group.records} />
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
