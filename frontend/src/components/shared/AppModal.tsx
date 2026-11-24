import type { ReactNode } from "react";
import { Modal, Pressable, View } from "react-native";

import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { useAppTheme } from "@/theme/useAppTheme";

type ModalVariant = "default" | "danger";

interface AppModalProps {
  visible: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ModalVariant;
  loading?: boolean;
  onConfirm?: () => void;
  onCancel: () => void;
}

export function AppModal({
  visible,
  title,
  description,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
}: AppModalProps) {
  const { theme } = useAppTheme();
  const colors = theme.colors;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.65)" }}
      >
        <Pressable
          className="absolute inset-0"
          onPress={onCancel}
          accessibilityLabel="Close dialog"
        />

        <View
          className="w-full rounded-3xl p-5"
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <AppText variant="h3">{title}</AppText>

          {description && (
            <AppText variant="bodyMedium" color="secondary" className="mt-3">
              {description}
            </AppText>
          )}

          {children && <View className="mt-4">{children}</View>}

          <View className="flex-row gap-3 mt-6">
            <View className="flex-1">
              <AppButton
                title={cancelLabel}
                variant="secondary"
                fullWidth
                disabled={loading}
                onPress={onCancel}
              />
            </View>

            {onConfirm && (
              <View className="flex-1">
                <AppButton
                  title={confirmLabel}
                  variant="secondary"
                  fullWidth
                  loading={loading}
                  onPress={onConfirm}
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
