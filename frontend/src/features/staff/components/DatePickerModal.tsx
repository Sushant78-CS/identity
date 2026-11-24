import { ChevronLeft, ChevronRight, X } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import {
  getCalendarDays,
  getLocalDateString,
  parseLocalDate,
} from "@/features/staff/services/date";
import { useAppTheme } from "@/theme/useAppTheme";

type Props = {
  visible: boolean;
  selectedDate: string;
  today: string;
  onSelect: (date: string) => void;
  onClose: () => void;
};

export function DatePickerModal({
  visible,
  selectedDate,
  today,
  onSelect,
  onClose,
}: Props) {
  const { theme } = useAppTheme();
  const colors = theme.colors;

  const [month, setMonth] = useState(parseLocalDate(selectedDate));

  // Re-center on the selected date every time the modal opens
  useEffect(() => {
    if (visible) setMonth(parseLocalDate(selectedDate));
  }, [visible, selectedDate]);

  const days = useMemo(() => getCalendarDays(month), [month]);

  const todayDate = parseLocalDate(today);
  const isCurrentMonth =
    month.getFullYear() === todayDate.getFullYear() &&
    month.getMonth() === todayDate.getMonth();

  const label = month.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        className="flex-1 justify-center px-5"
        style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      >
        <Pressable className="absolute inset-0" onPress={onClose} />

        <View
          className="rounded-3xl p-5"
          style={{ backgroundColor: colors.background }}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <AppText variant="h2">Select date</AppText>
              <AppText variant="caption" color="secondary" className="mt-1">
                Pick a day to see its verifications
              </AppText>
            </View>

            <Pressable
              onPress={onClose}
              className="h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.surfaceSecondary }}
            >
              <X size={18} color={colors.textPrimary} />
            </Pressable>
          </View>

          <View className="mt-6 flex-row items-center justify-between">
            <Pressable
              onPress={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
              }
              hitSlop={10}
              className="h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.surfaceSecondary }}
            >
              <ChevronLeft size={19} color={colors.textPrimary} />
            </Pressable>

            <AppText variant="body" className="font-semibold">
              {label}
            </AppText>

            <Pressable
              disabled={isCurrentMonth}
              onPress={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
              }
              hitSlop={10}
              className="h-9 w-9 items-center justify-center rounded-full"
              style={{
                backgroundColor: colors.surfaceSecondary,
                opacity: isCurrentMonth ? 0.35 : 1,
              }}
            >
              <ChevronRight size={19} color={colors.textPrimary} />
            </Pressable>
          </View>

          <View className="mt-5 flex-row">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <View key={i} className="flex-1 items-center">
                <AppText variant="caption" color="secondary">
                  {d}
                </AppText>
              </View>
            ))}
          </View>

          <View className="mt-3 flex-row flex-wrap">
            {days.map((day, index) => {
              if (day === null) {
                return (
                  <View
                    key={`empty-${index}`}
                    style={{ width: "14.2857%", height: 43 }}
                  />
                );
              }

              const dateString = getLocalDateString(
                new Date(month.getFullYear(), month.getMonth(), day),
              );

              const isSelected = dateString === selectedDate;
              const isToday = dateString === today;
              const isFuture = dateString > today;

              return (
                <Pressable
                  key={dateString}
                  disabled={isFuture}
                  onPress={() => onSelect(dateString)}
                  style={{
                    width: "14.2857%",
                    height: 43,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View
                    className="h-9 w-9 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: isSelected
                        ? colors.primary
                        : "transparent",
                      borderWidth: isToday && !isSelected ? 1 : 0,
                      borderColor: colors.primary,
                      opacity: isFuture ? 0.3 : 1,
                    }}
                  >
                    <AppText
                      variant="body"
                      className={isSelected ? "font-semibold" : ""}
                      color={isSelected ? "inverse" : "primary"}
                    >
                      {day}
                    </AppText>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={() => onSelect(today)}
            className="mt-5 items-center rounded-xl py-3"
            style={{ backgroundColor: colors.surfaceSecondary }}
          >
            <AppText variant="body" className="font-semibold">
              Go to today
            </AppText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
