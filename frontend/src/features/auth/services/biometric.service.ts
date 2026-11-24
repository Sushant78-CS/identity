import * as LocalAuthentication from "expo-local-authentication";
import { Platform } from "react-native";

type SupportedBiometricType = Awaited<
  ReturnType<typeof LocalAuthentication.supportedAuthenticationTypesAsync>
>[number];

type AuthenticationError = Extract<
  Awaited<ReturnType<typeof LocalAuthentication.authenticateAsync>>,
  { success: false }
>["error"];

export interface BiometricAvailability {
  hasHardware: boolean;
  isEnrolled: boolean;
  isAvailable: boolean;
  supportedTypes: SupportedBiometricType[];
  label: string;
}

export type BiometricAuthResult =
  | { success: true }
  | {
      success: false;
      reason:
        | "hardware_unavailable"
        | "not_enrolled"
        | AuthenticationError
        | "unknown";
    };

function getBiometricLabel(types: SupportedBiometricType[]): string {
  const labels = types.map((type) => {
    if (type === LocalAuthentication.AuthenticationType.FINGERPRINT) {
      return Platform.OS === "ios" ? "Touch ID" : "Fingerprint";
    }

    if (type === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) {
      return Platform.OS === "ios" ? "Face ID" : "Face recognition";
    }

    if (type === LocalAuthentication.AuthenticationType.IRIS) {
      return "Iris recognition";
    }

    return "Biometrics";
  });

  return [...new Set(labels)].join(" or ") || "Biometrics";
}

async function getAvailability(): Promise<BiometricAvailability> {
  const [hasHardware, isEnrolled, supportedTypes] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
    LocalAuthentication.supportedAuthenticationTypesAsync(),
  ]);

  return {
    hasHardware,
    isEnrolled,
    isAvailable: hasHardware && isEnrolled && supportedTypes.length > 0,
    supportedTypes,
    label: getBiometricLabel(supportedTypes),
  };
}

let authenticationInProgress = false;

async function authenticate(
  promptMessage = "Unlock Identity",
): Promise<BiometricAuthResult> {
  authenticationInProgress = true;

  try {
    const availability = await getAvailability();

    if (!availability.hasHardware) {
      return {
        success: false,
        reason: "hardware_unavailable",
      };
    }

    if (!availability.isEnrolled) {
      return {
        success: false,
        reason: "not_enrolled",
      };
    }

    if (availability.supportedTypes.length === 0) {
      return {
        success: false,
        reason: "hardware_unavailable",
      };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: "Cancel",
      biometricsSecurityLevel: "strong",
    });

    if (result.success) {
      return { success: true };
    }

    return {
      success: false,
      reason: result.error,
    };
  } catch {
    return {
      success: false,
      reason: "unknown",
    };
  } finally {
    authenticationInProgress = false;
  }
}

function isAuthenticationInProgress(): boolean {
  return authenticationInProgress;
}

export const BiometricService = {
  getAvailability,
  authenticate,
  isAuthenticationInProgress,
};
