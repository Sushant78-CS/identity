import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Share } from "react-native";

import {
  ArrowLeft,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCheck,
  ChevronRight,
  Pin,
  Search,
  Share2,
  X,
} from "lucide-react-native";

import { Pressable, ScrollView, TextInput, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { AppBottomSheet } from "@/components/shared/AppBottomSheet";
import { AppText } from "@/components/ui/AppText";
import { useAppTheme } from "@/theme/useAppTheme";

type AnnouncementCategory = "Academic" | "Examination" | "General" | "Urgent";

type Announcement = {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: AnnouncementCategory;
  publisher: string;
  publishedAt: string;
  pinned: boolean;
  unread: boolean;
};

// Sample announcement data.
// Replace with Spring Boot API data later.
const SAMPLE_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "announcement-1",
    title: "Semester 4 examination timetable released",
    summary: "Students can now check the examination schedule for Semester 4.",
    content:
      "The examination timetable for Semester 4 has been prepared. Students are requested to review the examination schedule and check their respective subject dates and timings. Please contact your department for any timetable-related queries.",
    category: "Examination",
    publisher: "Examination Department",
    publishedAt: "Today · 9:30 AM",
    pinned: true,
    unread: true,
  },
  {
    id: "announcement-2",
    title: "Important academic update",
    summary: "Important information regarding the current academic semester.",
    content:
      "Students are advised to regularly check academic updates published by their respective departments. Further information regarding academic activities will be communicated through the college platform.",
    category: "Academic",
    publisher: "Academic Administration",
    publishedAt: "Today · 8:15 AM",
    pinned: false,
    unread: true,
  },
  {
    id: "announcement-3",
    title: "College holiday announcement",
    summary: "Please check the updated college holiday schedule.",
    content:
      "Students are informed that the college holiday schedule has been updated. Please refer to the official academic calendar for the relevant dates.",
    category: "Urgent",
    publisher: "College Administration",
    publishedAt: "Yesterday · 4:30 PM",
    pinned: false,
    unread: true,
  },
  {
    id: "announcement-4",
    title: "Library operating hours",
    summary:
      "The library will have extended hours during the examination period.",
    content:
      "To support students during the examination period, the college library will operate with extended hours. Students should follow the library rules and carry their valid college identity cards.",
    category: "General",
    publisher: "Library Department",
    publishedAt: "Yesterday · 11:00 AM",
    pinned: false,
    unread: false,
  },
  {
    id: "announcement-5",
    title: "Internal assessment submission",
    summary:
      "Students should coordinate with their respective subject faculty.",
    content:
      "Students are requested to complete their internal assessment submissions within the deadlines communicated by their respective departments. Late submissions will be handled according to college guidelines.",
    category: "Academic",
    publisher: "Academic Department",
    publishedAt: "17 November · 10:00 AM",
    pinned: false,
    unread: false,
  },
  {
    id: "announcement-6",
    title: "Student document verification",
    summary: "Students may be required to verify their academic records.",
    content:
      "The college may conduct student document verification as part of its administrative processes. Keep your required academic documents available and follow instructions from the college administration.",
    category: "General",
    publisher: "College Administration",
    publishedAt: "16 November · 2:00 PM",
    pinned: false,
    unread: false,
  },
];

type Filter = "All" | AnnouncementCategory;

const FILTERS: Filter[] = [
  "All",
  "Academic",
  "Examination",
  "General",
  "Urgent",
];

function getCategoryColor(
  category: AnnouncementCategory,
  colors: ReturnType<typeof useAppTheme>["theme"]["colors"],
) {
  switch (category) {
    case "Urgent":
      return colors.danger;

    case "Academic":
      return colors.success;

    case "Examination":
      return "#D99A2B";

    default:
      return colors.primary;
  }
}

