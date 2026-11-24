import { useRouter } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import { useMemo, useState } from "react";

import {
  ArrowLeft,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  GraduationCap,
  Megaphone,
  Search,
  X,
} from "lucide-react-native";

import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
import { useAppTheme } from "@/theme/useAppTheme";

type SearchCategory =
  | "announcements"
  | "events"
  | "academic"
  | "services"
  | "departments"
  | "notifications";

type Topic = {
  id: SearchCategory;
  title: string;
  icon: LucideIcon;
};

type SearchItem = {
  id: string;
  title: string;
  description: string;
  category: SearchCategory;
  keywords: string[];
};

const TOPICS: Topic[] = [
  {
    id: "announcements",
    title: "Announcements",
    icon: Megaphone,
  },
  {
    id: "events",
    title: "Events",
    icon: CalendarDays,
  },
  {
    id: "academic",
    title: "Academic resources",
    icon: BookOpen,
  },
  {
    id: "services",
    title: "Campus services",
    icon: Building2,
  },
  {
    id: "departments",
    title: "Departments",
    icon: GraduationCap,
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: Bell,
  },
];

// Sample data for UI testing.
// Replace this with backend search results later.
const SAMPLE_ITEMS: SearchItem[] = [
  {
    id: "announcement-1",
    title: "Semester 4 examination timetable",
    description:
      "Check the latest examination timetable for Semester 4 students.",
    category: "announcements",
    keywords: ["exam", "examination", "timetable", "semester", "schedule"],
  },
  {
    id: "announcement-2",
    title: "Library hours extended",
    description:
      "The college library will have extended hours during examinations.",
    category: "announcements",
    keywords: ["library", "timings", "hours", "exams"],
  },
  {
    id: "event-1",
    title: "Inter-college technical fest",
    description:
      "Explore technical competitions, workshops and campus activities.",
    category: "events",
    keywords: ["tech", "fest", "competition", "technical"],
  },
  {
    id: "event-2",
    title: "Web development workshop",
    description: "A practical workshop covering modern frontend development.",
    category: "events",
    keywords: ["web", "development", "workshop", "react"],
  },
  {
    id: "academic-1",
    title: "BSc Computer Science Semester 4 syllabus",
    description: "Browse the subjects and syllabus for the current semester.",
    category: "academic",
    keywords: ["bsc", "computer science", "syllabus", "semester", "subjects"],
  },
  {
    id: "academic-2",
    title: "Java programming notes",
    description: "Study material and learning resources for Java programming.",
    category: "academic",
    keywords: ["java", "programming", "notes", "study material"],
  },
  {
    id: "academic-3",
    title: "Operating Systems question papers",
    description: "Find previous examination papers for Operating Systems.",
    category: "academic",
    keywords: ["operating systems", "os", "question papers"],
  },
  {
    id: "service-1",
    title: "Central library",
    description: "Information about library facilities and student services.",
    category: "services",
    keywords: ["library", "books", "facilities"],
  },
  {
    id: "service-2",
    title: "Computer laboratories",
    description: "Find information about computer lab facilities on campus.",
    category: "services",
    keywords: ["computer", "lab", "laboratory"],
  },
  {
    id: "department-1",
    title: "Computer Science Department",
    description: "Explore information about the Computer Science department.",
    category: "departments",
    keywords: ["computer", "science", "department", "faculty"],
  },
  {
    id: "notification-1",
    title: "Campus updates",
    description: "Find important campus updates and student notifications.",
    category: "notifications",
    keywords: ["campus", "updates", "alerts", "notice"],
  },
];

