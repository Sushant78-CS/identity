import type { ReactNode } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppCard } from "@/components/ui/AppCard";
import { useAppTheme } from "@/theme/useAppTheme";

import { StaffScreenHeader } from "./StaffScreenHeader";

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function StaffDetailContainer({ title, subtitle, children }: Props) {
  const { theme } = useAppTheme();
  const colors = theme.colors;

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top"]}
      style={{ backgroundColor: colors.background }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 40,
        }}
      >
        <StaffScreenHeader title={title} subtitle={subtitle} />

        <AppCard padding={0} gap={0}>
          {children}
        </AppCard>
      </ScrollView>
    </SafeAreaView>
  );
}