function AnnouncementCard({
  item,
  onPress,
  colors,
}: {
  item: Announcement;
  onPress: () => void;
  colors: ReturnType<typeof useAppTheme>["theme"]["colors"];
}) {
  const categoryColor = getCategoryColor(item.category, colors);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.title}`}
      className="mb-3 rounded-[20px] border p-4 active:opacity-80"
      style={{
        backgroundColor: colors.surface,
        borderColor: item.unread ? colors.primary : colors.border,
      }}
    >
      {/* Category and unread status */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View
            className="rounded-full px-2.5 py-1"
            style={{
              backgroundColor: colors.surfaceSecondary,
            }}
          >
            <AppText
              className="text-[9px] font-bold tracking-wider"
              style={{ color: categoryColor }}
            >
              {item.category.toUpperCase()}
            </AppText>
          </View>

          {item.pinned && (
            <View className="flex-row items-center gap-1">
              <Pin size={12} color={colors.textSecondary} />
              <AppText
                className="text-[9px] font-medium"
                style={{ color: colors.textSecondary }}
              >
                Pinned
              </AppText>
            </View>
          )}
        </View>

        {item.unread && (
          <View
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: colors.primary }}
          />
        )}
      </View>

      {/* Announcement title */}
      <AppText
        className="text-[14px] font-bold leading-5"
        style={{ color: colors.textPrimary }}
      >
        {item.title}
      </AppText>

      {/* Summary */}
      <AppText
        className="mt-1.5 text-[11px] leading-[18px]"
        style={{ color: colors.textSecondary }}
      >
        {item.summary}
      </AppText>

      {/* Footer */}
      <View className="mt-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <CalendarDays size={13} color={colors.textMuted} />

          <AppText className="text-[10px]" style={{ color: colors.textMuted }}>
            {item.publishedAt}
          </AppText>
        </View>

        <View className="flex-row items-center gap-1">
          <AppText
            className="text-[10px] font-semibold"
            style={{ color: colors.primary }}
          >
            Read more
          </AppText>

          <ChevronRight size={14} color={colors.primary} />
        </View>
      </View>
    </Pressable>
  );
}

export default function AnnouncementsScreen() {
  const router = useRouter();

  const { theme } = useAppTheme();
  const colors = theme.colors;

  const [announcements, setAnnouncements] =
    useState<Announcement[]>(SAMPLE_ANNOUNCEMENTS);

  const [selectedFilter, setSelectedFilter] = useState<Filter>("All");

  const [query, setQuery] = useState("");

  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);

  const unreadCount = announcements.filter((item) => item.unread).length;

  // Search and category filtering.
  const filteredAnnouncements = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return announcements.filter((item) => {
      const matchesCategory =
        selectedFilter === "All" || item.category === selectedFilter;

      const searchableText = [
        item.title,
        item.summary,
        item.content,
        item.publisher,
        item.category,
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery =
        !normalizedQuery || searchableText.includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [announcements, selectedFilter, query]);

  const pinnedAnnouncements = filteredAnnouncements.filter(
    (item) => item.pinned,
  );

  const regularAnnouncements = filteredAnnouncements.filter(
    (item) => !item.pinned,
  );

  // Open announcement and mark it as read.
  const openAnnouncement = (item: Announcement) => {
    setAnnouncements((previous) =>
      previous.map((announcement) =>
        announcement.id === item.id
          ? { ...announcement, unread: false }
          : announcement,
      ),
    );

    setSelectedAnnouncement({
      ...item,
      unread: false,
    });
  };

  // Mark all announcements as read.
  const markAllAsRead = () => {
    setAnnouncements((previous) =>
      previous.map((item) => ({
        ...item,
        unread: false,
      })),
    );
  };

  // Share an announcement.
  const shareAnnouncement = async () => {
    if (!selectedAnnouncement) return;

    try {
      await Share.share(
        {
          title: selectedAnnouncement.title,
          message: [
            selectedAnnouncement.title,
            "",
            selectedAnnouncement.content,
            "",
            `Published by: ${selectedAnnouncement.publisher}`,
          ].join("\n"),
        },
        {
          dialogTitle: "Share announcement",
          subject: selectedAnnouncement.title,
        },
      );
    } catch {
      // The screen remains open if sharing fails.
    }
  };

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1"
      style={{
        backgroundColor: colors.background,
      }}
    >
      {/* Fixed header */}
      <View className="px-5 pb-3 pt-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row flex-1 items-center">
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              className="mr-3 h-10 w-10 items-center justify-center"
            >
              <ArrowLeft size={23} color={colors.textPrimary} />
            </Pressable>

            <View className="flex-1">
              <AppText
                className="text-[22px] font-bold"
                style={{ color: colors.textPrimary }}
              >
                Announcements
              </AppText>

              <AppText
                className="mt-0.5 text-[10px]"
                style={{ color: colors.textSecondary }}
              >
                Official campus updates
              </AppText>
            </View>
          </View>

          {unreadCount > 0 && (
            <Pressable
              onPress={markAllAsRead}
              accessibilityRole="button"
              accessibilityLabel="Mark all as read"
              className="flex-row items-center gap-1"
            >
              <CheckCheck size={16} color={colors.primary} />

              <AppText
                className="text-[10px] font-semibold"
                style={{ color: colors.primary }}
              >
                Mark all read
              </AppText>
            </Pressable>
          )}
        </View>
      </View>

      <View
        className="mx-5 mb-4 h-[48px] flex-row items-center rounded-xl px-3"
        style={{ backgroundColor: colors.surfaceSecondary }}
      >
        <Search size={18} color={colors.textSecondary} />

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search announcements"
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          autoCorrect={false}
          style={{
            flex: 1,
            marginLeft: 10,
            fontSize: 12,
            color: colors.textPrimary,
            paddingVertical: 0,
          }}
          accessibilityLabel="Search announcements"
        />

        {query.length > 0 && (
          <Pressable
            onPress={() => setQuery("")}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <X size={17} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* Fixed horizontal category filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-5 flex-grow-0"
        contentContainerStyle={{
          paddingHorizontal: 20,
          gap: 8,
        }}
      >
        {FILTERS.map((filter) => {
          const active = selectedFilter === filter;

          return (
            <Pressable
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              className="rounded-full px-4 py-2.5"
              style={{
                backgroundColor: active
                  ? colors.primary
                  : colors.surfaceSecondary,
              }}
            >
              <AppText
                className="text-[11px] font-semibold"
                style={{
                  color: active ? colors.inverse : colors.textSecondary,
                }}
              >
                {filter}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Scrollable content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 35,
        }}
      >
        {/* Search */}
        {/* <View
          className="mx-5 mb-4 h-[48px] flex-row items-center rounded-xl px-3"
          style={{
            backgroundColor: colors.surfaceSecondary,
          }}
        >
          <Search size={18} color={colors.textSecondary} />

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search announcements"
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
            autoCorrect={false}
            style={{
              flex: 1,
              marginLeft: 10,
              fontSize: 12,
              color: colors.textPrimary,
              paddingVertical: 0,
            }}
            accessibilityLabel="Search announcements"
          />

          {query.length > 0 && (
            <Pressable
              onPress={() => setQuery("")}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <X size={17} color={colors.textSecondary} />
            </Pressable>
          )}
        </View> */}

        {/* Category filters */}
        {/* <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-5"
          contentContainerStyle={{
            paddingHorizontal: 20,
            gap: 8,
          }}
        >
          {FILTERS.map((filter) => {
            const active = selectedFilter === filter;

            return (
              <Pressable
                key={filter}
                onPress={() => setSelectedFilter(filter)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                className="rounded-full px-4 py-2.5"
                style={{
                  backgroundColor: active
                    ? colors.primary
                    : colors.surfaceSecondary,
                }}
              >
                <AppText
                  className="text-[11px] font-semibold"
                  style={{
                    color: active ? "#FFFFFF" : colors.textSecondary,
                  }}
                >
                  {filter}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView> */}

        {/* Pinned announcements */}
        {pinnedAnnouncements.length > 0 && (
          <View className="mb-5 px-5">
            <View className="mb-3 flex-row items-center gap-2">
              <Pin size={15} color={colors.primary} />

              <AppText
                className="text-[13px] font-bold"
                style={{ color: colors.textPrimary }}
              >
                Pinned announcements
              </AppText>
            </View>

            {pinnedAnnouncements.map((item) => (
              <AnnouncementCard
                key={item.id}
                item={item}
                colors={colors}
                onPress={() => openAnnouncement(item)}
              />
            ))}
          </View>
        )}

        {/* All announcements */}
        {regularAnnouncements.length > 0 && (
          <View className="px-5">
            <AppText
              className="mb-3 text-[13px] font-bold"
              style={{ color: colors.textPrimary }}
            >
              Latest announcements
            </AppText>

            {regularAnnouncements.map((item) => (
              <AnnouncementCard
                key={item.id}
                item={item}
                colors={colors}
                onPress={() => openAnnouncement(item)}
              />
            ))}
          </View>
        )}

        {/* Empty state */}
        {filteredAnnouncements.length === 0 && (
          <View
            className="mx-5 items-center rounded-2xl px-6 py-12"
            style={{
              backgroundColor: colors.surface,
            }}
          >
            <Bell size={30} color={colors.textMuted} />

            <AppText
              className="mt-3 text-[14px] font-semibold"
              style={{ color: colors.textPrimary }}
            >
              No announcements found
            </AppText>

            <AppText
              className="mt-1 text-center text-[11px] leading-5"
              style={{ color: colors.textSecondary }}
            >
              Try another search or choose a different category.
            </AppText>
          </View>
        )}
      </ScrollView>

      {/* Announcement details */}
      <AppBottomSheet
        visible={selectedAnnouncement !== null}
        onClose={() => setSelectedAnnouncement(null)}
        title="Announcement details"
        description={
          selectedAnnouncement
            ? `${selectedAnnouncement.category} · ${selectedAnnouncement.publishedAt}`
            : undefined
        }
      >
        {selectedAnnouncement && (
          <View className="gap-4 pb-2">
            <View
              className="self-start rounded-full px-3 py-1.5"
              style={{
                backgroundColor: colors.surfaceSecondary,
              }}
            >
              <AppText
                className="text-[10px] font-bold"
                style={{
                  color: getCategoryColor(
                    selectedAnnouncement.category,
                    colors,
                  ),
                }}
              >
                {selectedAnnouncement.category.toUpperCase()}
              </AppText>
            </View>

            <AppText
              className="text-[18px] font-bold leading-6"
              style={{ color: colors.textPrimary }}
            >
              {selectedAnnouncement.title}
            </AppText>

            <View className="flex-row items-center gap-2">
              <View
                className="h-9 w-9 items-center justify-center rounded-full"
                style={{
                  backgroundColor: colors.primaryLight,
                }}
              >
                <BookOpen size={17} color={colors.primary} />
              </View>

              <View className="flex-1">
                <AppText
                  className="text-[11px] font-semibold"
                  style={{ color: colors.textPrimary }}
                >
                  {selectedAnnouncement.publisher}
                </AppText>

                <AppText
                  className="mt-0.5 text-[10px]"
                  style={{ color: colors.textMuted }}
                >
                  {selectedAnnouncement.publishedAt}
                </AppText>
              </View>
            </View>

            <View className="h-px" style={{ backgroundColor: colors.border }} />

            <AppText
              className="text-[13px] leading-[23px]"
              style={{ color: colors.textSecondary }}
            >
              {selectedAnnouncement.content}
            </AppText>

            {/* <Pressable
              onPress={() => void shareAnnouncement()}
              className="h-[50px] flex-row items-center justify-center rounded-xl"
              style={{
                backgroundColor: colors.primary,
              }}
            >
              <Share2 size={18} color="#000" />

              <AppText
                className="ml-2 text-[13px] font-semibold"
                style={{ color: "000" }}
              >
                Share announcement
              </AppText>
            </Pressable> */}

            <Pressable
              onPress={() => void shareAnnouncement()}
              className="h-[50px] flex-row items-center justify-center rounded-xl"
              style={{
                backgroundColor: colors.primary,
              }}
            >
              <Share2 size={18} color={colors.inverse} />

              <AppText
                className="ml-2 text-[13px] font-semibold"
                style={{
                  color: colors.inverse,
                }}
              >
                Share announcement
              </AppText>
            </Pressable>
          </View>
        )}
      </AppBottomSheet>
    </SafeAreaView>
  );
}
