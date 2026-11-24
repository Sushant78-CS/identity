import { CameraView, useCameraPermissions } from "expo-camera";
import { useFocusEffect } from "expo-router";
import {
  CheckCircle2,
  Flashlight,
  FlashlightOff,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  XCircle,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { StudentIdCard } from "@/features/verification/components/StudentIdCard";
import { useStaffScanner } from "@/features/verification/hooks/useStaffScanner";

export default function StaffScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();

  const [isFocused, setIsFocused] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const bottomClearance = insets.bottom + 110;

  const {
    status,
    result,
    errorMessage,
    isProcessing,
    isScanning,
    handleQrScanned,
    scanAgain,
  } = useStaffScanner();

  // Responsive scanning frame
  const frameSize = Math.min(width - 64, height * 0.38, 340);

  // Handle screen focus and camera lifecycle
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      setCameraError(null);

      return () => {
        setIsFocused(false);
        setTorchEnabled(false);
      };
    }, []),
  );

  // Reset scanner for the next student
  const handleScanAgain = () => {
    setCameraError(null);
    setTorchEnabled(false);
    scanAgain();
  };

  // Camera should only be active while the scanner screen is focused
  const cameraActive =
    isFocused &&
    permission?.granted === true &&
    isScanning &&
    !isProcessing &&
    !cameraError;

  const showScanner = isScanning && !cameraError;

  // --------------------------------------------------
  // CAMERA PERMISSION LOADING
  // --------------------------------------------------

  if (!permission) {
    return (
      <View style={styles.centeredScreen}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Preparing camera...</Text>
      </View>
    );
  }

  // --------------------------------------------------
  // CAMERA PERMISSION DENIED
  // --------------------------------------------------

  if (!permission.granted) {
    return (
      <View style={styles.centeredScreen}>
        <View style={styles.permissionIcon}>
          <ScanLine size={36} color="#FFFFFF" />
        </View>

        <Text style={styles.permissionTitle}>Camera access required</Text>

        <Text style={styles.permissionDescription}>
          Allow camera access to scan and verify student identity QR codes.
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() => {
            if (permission.canAskAgain) {
              void requestPermission();
            } else {
              void Linking.openSettings();
            }
          }}
        >
          <Text style={styles.primaryButtonText}>
            {permission.canAskAgain ? "Allow Camera Access" : "Open Settings"}
          </Text>
        </Pressable>
      </View>
    );
  }

  // --------------------------------------------------
  // MAIN SCREEN
  // --------------------------------------------------

  return (
    <View style={styles.container}>
      {/* CAMERA BACKGROUND */}

      {cameraActive && (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torchEnabled}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={({ data }) => {
            void handleQrScanned(data);
          }}
          onMountError={(event) => {
            setCameraError(event.message);
          }}
        />
      )}

      {/* DARK CAMERA TINT */}

      {cameraActive && <View pointerEvents="none" style={styles.cameraTint} />}

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {showScanner ? (
          <>
            {/* TOP HEADER */}

            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Scan Student ID</Text>

                <Text style={styles.headerSubtitle}>
                  Campus identity verification
                </Text>
              </View>

              {/* FLASHLIGHT */}

              <Pressable
                onPress={() => {
                  setTorchEnabled((current) => !current);
                }}
                accessibilityRole="button"
                accessibilityLabel={
                  torchEnabled ? "Turn flashlight off" : "Turn flashlight on"
                }
                style={[
                  styles.torchButton,
                  torchEnabled && styles.torchButtonActive,
                ]}
              >
                {torchEnabled ? (
                  <FlashlightOff size={23} color="#111111" />
                ) : (
                  <Flashlight size={23} color="#FFFFFF" />
                )}
              </Pressable>
            </View>

            {/* CENTER SCANNING AREA */}

            <View style={styles.scannerArea}>
              <Text style={styles.scanHeading}>Scan student QR code</Text>

              <Text style={styles.scanSubheading}>
                Position the QR code inside the frame
              </Text>

              {/* SCANNER FRAME */}

              <View
                style={[
                  styles.scanFrame,
                  {
                    width: frameSize,
                    height: frameSize,
                  },
                ]}
              >
                {/* SINGLE-COLOR WHITE CORNERS */}

                <View
                  style={[styles.corner, styles.topLeft, styles.scanCorner]}
                />

                <View
                  style={[styles.corner, styles.topRight, styles.scanCorner]}
                />

                <View
                  style={[styles.corner, styles.bottomLeft, styles.scanCorner]}
                />

                <View
                  style={[styles.corner, styles.bottomRight, styles.scanCorner]}
                />
              </View>

              {/* SCAN INSTRUCTIONS */}

              <View style={styles.scanInstructions}>
                <ScanLine size={17} color="#D4D4D8" />

                <Text style={styles.instructionText}>
                  Keep the QR code clearly visible
                </Text>
              </View>
            </View>

            {/* BOTTOM SCANNER INFORMATION */}

            <View
              style={[
                styles.bottomSection,
                {
                  paddingBottom: bottomClearance,
                },
              ]}
            >
              <View style={styles.securityInfo}>
                <ShieldCheck size={17} color="#86EFAC" />

                <Text style={styles.securityText}>
                  Secure student verification
                </Text>
              </View>

              <Text style={styles.bottomHint}>
                Only valid Identity student QR codes can be verified
              </Text>
            </View>
          </>
        ) : (
          <>
            {/* VERIFICATION RESULT HEADER */}

            <View style={styles.resultHeader}>
              <Text style={styles.headerTitle}>Student Verification</Text>

              <Text style={styles.headerSubtitle}>
                Campus identity verification
              </Text>
            </View>

            <ScrollView
              style={styles.resultScroll}
              contentContainerStyle={[
                styles.resultContent,
                {
                  paddingBottom: bottomClearance + 20,
                },
              ]}
              showsVerticalScrollIndicator={false}
            >
              {/* PROCESSING */}

              {isProcessing && (
                <View style={styles.statusCard}>
                  <ActivityIndicator size="large" color="#FFFFFF" />

                  <Text style={styles.statusTitle}>Verifying student...</Text>

                  <Text style={styles.statusDescription}>
                    Checking the QR code securely. Please wait.
                  </Text>
                </View>
              )}

              {/* CAMERA ERROR */}

              {cameraError && (
                <View style={styles.statusCard}>
                  <XCircle size={46} color="#F87171" />

                  <Text style={styles.statusTitle}>Camera unavailable</Text>

                  <Text style={styles.statusDescription}>{cameraError}</Text>

                  <Pressable
                    style={styles.primaryButton}
                    onPress={() => {
                      setCameraError(null);
                    }}
                  >
                    <RefreshCw size={18} color="#111111" />

                    <Text style={styles.primaryButtonText}>Try again</Text>
                  </Pressable>
                </View>
              )}

              {/* VERIFIED STUDENT */}

              {!cameraError &&
                status === "success" &&
                result?.valid &&
                result.student && (
                  <View>
                    <View style={styles.verifiedBanner}>
                      <CheckCircle2 size={22} color="#86EFAC" />

                      <View style={styles.verifiedBannerText}>
                        <Text style={styles.verifiedTitle}>
                          Identity verified
                        </Text>

                        <Text style={styles.verifiedSubtitle}>
                          Student QR code is valid
                        </Text>
                      </View>
                    </View>

                    <StudentIdCard
                      student={result.student}
                      verifiedAt={result.verifiedAt}
                    />

                    <Pressable
                      style={styles.primaryButton}
                      onPress={handleScanAgain}
                    >
                      <RefreshCw size={18} color="#111111" />

                      <Text style={styles.primaryButtonText}>
                        Scan another student
                      </Text>
                    </Pressable>
                  </View>
                )}

              {/* VALID WITHOUT STUDENT DETAILS */}

              {!cameraError &&
                status === "success" &&
                result?.valid &&
                !result.student && (
                  <View style={styles.statusCard}>
                    <CheckCircle2 size={46} color="#86EFAC" />

                    <Text style={styles.statusTitle}>Student verified</Text>

                    <Text style={styles.statusDescription}>
                      {result.message}
                    </Text>

                    <Pressable
                      style={styles.primaryButton}
                      onPress={handleScanAgain}
                    >
                      <RefreshCw size={18} color="#111111" />

                      <Text style={styles.primaryButtonText}>
                        Scan another student
                      </Text>
                    </Pressable>
                  </View>
                )}

              {/* INVALID QR */}

              {!cameraError && status === "invalid" && (
                <View style={styles.statusCard}>
                  <XCircle size={46} color="#F87171" />

                  <Text style={styles.statusTitle}>Verification failed</Text>

                  <Text style={styles.statusDescription}>
                    {result?.message ?? "This QR code is invalid or expired."}
                  </Text>

                  <Pressable
                    style={styles.primaryButton}
                    onPress={handleScanAgain}
                  >
                    <RefreshCw size={18} color="#111111" />

                    <Text style={styles.primaryButtonText}>
                      Try scanning again
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* NETWORK / SERVER ERROR */}

              {!cameraError && status === "error" && (
                <View style={styles.statusCard}>
                  <XCircle size={46} color="#F87171" />

                  <Text style={styles.statusTitle}>
                    Verification unavailable
                  </Text>

                  <Text style={styles.statusDescription}>
                    {errorMessage ?? "Unable to verify the QR code."}
                  </Text>

                  <Pressable
                    style={styles.primaryButton}
                    onPress={handleScanAgain}
                  >
                    <RefreshCw size={18} color="#111111" />

                    <Text style={styles.primaryButtonText}>Try again</Text>
                  </Pressable>
                </View>
              )}
            </ScrollView>
          </>
        )}
      </SafeAreaView>
    </View>
  );
}

