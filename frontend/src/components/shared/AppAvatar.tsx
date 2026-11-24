import { UserRound } from "lucide-react-native";
import { Image, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { useAppTheme } from "@/theme/useAppTheme";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AppAvatarProps {
  name?: string;
  imageUrl?: string;
  size?: AvatarSize;
  showOnline?: boolean;
}

const sizeStyles = {
  sm: { container: 32, text: "caption" as const, icon: 16 },
  md: { container: 42, text: "bodyMedium" as const, icon: 20 },
  lg: { container: 56, text: "h3" as const, icon: 26 },
  xl: { container: 76, text: "h2" as const, icon: 34 },
};

function getInitials(name?: string) {
  if (!name?.trim()) return "";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function AppAvatar({
  name,
  imageUrl,
  size = "md",
  showOnline = false,
}: AppAvatarProps) {
  const { theme } = useAppTheme();
  const colors = theme.colors;
  const dimensions = sizeStyles[size];

  return (
    <View
      style={{
        width: dimensions.container,
        height: dimensions.container,
        borderRadius: dimensions.container / 2,
        backgroundColor: colors.surfaceSecondary,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: dimensions.container / 2,
          }}
          resizeMode="cover"
        />
      ) : name ? (
        <AppText variant={dimensions.text} style={{ fontWeight: "600" }}>
          {getInitials(name)}
        </AppText>
      ) : (
        <UserRound size={dimensions.icon} color={colors.textSecondary} />
      )}

      {showOnline && (
        <View
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: colors.success,
            borderWidth: 2,
            borderColor: colors.surface,
          }}
        />
      )}
    </View>
  );
}
