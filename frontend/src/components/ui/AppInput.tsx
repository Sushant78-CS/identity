import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { Pressable, TextInput, View, type TextInputProps } from "react-native";

import { useAppTheme } from "@/theme/useAppTheme";
import { AppText } from "./AppText";

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export function AppInput({
  label,
  error,
  helperText,
  secureTextEntry = false,
  containerClassName = "",
  onFocus,
  onBlur,
  ...props
}: AppInputProps) {
  const { theme } = useAppTheme();

  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = secureTextEntry;

  return (
    <View className={containerClassName}>
      {label && (
        <AppText variant="label" className="mb-2">
          {label}
        </AppText>
      )}

      <View
        className="flex-row items-center rounded-xl border px-4"
        style={{
          minHeight: 52,
          backgroundColor: theme.colors.surface,
          borderColor: error
            ? theme.colors.danger
            : isFocused
              ? theme.colors.primary
              : theme.colors.border,
        }}
      >
        <TextInput
          {...props}
          secureTextEntry={isPassword && !showPassword}
          placeholderTextColor={theme.colors.textMuted}
          selectionColor={theme.colors.primary}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          style={[
            {
              flex: 1,
              color: theme.colors.textPrimary,
              fontSize: 15,
              paddingVertical: 12,
            },
            props.style,
          ]}
        />

        {isPassword && (
          <Pressable
            onPress={() => setShowPassword((previous) => !previous)}
            accessibilityRole="button"
            accessibilityLabel={
              showPassword ? "Hide password" : "Show password"
            }
            hitSlop={10}
          >
            {showPassword ? (
              <EyeOff size={20} color={theme.colors.textMuted} />
            ) : (
              <Eye size={20} color={theme.colors.textMuted} />
            )}
          </Pressable>
        )}
      </View>

      {error ? (
        <AppText variant="caption" color="danger" className="mt-1">
          {error}
        </AppText>
      ) : helperText ? (
        <AppText variant="caption" color="muted" className="mt-1">
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}
