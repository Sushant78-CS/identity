import { Text, type TextProps } from "react-native";

import { typography } from "@/theme/typography";
import { useAppTheme } from "@/theme/useAppTheme";

type TextVariant = keyof typeof typography;

type TextColor =
  | "primary"
  | "secondary"
  | "muted"
  | "inverse"
  | "brand"
  | "success"
  | "danger";

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: TextColor;
  className?: string;
}

export function AppText({
  variant = "body",
  color = "primary",
  className = "",
  style,
  allowFontScaling = true,
  ...props
}: AppTextProps) {
  const { theme } = useAppTheme();

  const textColors = {
    primary: theme.colors.textPrimary,
    secondary: theme.colors.textSecondary,
    muted: theme.colors.textMuted,
    inverse: theme.colors.inverse,
    brand: theme.colors.primary,
    success: theme.colors.success,
    danger: theme.colors.danger,
  };

  const hasCustomFontClass =
    /\b(text-(xs|sm|base|lg|xl|[2-9]xl|\[.*?\])|font-(thin|light|normal|medium|semibold|bold|extrabold|black))\b/.test(
      className,
    );

  return (
    <Text
      {...props}
      allowFontScaling={allowFontScaling}
      className={className}
      style={[
        hasCustomFontClass ? undefined : typography[variant],
        { color: textColors[color] },
        style,
      ]}
    />
  );
}
