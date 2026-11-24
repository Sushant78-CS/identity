import {
  CalendarDays,
  ExternalLink,
  MessageCircle,
  Users,
  X,
} from "lucide-react-native";
import { useState } from "react";
import { Linking, Modal, Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { useAppTheme } from "@/theme/useAppTheme";

interface UniVibeBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

const UNIVIBE_URL = "https://uni-vibe-479c.vercel.app/home";

export function UniVibeBottomSheet({
  visible,
  onClose,
}: UniVibeBottomSheetProps) {
  const { theme, isDark } = useAppTheme();
  const colors = theme.colors;

  const [isOpening, setIsOpening] = useState(false);

  const openUniVibe = async () => {
    try {
      setIsOpening(true);
      await Linking.openURL(UNIVIBE_URL);
      onClose();
    } catch {
      // Keep the sheet open if the browser cannot be opened.
    } finally {
      setIsOpening(false);
    }
  };

  const benefits = [
    {
      icon: Users,
      label: "Connect with fellow students",
    },
    {
      icon: CalendarDays,
      label: "Discover campus events",
    },
    {
      icon: MessageCircle,
      label: "Share updates and engage",
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        {/* BACKDROP */}
        <Pressable
          className="absolute inset-0"
          onPress={onClose}
          style={{
            backgroundColor: "rgba(0,0,0,0.65)",
          }}
        />

        {/* BOTTOM SHEET */}
        <View
          className="rounded-t-[30px] px-5 pb-8 pt-3"
          style={{
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderColor: colors.border,
          }}
        >
          {/* HANDLE */}
          <View className="mb-5 items-center">
            <View
              className="h-1 w-10 rounded-full"
              style={{
                backgroundColor: colors.textMuted,
                opacity: 0.5,
              }}
            />
          </View>

          {/* HEADER */}
          <View className="mb-5 flex-row items-center">
            <View
              className="mr-3 h-12 w-12 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: isDark ? "#302044" : "#F0E5FA",
              }}
            >
              <Users size={24} color="#A855F7" />
            </View>

            <View className="flex-1">
              <AppText className="text-base font-extrabold">UniVibe</AppText>
              <AppText
                className="mt-0.5 text-[10px] font-semibold tracking-wider"
                style={{ color: "#A855F7" }}
              >
                YOUR CAMPUS COMMUNITY
              </AppText>
            </View>

            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close UniVibe information"
              className="h-9 w-9 items-center justify-center rounded-full"
              style={{
                backgroundColor: colors.surfaceSecondary,
              }}
            >
              <X size={19} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* WEBSITE PREVIEW */}
          <View
            className="overflow-hidden rounded-2xl border"
            style={{ borderColor: colors.border }}
          >
            {/* <Image
              source={require("@/assets/images/univibe-preview.png")}
              className="h-[170px] w-full"
              resizeMode="cover"
              accessibilityLabel="Preview of the UniVibe website"
            /> */}
          </View>

          {/* DESCRIPTION */}
          <AppText className="mt-5 text-[21px] font-extrabold">
            Your college. Your community.
          </AppText>

          <AppText
            className="mt-2 text-[13px] leading-[21px]"
            style={{ color: colors.textSecondary }}
          >
            UniVibe brings your campus community together. Connect with fellow
            students, discover events, share updates and participate in campus
            activities.
          </AppText>

          {/* BENEFITS */}
          <View className="mt-5 gap-3">
            {benefits.map(({ icon: Icon, label }) => (
              <View key={label} className="flex-row items-center">
                <View
                  className="mr-3 h-8 w-8 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: isDark ? "#302044" : "#F0E5FA",
                  }}
                >
                  <Icon size={16} color="#A855F7" />
                </View>

                <AppText className="text-xs font-medium">{label}</AppText>
              </View>
            ))}
          </View>

          {/* CTA */}
          <Pressable
            onPress={openUniVibe}
            disabled={isOpening}
            accessibilityRole="link"
            className="mt-6 h-[54px] flex-row items-center justify-center rounded-2xl"
            style={{
              backgroundColor: "#A855F7",
              opacity: isOpening ? 0.7 : 1,
            }}
          >
            <AppText className="text-sm font-bold text-white">
              Explore UniVibe
            </AppText>
            <ExternalLink size={17} color="#FFFFFF" style={{ marginLeft: 9 }} />
          </Pressable>

          <AppText
            className="mt-3 text-center text-[10px]"
            style={{ color: colors.textMuted }}
          >
            Opens the official UniVibe website in your browser
          </AppText>
        </View>
      </View>
    </Modal>
  );
}