export default function SearchScreen() {
  const router = useRouter();

  const { theme } = useAppTheme();
  const colors = theme.colors;

  const [query, setQuery] = useState("");

  const [selectedTopic, setSelectedTopic] = useState<SearchCategory | null>(
    null,
  );

  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const activeTopic = TOPICS.find((topic) => topic.id === selectedTopic);

  // Filter search results.
  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return SAMPLE_ITEMS.filter((item) => {
      const matchesTopic = !selectedTopic || item.category === selectedTopic;

      const searchableText = [item.title, item.description, ...item.keywords]
        .join(" ")
        .toLowerCase();

      const matchesQuery =
        !normalizedQuery || searchableText.includes(normalizedQuery);

      return matchesTopic && matchesQuery;
    });
  }, [query, selectedTopic]);

  // Save recent searches.
  const saveRecentSearch = (value: string) => {
    const cleaned = value.trim();

    if (!cleaned) return;

    setRecentSearches((previous) =>
      [
        cleaned,
        ...previous.filter(
          (item) => item.toLowerCase() !== cleaned.toLowerCase(),
        ),
      ].slice(0, 8),
    );
  };

  // Submit search.
  const submitSearch = (value: string) => {
    const cleaned = value.trim();

    if (!cleaned) return;

    setQuery(cleaned);
    setSelectedTopic(null);

    saveRecentSearch(cleaned);

    Keyboard.dismiss();
  };

  // Select a topic.
  const selectTopic = (topic: SearchCategory) => {
    setSelectedTopic(topic);
    setQuery("");

    Keyboard.dismiss();
  };

  // Clear search.
  const clearSearch = () => {
    setQuery("");
    setSelectedTopic(null);
  };

  // Get category name.
  const categoryLabel = (category: SearchCategory) =>
    TOPICS.find((topic) => topic.id === category)?.title ?? "Campus";

  // Screen states.
  const showTopics = !query.trim() && selectedTopic === null;

  const showRecentSearches = showTopics && recentSearches.length > 0;

  const showResults = query.trim().length > 0 || selectedTopic !== null;

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      className="flex-1"
      style={{
        backgroundColor: colors.background,
      }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* FIXED HEADER */}
        <View className="px-5 pb-1 pt-1">
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="h-10 w-10 items-center justify-center"
          >
            <ArrowLeft size={23} color={colors.textPrimary} />
          </Pressable>
        </View>

        {/* SCROLLABLE CONTENT */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 20,
          }}
        >
          {/* TOPICS */}
          {showTopics && (
            <View>
              <AppText
                className="mb-3 ml-2 text-[16px] font-semibold"
                style={{ color: colors.textPrimary }}
              >
                Topics
              </AppText>

              <View
                className="rounded-[22px] p-3"
                style={{
                  backgroundColor: colors.surface,
                }}
              >
                {[0, 1, 2].map((rowIndex) => (
                  <View
                    key={rowIndex}
                    className="flex-row gap-2"
                    style={{
                      marginBottom: rowIndex === 2 ? 0 : 5,
                    }}
                  >
                    {TOPICS.slice(rowIndex * 2, rowIndex * 2 + 2).map(
                      (topic) => {
                        const Icon = topic.icon;

                        return (
                          <Pressable
                            key={topic.id}
                            onPress={() => selectTopic(topic.id)}
                            accessibilityRole="button"
                            accessibilityLabel={topic.title}
                            className="min-h-[60px] flex-1 flex-row items-center rounded-xl px-2 active:opacity-60"
                          >
                            <Icon size={19} color={colors.textPrimary} />

                            <AppText
                              className="ml-2 flex-1 text-[11px] font-medium"
                              style={{
                                color: colors.textPrimary,
                              }}
                            >
                              {topic.title}
                            </AppText>
                          </Pressable>
                        );
                      },
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* RECENT SEARCHES */}
          {showRecentSearches && (
            <View
              className="mt-4 rounded-[22px] p-4"
              style={{
                backgroundColor: colors.surface,
              }}
            >
              <View className="mb-3 flex-row items-center justify-between">
                <AppText
                  className="text-[12px] font-medium"
                  style={{ color: colors.textSecondary }}
                >
                  Recent searches
                </AppText>

                <Pressable
                  onPress={() => setRecentSearches([])}
                  accessibilityRole="button"
                  accessibilityLabel="Clear all recent searches"
                >
                  <AppText
                    className="text-[11px] font-semibold"
                    style={{ color: colors.primary }}
                  >
                    Clear all
                  </AppText>
                </Pressable>
              </View>

              <View className="flex-row flex-wrap gap-2">
                {recentSearches.map((item) => (
                  <View
                    key={item}
                    className="flex-row items-center rounded-full px-3 py-2"
                    style={{
                      backgroundColor: colors.surfaceSecondary,
                    }}
                  >
                    <Pressable onPress={() => submitSearch(item)}>
                      <AppText
                        className="text-[11px]"
                        style={{ color: colors.textPrimary }}
                      >
                        {item}
                      </AppText>
                    </Pressable>

                    <Pressable
                      onPress={() =>
                        setRecentSearches((previous) =>
                          previous.filter((search) => search !== item),
                        )
                      }
                      hitSlop={8}
                      className="ml-2"
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${item}`}
                    >
                      <X size={13} color={colors.textSecondary} />
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* SEARCH RESULTS */}
          {showResults && (
            <View>
              <View className="mb-3 flex-row items-center justify-between">
                <View>
                  <AppText
                    className="text-[17px] font-semibold"
                    style={{ color: colors.textPrimary }}
                  >
                    {activeTopic?.title ?? "Search results"}
                  </AppText>

                  <AppText
                    className="mt-1 text-[10px]"
                    style={{ color: colors.textSecondary }}
                  >
                    {searchResults.length} results found
                  </AppText>
                </View>

                {selectedTopic && (
                  <Pressable onPress={() => setSelectedTopic(null)}>
                    <AppText
                      className="text-[11px] font-semibold"
                      style={{ color: colors.primary }}
                    >
                      All topics
                    </AppText>
                  </Pressable>
                )}
              </View>

              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <Pressable
                    key={item.id}
                    className="mb-2 rounded-xl p-3"
                    style={{
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                    accessibilityRole="button"
                  >
                    <AppText
                      className="mb-1 text-[9px] font-bold tracking-wider"
                      style={{ color: colors.primary }}
                    >
                      {categoryLabel(item.category).toUpperCase()}
                    </AppText>

                    <AppText
                      className="text-[13px] font-semibold"
                      style={{ color: colors.textPrimary }}
                    >
                      {item.title}
                    </AppText>

                    <AppText
                      className="mt-1 text-[11px] leading-[17px]"
                      style={{ color: colors.textSecondary }}
                    >
                      {item.description}
                    </AppText>
                  </Pressable>
                ))
              ) : (
                <View
                  className="items-center rounded-2xl px-5 py-8"
                  style={{
                    backgroundColor: colors.surface,
                  }}
                >
                  <Search size={27} color={colors.textMuted} />

                  <AppText
                    className="mt-3 text-[13px] font-semibold"
                    style={{ color: colors.textPrimary }}
                  >
                    No results found
                  </AppText>

                  <AppText
                    className="mt-1 text-center text-[11px]"
                    style={{ color: colors.textSecondary }}
                  >
                    Try another keyword or explore a different topic.
                  </AppText>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* FIXED BOTTOM SEARCH BAR */}
        <View
          className="px-5 pb-2 pt-2"
          style={{
            backgroundColor: colors.background,
          }}
        >
          <View
            className="h-[54px] flex-row items-center rounded-full px-4"
            style={{
              backgroundColor: colors.surfaceSecondary,
            }}
          >
            <TextInput
              autoFocus
              value={query}
              onChangeText={(value) => {
                setQuery(value);
                setSelectedTopic(null);
              }}
              onSubmitEditing={() => submitSearch(query)}
              placeholder="Search"
              placeholderTextColor={colors.textMuted}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
              accessibilityLabel="Search campus information"
              selectionColor={colors.primary}
              style={{
                flex: 1,
                fontSize: 14,
                fontWeight: "600",
                color: colors.textPrimary,
                paddingVertical: 0,
              }}
            />

            {query.length > 0 && (
              <Pressable
                onPress={clearSearch}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <X size={18} color={colors.textSecondary} />
              </Pressable>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
