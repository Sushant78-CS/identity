import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "identity.access-token";
const REFRESH_TOKEN_KEY = "identity.refresh-token";

export const saveAccessToken = async (token: string) => {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
};

export const getAccessToken = async () => {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
};

export const clearAccessToken = async () => {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
};

export const saveRefreshToken = async (token: string) => {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
};

export const getRefreshToken = async () => {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
};

export const clearRefreshToken = async () => {
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
};

export const clearTokens = async () => {
  await Promise.all([clearAccessToken(), clearRefreshToken()]);
};
