import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCheck,
  Megaphone,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
import { useAppTheme } from "@/theme/useAppTheme";

type NotificationType = "announcement" | "event" | "academic" | "service";

type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  group: "Today" | "Yesterday";
  unread: boolean;
};

// Sample notification data.
// Replace this with backend data when the API is ready.
const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    type: "announcement",
    title: "Campus Notice",
    message:
      "The library will remain open until 8 PM during the examination period.",
    time: "10 min ago",
    group: "Today",
    unread: true,
  },
  {
    id: "2",
    type: "event",
    title: "Upcoming Campus Event",
    message: "Registration for the inter-college technical fest is now open.",
    time: "2 hours ago",
    group: "Today",
    unread: true,
  },
  {
    id: "3",
    type: "academic",
    title: "Academic Update",
    message: "The Semester 4 examination timetable has been published.",
    time: "5 hours ago",
    group: "Today",
    unread: true,
  },
  {
    id: "4",
    type: "service",
    title: "Campus Services",
    message: "The updated canteen menu is now available for students.",
    time: "Yesterday",
    group: "Yesterday",
    unread: false,
  },
  {
    id: "5",
    type: "announcement",
    title: "Student Announcement",
    message:
      "Remember to check the notice board for the latest campus updates.",
    time: "Yesterday",
    group: "Yesterday",
    unread: false,
  },
];

type FilterType = "all" | "unread";

function NotificationIcon({
  type,
  color,
}: {
  type: NotificationType;
  color: string;
}) {
  const iconSize = 20;

  switch (type) {
    case "announcement":
      return <Megaphone size={iconSize} color={color} />;

    case "event":
      return <CalendarDays size={iconSize} color={color} />;

    case "academic":
      return <BookOpen size={iconSize} color={color} />;

    case "service":
      return <Building2 size={iconSize} color={color} />;

    default:
      return <Bell size={iconSize} color={color} />;
  }
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const colors = theme.colors;

  const [notifications, setNotifications] =
    useState<NotificationItem[]>(SAMPLE_NOTIFICATIONS);

  const [filter, setFilter] = useState<FilterType>("all");

  const unreadCount = notifications.filter((item) => item.unread).length;

  const filteredNotifications = notifications.filter((item) =>
    filter === "unread" ? item.unread : true,
  );

  const sections = [
    {
      title: "TODAY",
      items: filteredNotifications.filter((item) => item.group === "Today"),
    },
    {
      title: "YESTERDAY",
      items: filteredNotifications.filter((item) => item.group === "Yesterday"),
    },
  ].filter((section) => section.items.length > 0);

  const markAsRead = (id: string) => {
    setNotifications((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, unread: false } : item,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((item) => ({
        ...item,
        unread: false,
      })),
    );
  };

  const renderNotification = (item: NotificationItem) => (
    <Pressable
      key={item.id}
      onPress={() => markAsRead(item.id)}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}. ${item.message}. ${item.unread ? "Unread" : "Read"}`}
      className="mb-3 flex-row items-start rounded-2xl p-4"
      style={{
        backgroundColor: colors.surface,
        borderWidth: item.unread ? 1 : 0,
        borderColor: colors.primary,
      }}
    >
      {/* Icon */}
      <View
        className="mr-3 h-11 w-11 items-center justify-center rounded-full"
        style={{
          backgroundColor: colors.primaryLight,
        }}
      >
        <NotificationIcon type={item.type} color={colors.primary} />
      </View>

      {/* Content */}
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <AppText
            className="flex-1 pr-2 text-[14px] font-semibold"
            style={{ color: colors.textPrimary }}
          >
            {item.title}
          </AppText>

          {item.unread && (
            <View
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: colors.primary }}
            />
          )}
        </View>

        <AppText
          className="mt-1 text-[12px] leading-[19px]"
          style={{ color: colors.textSecondary }}
        >
          {item.message}
        </AppText>

        <AppText
          className="mt-2 text-[10px] font-medium"
          style={{ color: colors.textMuted }}
        >
          {item.time}
        </AppText>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView
      edges={["top"]}
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      <View className="px-5 pb-5 pt-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              className="mr-3 h-10 w-10 items-center justify-center rounded-full"
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={22} color={colors.textPrimary} />
            </Pressable>

            <View>
              <AppText
                className="text-[24px] font-bold"
                style={{ color: colors.textPrimary }}
              >
                Notifications
              </AppText>

              <AppText
                className="mt-0.5 text-[11px]"
                style={{ color: colors.textSecondary }}
              >
                Stay updated with your campus
              </AppText>
            </View>
          </View>

          {unreadCount > 0 && (
            <Pressable
              onPress={markAllAsRead}
              hitSlop={8}
              className="flex-row items-center"
              accessibilityRole="button"
              accessibilityLabel="Mark all as read"
            >
              <CheckCheck size={17} color={colors.primary} />
              <AppText
                className="ml-1 text-[11px] font-semibold"
                style={{ color: colors.primary }}
              >
                Mark all read
              </AppText>
            </Pressable>
          )}
        </View>
      </View>

      {/* Filters */}
      <View className="mb-5 flex-row gap-2 px-5">
        {(["all", "unread"] as const).map((item) => {
          const selected = filter === item;

          return (
            <Pressable
              key={item}
              onPress={() => setFilter(item)}
              className="rounded-full px-5 py-2.5"
              style={{
                backgroundColor: selected ? colors.primary : colors.surface,
              }}
            >
              <AppText
                className="text-[12px] font-semibold capitalize"
                style={{
                  color: selected ? colors.background : colors.textPrimary,
                }}
              >
                {item === "all"
                  ? `All (${notifications.length})`
                  : `Unread (${unreadCount})`}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Notification groups */}
        {sections.length > 0 ? (
          sections.map((section) => (
            <View key={section.title} className="mb-4 px-5">
              <AppText
                className="mb-3 text-[11px] font-bold tracking-wider"
                style={{ color: colors.textSecondary }}
              >
                {section.title}
              </AppText>

              {section.items.map(renderNotification)}
            </View>
          ))
        ) : (
          <View
            className="mx-5 items-center rounded-2xl px-6 py-12"
            style={{ backgroundColor: colors.surface }}
          >
            <View
              className="mb-4 h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.surfaceSecondary }}
            >
              <Bell size={27} color={colors.textSecondary} />
            </View>

            <AppText
              className="text-[15px] font-semibold"
              style={{ color: colors.textPrimary }}
            >
              {filter === "unread"
                ? "You're all caught up"
                : "No notifications yet"}
            </AppText>

            <AppText
              className="mt-2 text-center text-[12px] leading-5"
              style={{ color: colors.textSecondary }}
            >
              {filter === "unread"
                ? "You don't have any unread notifications."
                : "Campus updates and announcements will appear here."}
            </AppText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