// --------------------------------------------------
// STYLES
// --------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
  },

  safeArea: {
    flex: 1,
  },

  cameraTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.22)",
  },

  centeredScreen: {
    flex: 1,
    backgroundColor: "#080808",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  loadingText: {
    color: "#D4D4D8",
    marginTop: 16,
    fontSize: 14,
  },

  // HEADER

  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerText: {
    flex: 1,
    paddingRight: 12,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    color: "#B4B4BB",
    fontSize: 12,
    marginTop: 5,
  },

  torchButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(45,45,48,0.9)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  torchButtonActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },

  // SCANNER

  scannerArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  scanHeading: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },

  scanSubheading: {
    color: "#D4D4D8",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 30,
  },

  scanFrame: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },

  corner: {
    position: "absolute",
    width: 54,
    height: 54,
    borderWidth: 0,
  },

  scanCorner: {
    borderColor: "#FFFFFF",
  },

  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 6,
    borderLeftWidth: 6,
    borderTopLeftRadius: 18,
  },

  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 6,
    borderRightWidth: 6,
    borderTopRightRadius: 18,
  },

  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 6,
    borderLeftWidth: 6,
    borderBottomLeftRadius: 18,
  },

  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderBottomRightRadius: 18,
  },

  scanInstructions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 28,
  },

  instructionText: {
    color: "#D4D4D8",
    fontSize: 13,
  },

  // BOTTOM INFORMATION

  bottomSection: {
    paddingHorizontal: 24,
    alignItems: "center",
    paddingTop: 12,
  },

  securityInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 23,
  },

  securityText: {
    color: "#E4E4E7",
    fontSize: 12,
    fontWeight: "500",
  },

  bottomHint: {
    color: "#A1A1AA",
    fontSize: 11,
    textAlign: "center",
    marginTop: 8,
  },

  // PERMISSION SCREEN

  permissionIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#27272A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  permissionTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },

  permissionDescription: {
    color: "#A1A1AA",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 12,
  },

  // RESULTS

  resultHeader: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },

  resultScroll: {
    flex: 1,
  },

  resultContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    flexGrow: 1,
  },

  statusCard: {
    backgroundColor: "#18181B",
    borderColor: "#303036",
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 42,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  statusTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 20,
  },

  statusDescription: {
    color: "#A1A1AA",
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 10,
  },

  verifiedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(22,101,52,0.22)",
    borderWidth: 1,
    borderColor: "rgba(134,239,172,0.2)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },

  verifiedBannerText: {
    flex: 1,
  },

  verifiedTitle: {
    color: "#D1FAE5",
    fontSize: 15,
    fontWeight: "700",
  },

  verifiedSubtitle: {
    color: "#A7F3D0",
    fontSize: 12,
    marginTop: 4,
  },

  // PRIMARY BUTTON

  primaryButton: {
    minHeight: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 26,
    width: "100%",
  },

  primaryButtonText: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "700",
  },
});
