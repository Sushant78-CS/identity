import * as SecureStore from "expo-secure-store";

const BIOMETRIC_KEY_PREFIX = "identity.biometric-enabled";

type UserId = string | number;

function getStorageKey(userId: UserId): string {
  const id = String(userId).trim();

  if (!id) {
    throw new Error("A valid user ID is required.");
  }

  return `${BIOMETRIC_KEY_PREFIX}.${id}`;
}

export async function getBiometricEnabled(userId: UserId): Promise<boolean> {
  const value = await SecureStore.getItemAsync(getStorageKey(userId));

  return value === "true";
}

export async function setBiometricEnabled(
  userId: UserId,
  enabled: boolean,
): Promise<void> {
  await SecureStore.setItemAsync(getStorageKey(userId), String(enabled));
}

export async function clearBiometricPreference(userId: UserId): Promise<void> {
  await SecureStore.deleteItemAsync(getStorageKey(userId));
}
