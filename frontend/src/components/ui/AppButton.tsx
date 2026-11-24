import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  type ViewStyle,
} from "react-native";

import { useAppTheme } from "@/theme/useAppTheme";
import { AppText } from "./AppText";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

type ButtonSize = "sm" | "md" | "lg";

interface AppButtonProps extends Omit<PressableProps, "style"> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  style?: ViewStyle;
}

export function AppButton({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  className = "",
  style,
  ...props
}: AppButtonProps) {
  const { theme } = useAppTheme();

  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
      textColor: theme.colors.inverse,
    },
    secondary: {
      backgroundColor: theme.colors.surfaceSecondary,
      borderColor: theme.colors.surfaceSecondary,
      textColor: theme.colors.textPrimary,
    },
    outline: {
      backgroundColor: "transparent",
      borderColor: theme.colors.border,
      textColor: theme.colors.primary,
    },
    ghost: {
      backgroundColor: "transparent",
      borderColor: "transparent",
      textColor: theme.colors.primary,
    },
    danger: {
      backgroundColor: theme.colors.danger,
      borderColor: theme.colors.danger,
      textColor: theme.colors.inverse,
    },
  };

  const sizeStyles = {
    sm: { height: 40, paddingHorizontal: 14 },
    md: { height: 48, paddingHorizontal: 18 },
    lg: { height: 54, paddingHorizontal: 22 },
  };

  const selectedVariant = variantStyles[variant];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      className={className}
      style={({ pressed }) => [
        {
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          borderWidth: 1,
          borderRadius: 12,
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
          width: fullWidth ? "100%" : undefined,
          backgroundColor: selectedVariant.backgroundColor,
          borderColor: selectedVariant.borderColor,
        },
        sizeStyles[size],
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={selectedVariant.textColor} />
      ) : (
        <AppText
          variant="button"
          color="inverse"
          style={{ color: selectedVariant.textColor }}
        >
          {title}
        </AppText>
      )}
    </Pressable>
  );
}
