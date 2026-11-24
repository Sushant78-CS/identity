import { X } from "lucide-react-native";
import { Modal, Pressable, View, type ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
import { useAppTheme } from "@/theme/useAppTheme";

interface AppBottomSheetProps extends ViewProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function AppBottomSheet({
  visible,
  onClose,
  title,
  description,
  children,
  style,
  ...props
}: AppBottomSheetProps) {
  const { theme } = useAppTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end">
        {/* Backdrop */}
        <Pressable
          className="absolute inset-0"
          onPress={onClose}
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          accessibilityRole="button"
          accessibilityLabel="Close bottom sheet"
        />

        {/* Sheet */}
        <SafeAreaView
          edges={["bottom"]}
          style={{
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 20,
            paddingTop: 12,
            maxHeight: "85%",
          }}
        >
          {/* Drag indicator */}
          <View className="items-center mb-5">
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 4,
                backgroundColor: theme.colors.textMuted,
                opacity: 0.5,
              }}
            />
          </View>

          {/* Header */}
          {(title || description) && (
            <View className="flex-row items-start justify-between mb-5">
              <View className="flex-1 mr-4">
                {title && <AppText variant="h3">{title}</AppText>}

                {description && (
                  <AppText
                    variant="caption"
                    color="secondary"
                    style={{ marginTop: 5 }}
                  >
                    {description}
                  </AppText>
                )}
              </View>

              <Pressable
                onPress={onClose}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Close"
                style={{
                  padding: 8,
                  borderRadius: 20,
                  backgroundColor: theme.colors.surfaceSecondary,
                }}
              >
                <X size={20} color={theme.colors.textSecondary} />
              </Pressable>
            </View>
          )}

          <View style={style} {...props}>
            {children}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
