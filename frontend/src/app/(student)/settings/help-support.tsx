import { useState } from "react";
import { Pressable, View } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";

import { AppText } from "@/components/ui/AppText";
import {
  SettingsNotice,
  SettingsPage,
  SettingsSection,
} from "@/features/profile/components/SettingsPage";
import { useAppTheme } from "@/theme/useAppTheme";

const FAQS = [
  {
    question: "How do I show my digital ID?",
    answer:
      "Open the My ID tab and select Show verification QR. You can also open the QR sheet from the Home screen. A demo credential is only for testing and cannot be used for campus entry.",
  },
  {
    question: "How do I change the app theme?",
    answer:
      "Open Profile, select Appearance, and choose System default, Light, or Dark.",
  },
  {
    question: "Why are some profile details unavailable?",
    answer:
      "Some fields in the current demo profile are not connected to the college information system yet. Official student details are managed by your college.",
  },
  {
    question: "Who can help with account information?",
    answer:
      "Contact your college administrator for changes to official student records or account access. A support contact has not been configured in this demo app.",
  },
];

export default function HelpSupportScreen() {
  const { theme } = useAppTheme();
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <SettingsPage
      title="Help & support"
      subtitle="Find answers to common questions about Identity."
    >
      <SettingsSection>
        {FAQS.map((item, index) => {
          const isExpanded = expanded === index;

          return (
            <View key={item.question}>
              <Pressable
                onPress={() => setExpanded(isExpanded ? null : index)}
                className="flex-row items-center px-4 py-4"
              >
                <AppText
                  className="flex-1 pr-3 text-[13px] font-medium"
                  style={{ color: theme.colors.textPrimary }}
                >
                  {item.question}
                </AppText>
                {isExpanded ? (
                  <ChevronUp size={18} color={theme.colors.textSecondary} />
                ) : (
                  <ChevronDown size={18} color={theme.colors.textSecondary} />
                )}
              </Pressable>

              {isExpanded ? (
                <View className="px-4 pb-4">
                  <AppText
                    className="text-[12px] leading-[19px]"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    {item.answer}
                  </AppText>
                </View>
              ) : null}

              {index !== FAQS.length - 1 ? (
                <View
                  className="mx-4 h-px"
                  style={{ backgroundColor: theme.colors.border }}
                />
              ) : null}
            </View>
          );
        })}
      </SettingsSection>

      <SettingsNotice
        title="Need more help?"
        message="For college account or official student-record issues, contact your college administrator. In-app support contact details are not configured yet."
      />
    </SettingsPage>
  );
}
