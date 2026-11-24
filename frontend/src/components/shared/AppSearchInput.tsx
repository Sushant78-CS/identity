import { Search, X } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { useAppTheme } from "@/theme/useAppTheme";

interface AppSearchInputProps extends Omit<
  TextInputProps,
  "value" | "onChangeText"
> {
  value: string;
  onChangeText: (text: string) => void;
  loading?: boolean;
  containerClassName?: string;
}

export function AppSearchInput({
  value,
  onChangeText,
  loading = false,
  placeholder = "Search...",
  containerClassName = "",
  ...props
}: AppSearchInputProps) {
  const { theme } = useAppTheme();
  const colors = theme.colors;

  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      className={`flex-row items-center rounded-xl border px-4 ${containerClassName}`}
      style={{
        minHeight: 50,
        backgroundColor: colors.surface,
        borderColor: isFocused ? colors.primary : colors.border,
      }}
    >
      <Search size={20} color={colors.textMuted} />

      <TextInput
        {...props}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        returnKeyType="search"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          flex: 1,
          color: colors.textPrimary,
          fontSize: 15,
          paddingVertical: 12,
          marginLeft: 10,
        }}
      />

      {loading ? (
        <ActivityIndicator size="small" color={colors.textSecondary} />
      ) : value.length > 0 ? (
        <Pressable
          onPress={() => onChangeText("")}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <X size={19} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}
