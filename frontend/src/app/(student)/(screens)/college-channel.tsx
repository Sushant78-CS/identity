import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Download,
  FileText,
  Image as ImageIcon,
  LockKeyhole,
  MoreVertical,
  Pin,
  Search,
  Share2,
  Users,
  X,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Share,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
import { useAppTheme } from "@/theme/useAppTheme";

type Attachment = {
  id: string;
  name: string;
  detail: string;
  type: "pdf" | "image" | "link";
};

type ChannelPost = {
  id: string;
  sender: string;
  initials: string;
  senderColor: string;
  message: string;
  time: string;
  day: string;
  pinned?: boolean;
  forwardedFrom?: string;
  attachments?: Attachment[];
  reactions?: number;
  views?: string;
};

// Demo posts. Replace these with the channel API response later.
const POSTS: ChannelPost[] = [
  {
    id: "post-1",
    sender: "Examination Department",
    initials: "ED",
    senderColor: "#9C83D8",
    message:
      "Students are requested to refer to the attached examination document and contact their respective department for any queries.",
    time: "7:45 PM",
    day: "Yesterday",
    attachments: [
      {
        id: "exam",
        name: "Examination Schedule.pdf",
        detail: "6.8 MB · PDF",
        type: "pdf",
      },
    ],
    views: "1.1K views",
  },
  {
    id: "post-2",
    sender: "College Administration",
    initials: "CA",
    senderColor: "#53A6E8",
    message:
      "Welcome to the official college channel. Important college-wide updates, academic notices, event information and documents will be shared here. Only authorized administrators can send messages.",
    time: "9:16 AM",
    day: "Today",
    pinned: true,
    reactions: 12,
    views: "1.2K views",
  },
  {
    id: "post-3",
    sender: "Academic Office",
    initials: "AO",
    senderColor: "#D58B61",
    message:
      "The updated academic calendar for the current academic year is available. Students are requested to check the important dates and share the information with their classmates.",
    time: "10:04 AM",
    day: "Today",
    attachments: [
      {
        id: "calendar",
        name: "Academic Calendar 2026-27.pdf",
        detail: "1.9 MB · PDF",
        type: "pdf",
      },
    ],
    reactions: 8,
    views: "986 views",
  },
  {
    id: "post-4",
    sender: "Science Department",
    initials: "SD",
    senderColor: "#4DAF83",
    forwardedFrom: "Aavishkar Research Cell",
    message:
      "Interested students can register for the university-level project competition using the form below. More than one student can participate in a group, with a maximum of five members. All group members must enter the same project title.",
    time: "2:05 PM",
    day: "Today",
    attachments: [
      {
        id: "form",
        name: "AAVISHKAR CONVENTION 2026-27",
        detail: "Research project registration · forms.gle",
        type: "link",
      },
    ],
    reactions: 5,
    views: "742 views",
  },
];

type Colors = ReturnType<typeof useAppTheme>["theme"]["colors"];

function AttachmentPreview({
  item,
  colors,
  isDark,
}: {
  item: Attachment;
  colors: Colors;
  isDark: boolean;
}) {
  const Icon = item.type === "image" ? ImageIcon : FileText;

  return (
    <View
      className="mt-2 flex-row items-center rounded-xl p-2.5"
      style={{ backgroundColor: isDark ? "#172229" : colors.surfaceSecondary }}
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-lg"
        style={{ backgroundColor: isDark ? "#34434D" : "#FFFFFF" }}
      >
        {item.type === "link" ? (
          <AppText
            className="text-base font-bold"
            style={{ color: colors.primary }}
          >
            ↗
          </AppText>
        ) : (
          <Icon
            size={19}
            color={item.type === "pdf" ? "#E66B68" : colors.primary}
          />
        )}
      </View>
      <View className="ml-3 flex-1">
        <AppText
          className="text-[11px] font-semibold"
          style={{ color: colors.textPrimary }}
          numberOfLines={2}
        >
          {item.name}
        </AppText>
        <AppText
          className="mt-1 text-[9px]"
          style={{ color: colors.textSecondary }}
        >
          {item.detail}
        </AppText>
      </View>
      {item.type === "pdf" ? (
        <Download size={17} color={colors.textSecondary} />
      ) : null}
    </View>
  );
}

