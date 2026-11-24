import { CheckCircle2, GraduationCap, UserRound, X } from "lucide-react-native";
import { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { useAppTheme } from "@/theme/useAppTheme";

import type { VerifiedStudentInfo } from "../types/verification.types";

interface StudentIdCardProps {
  student: VerifiedStudentInfo;
  verifiedAt?: string | null;
}

export function StudentIdCard({ student, verifiedAt }: StudentIdCardProps) {
  const { theme } = useAppTheme();
  const colors = theme.colors;

  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);

  const [imageFailed, setImageFailed] = useState(false);

  const hasImage = Boolean(student.profileImageUrl) && !imageFailed;

  const formattedTime = verifiedAt
    ? new Date(verifiedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <>
      <AppCard padding={0} gap={0} bordered style={styles.card}>
        {/* CARD HEADER */}

        <View style={styles.cardHeader}>
          <View className="flex-row items-center gap-3">
            <View style={styles.logoContainer}>
              <GraduationCap size={23} color="#FFFFFF" />
            </View>

            <View>
              <AppText
                className="text-base font-bold"
                style={{ color: "#FFFFFF" }}
              >
                IDENTITY
              </AppText>

              <AppText
                className="text-[10px] font-medium tracking-widest"
                style={{ color: "#A1A1AA" }}
              >
                DIGITAL STUDENT ID
              </AppText>
            </View>
          </View>

          <View style={styles.verifiedBadge}>
            <CheckCircle2 size={13} color="#86EFAC" />
            <AppText
              className="text-[10px] font-bold"
              style={{ color: "#86EFAC" }}
            >
              VERIFIED
            </AppText>
          </View>
        </View>

        {/* STUDENT INFORMATION */}

        <View style={styles.cardBody}>
          <View style={styles.identityRow}>
            {/* PROFILE IMAGE */}

            {hasImage ? (
              <Pressable
                onPress={() => setImagePreviewVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="View student profile photograph"
                style={styles.photoContainer}
              >
                <Image
                  source={{
                    uri: student.profileImageUrl!,
                  }}
                  style={styles.photo}
                  resizeMode="cover"
                  onError={() => setImageFailed(true)}
                />

                <View style={styles.photoHint}>
                  <AppText
                    style={{
                      color: "#FFFFFF",
                      fontSize: 9,
                      fontWeight: "600",
                    }}
                  >
                    VIEW
                  </AppText>
                </View>
              </Pressable>
            ) : (
              <View
                style={[
                  styles.photo,
                  styles.placeholderPhoto,
                  {
                    backgroundColor: colors.surfaceSecondary,
                  },
                ]}
              >
                <UserRound size={34} color={colors.textSecondary} />
              </View>
            )}

            {/* NAME AND ID */}

            <View className="flex-1 justify-center">
              <AppText className="text-lg font-bold" numberOfLines={2}>
                {student.fullName}
              </AppText>

              <AppText className="mt-1 text-xs" color="secondary">
                STUDENT ID
              </AppText>

              <AppText
                className="mt-0.5 text-sm font-bold"
                style={{ color: colors.primary }}
              >
                {student.studentId}
              </AppText>
            </View>
          </View>

          <View
            style={[styles.separator, { backgroundColor: colors.border }]}
          />

          {/* ACADEMIC DETAILS */}

          <View className="gap-4">
            <InfoItem label="COLLEGE" value={student.collegeName} />

            <View className="flex-row gap-4">
              <View className="flex-1">
                <InfoItem label="DEPARTMENT" value={student.department} />
              </View>

              <View className="flex-1">
                <InfoItem label="COURSE" value={student.course} />
              </View>
            </View>
          </View>
        </View>

        {/* CARD FOOTER */}

        <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
          <View className="flex-row items-center gap-2">
            <CheckCircle2 size={15} color={colors.success} />

            <AppText
              className="text-xs font-semibold"
              style={{ color: colors.success }}
            >
              Identity verified successfully
            </AppText>
          </View>

          {formattedTime && (
            <AppText className="text-[10px]" color="secondary">
              {formattedTime}
            </AppText>
          )}
        </View>
      </AppCard>

      {/* FULL-SCREEN IMAGE PREVIEW */}

      <Modal
        visible={imagePreviewVisible && hasImage}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setImagePreviewVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable
            style={styles.modalClose}
            onPress={() => setImagePreviewVisible(false)}
            accessibilityRole="button"
            accessibilityLabel="Close profile photo"
          >
            <X size={25} color="#FFFFFF" />
          </Pressable>

          {hasImage && (
            <Image
              source={{
                uri: student.profileImageUrl!,
              }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          )}

          <View style={styles.modalCaption}>
            <AppText
              className="text-base font-bold"
              style={{ color: "#FFFFFF" }}
            >
              {student.fullName}
            </AppText>

            <AppText className="mt-1 text-xs" style={{ color: "#A1A1AA" }}>
              {student.studentId}
            </AppText>
          </View>
        </View>
      </Modal>
    </>
  );
}

// REUSABLE INFORMATION ITEM

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <AppText
        className="text-[9px] font-bold tracking-widest"
        color="secondary"
      >
        {label}
      </AppText>

      <AppText className="mt-1 text-xs font-semibold" numberOfLines={2}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 22,
    overflow: "hidden",
  },

  cardHeader: {
    minHeight: 76,
    backgroundColor: "#18181B",
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logoContainer: {
    height: 42,
    width: 42,
    borderRadius: 13,
    backgroundColor: "#303036",
    alignItems: "center",
    justifyContent: "center",
  },

  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#173323",
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 20,
  },

  cardBody: {
    padding: 18,
  },

  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  photoContainer: {
    position: "relative",
  },

  photo: {
    width: 88,
    height: 104,
    borderRadius: 12,
  },

  placeholderPhoto: {
    alignItems: "center",
    justifyContent: "center",
  },

  photoHint: {
    position: "absolute",
    bottom: 5,
    left: 5,
    right: 5,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 5,
    paddingVertical: 3,
  },

  separator: {
    height: 1,
    marginVertical: 18,
  },

  cardFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 18,
    paddingVertical: 15,
    gap: 8,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.96)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  modalClose: {
    position: "absolute",
    top: 65,
    right: 25,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#29292D",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },

  previewImage: {
    width: "100%",
    height: "65%",
  },

  modalCaption: {
    alignItems: "center",
    marginTop: 22,
  },
});