function MessageBubble({
  post,
  colors,
  isDark,
}: {
  post: ChannelPost;
  colors: Colors;
  isDark: boolean;
}) {
  const muted = isDark ? "#AEBAC1" : colors.textSecondary;

  const sharePost = async () => {
    try {
      await Share.share({
        title: post.sender,
        message: `${post.sender}\n\n${post.message}`,
      });
    } catch {
      // Keep the channel screen open if sharing is cancelled or unavailable.
    }
  };

  return (
    <View className="mb-3 flex-row items-end">
      <View
        className="mr-2 h-8 w-8 items-center justify-center rounded-full"
        style={{ backgroundColor: post.senderColor }}
      >
        <AppText className="text-[10px] font-bold" style={{ color: "#FFFFFF" }}>
          {post.initials}
        </AppText>
      </View>

      <View
        className="max-w-[90%] rounded-[18px] rounded-bl-[5px] px-3 py-3"
        style={{ backgroundColor: isDark ? "#202C33" : colors.surface }}
      >
        <AppText
          className="mb-1 text-[12px] font-bold"
          style={{ color: post.senderColor }}
        >
          {post.sender}
        </AppText>

        {post.forwardedFrom ? (
          <AppText className="mb-2 text-[10px] italic" style={{ color: muted }}>
            ↪ Forwarded from {post.forwardedFrom}
          </AppText>
        ) : null}

        <AppText
          className="text-[13px] leading-[20px]"
          style={{ color: colors.textPrimary }}
        >
          {post.message}
        </AppText>

        {post.attachments?.map((item) => (
          <AttachmentPreview
            key={item.id}
            item={item}
            colors={colors}
            isDark={isDark}
          />
        ))}

        <View className="mt-2 flex-row items-center justify-end">
          <AppText className="text-[9px]" style={{ color: muted }}>
            {post.time}
          </AppText>
        </View>

        {post.reactions || post.views ? (
          <View
            className="mt-2 flex-row items-center justify-between border-t pt-2"
            style={{ borderTopColor: isDark ? "#34434D" : colors.border }}
          >
            <View className="flex-row items-center gap-2">
              {post.reactions ? (
                <View
                  className="flex-row items-center rounded-full px-2 py-1"
                  style={{ backgroundColor: isDark ? "#303A52" : "#EEF1FA" }}
                >
                  <AppText className="text-[12px]">❤️</AppText>
                  <AppText
                    className="ml-1 text-[10px]"
                    style={{ color: muted }}
                  >
                    {post.reactions}
                  </AppText>
                </View>
              ) : null}
              {post.views ? (
                <AppText className="text-[9px]" style={{ color: muted }}>
                  ◉ {post.views}
                </AppText>
              ) : null}
            </View>
            <Pressable
              onPress={() => void sharePost()}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Share message from ${post.sender}`}
            >
              <Share2 size={16} color={muted} />
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default function CollegeChannelScreen() {
  const router = useRouter();
  const { theme, isDark } = useAppTheme();
  const colors = theme.colors;
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const background = isDark ? "#0B141A" : colors.background;
  const headerBackground = isDark ? "#111B21" : colors.surface;
  const muted = isDark ? "#AEBAC1" : colors.textSecondary;
  const pinned = POSTS.find((post) => post.pinned);

  const filteredPosts = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return POSTS;
    return POSTS.filter((post) =>
      [
        post.sender,
        post.message,
        post.forwardedFrom ?? "",
        ...(post.attachments ?? []).map((item) => item.name),
      ]
        .join(" ")
        .toLowerCase()
        .includes(value),
    );
  }, [query]);

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      className="flex-1"
      style={{ backgroundColor: background }}
    >
      {/* Compact WhatsApp-style group header */}
      <View className="px-3 py-2" style={{ backgroundColor: headerBackground }}>
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="mr-3 h-9 w-8 items-center justify-center"
          >
            <ArrowLeft size={23} color={colors.textPrimary} />
          </Pressable>

          <View
            className="mr-3 h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: isDark ? "#49352F" : "#F4E2D9" }}
          >
            <Users size={22} color={isDark ? "#F4A184" : "#B96B50"} />
          </View>

          <View className="flex-1">
            <AppText
              className="text-[15px] font-semibold"
              style={{ color: colors.textPrimary }}
              numberOfLines={1}
            >
              TC College — Official
            </AppText>
            <AppText className="mt-0.5 text-[10px]" style={{ color: muted }}>
              Only admins can send messages
            </AppText>
          </View>

          <Pressable
            onPress={() => setSearchOpen((value) => !value)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Search channel"
            className="h-10 w-9 items-center justify-center"
          >
            {searchOpen ? (
              <X size={20} color={colors.textPrimary} />
            ) : (
              <Search size={20} color={colors.textPrimary} />
            )}
          </Pressable>
          <Pressable
            onPress={() => setInfoOpen(true)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Channel information"
            className="h-10 w-8 items-center justify-center"
          >
            <MoreVertical size={21} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      {/* Pinned message strip */}
      {pinned ? (
        <View
          className="mx-3 mt-2 flex-row items-center rounded-xl px-3 py-2.5"
          style={{ backgroundColor: isDark ? "#26313D" : "#E9EEF7" }}
        >
          <View
            className="mr-2 h-9 w-1 rounded-full"
            style={{ backgroundColor: colors.primary }}
          />
          <View className="flex-1">
            <AppText
              className="text-[11px] font-bold"
              style={{ color: isDark ? "#AFC3FF" : colors.primary }}
            >
              Pinned Message
            </AppText>
            <AppText
              className="mt-0.5 text-[10px]"
              style={{ color: muted }}
              numberOfLines={1}
            >
              {pinned.message}
            </AppText>
          </View>
          <Pin size={18} color={muted} />
        </View>
      ) : null}

      {/* Search expands only when requested */}
      {searchOpen ? (
        <View
          className="mx-3 mt-2 h-10 flex-row items-center rounded-xl px-3"
          style={{
            backgroundColor: isDark ? "#202C33" : colors.surfaceSecondary,
          }}
        >
          <Search size={16} color={muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search messages"
            placeholderTextColor={colors.textMuted}
            autoFocus
            returnKeyType="search"
            style={{
              flex: 1,
              marginLeft: 9,
              paddingVertical: 0,
              fontSize: 12,
              color: colors.textPrimary,
            }}
          />
          {query ? (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <X size={16} color={muted} />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {/* Chat-style feed */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingTop: 3,
          paddingBottom: 16,
        }}
      >
        {filteredPosts.map((post, index) => {
          const previous = filteredPosts[index - 1];
          const showDay = !previous || previous.day !== post.day;
          return (
            <View key={post.id}>
              {showDay ? (
                <View className="my-4 items-center">
                  <View
                    className="rounded-full px-3 py-1.5"
                    style={{ backgroundColor: isDark ? "#23313A" : "#E8EDF2" }}
                  >
                    <AppText
                      className="text-[10px] font-semibold"
                      style={{ color: isDark ? "#D2DCE3" : "#52616B" }}
                    >
                      {post.day}
                    </AppText>
                  </View>
                </View>
              ) : null}
              <MessageBubble post={post} colors={colors} isDark={isDark} />
            </View>
          );
        })}

        {filteredPosts.length === 0 ? (
          <View className="items-center px-6 py-12">
            <Search size={25} color={colors.textMuted} />
            <AppText
              className="mt-3 text-[13px] font-semibold"
              style={{ color: colors.textPrimary }}
            >
              No messages found
            </AppText>
            <AppText
              className="mt-1 text-center text-[10px]"
              style={{ color: muted }}
            >
              Try searching with another word.
            </AppText>
          </View>
        ) : null}
      </ScrollView>

      {/* Fixed read-only footer; students do not get a message composer */}
      <View
        className="items-center justify-center py-4"
        style={{ backgroundColor: headerBackground }}
      >
        <View className="flex-row items-center">
          <LockKeyhole size={13} color={muted} />
          <AppText className="ml-2 text-[11px]" style={{ color: muted }}>
            Only
          </AppText>
          <AppText
            className="mx-1 text-[11px] font-semibold"
            style={{ color: colors.success }}
          >
            admins
          </AppText>
          <AppText className="text-[11px]" style={{ color: muted }}>
            can send messages
          </AppText>
        </View>
      </View>

      {/* Channel information menu */}
      <Modal
        transparent
        visible={infoOpen}
        animationType="fade"
        onRequestClose={() => setInfoOpen(false)}
      >
        <View
          className="flex-1 items-center justify-center px-7"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <Pressable
            onPress={() => setInfoOpen(false)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          <View
            className="w-full rounded-2xl p-5"
            style={{ backgroundColor: colors.surface }}
          >
            <View
              className="mb-3 h-14 w-14 items-center justify-center self-center rounded-full"
              style={{ backgroundColor: isDark ? "#49352F" : "#F4E2D9" }}
            >
              <Users size={25} color={isDark ? "#F4A184" : "#B96B50"} />
            </View>
            <AppText
              className="text-center text-[16px] font-bold"
              style={{ color: colors.textPrimary }}
            >
              TC College — Official
            </AppText>
            <AppText
              className="mt-2 text-center text-[11px] leading-5"
              style={{ color: colors.textSecondary }}
            >
              The official college-wide channel for academic updates, notices,
              events and important documents. Only authorized college
              administrators can publish messages.
            </AppText>
            <Pressable
              onPress={() => setInfoOpen(false)}
              className="mt-5 items-center rounded-xl py-3"
              style={{ backgroundColor: colors.primary }}
            >
              <AppText
                className="text-[12px] font-semibold"
                style={{ color: colors.inverse }}
              >
                Close
              </AppText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
