import axios, {
  AxiosHeaders,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

import {
  clearAccessToken,
  clearRefreshToken,
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
  saveRefreshToken,
} from "@/services/storage/token-storage";
import { clearUser } from "@/services/storage/user-storage";

const AUTH_ENDPOINTS = [
  "/api/auth/student/login",
  "/api/auth/admin/login",
  "/api/auth/refresh",
  "/api/auth/logout",
];

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

class SessionExpiredError extends Error {
  constructor() {
    super("Your session has expired. Please sign in again.");
    this.name = "SessionExpiredError";
  }
}

let refreshPromise: Promise<string> | null = null;
let sessionExpiredHandler: (() => void) | null = null;

// The auth store registers this handler to update its state.
export function registerSessionExpiredHandler(handler: () => void) {
  sessionExpiredHandler = handler;
}

function isAuthEndpoint(url?: string): boolean {
  const path = url?.split("?")[0] ?? "";

  return AUTH_ENDPOINTS.some(
    (endpoint) => path === endpoint || path.endsWith(endpoint),
  );
}

// Requests a new access token using the refresh token.
// Uses axios directly to avoid triggering this API client's interceptors.
async function requestNewAccessToken(): Promise<string> {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    throw new SessionExpiredError();
  }

  const response = await axios.post<RefreshResponse>(
    "/api/auth/refresh",
    { refreshToken },
    {
      baseURL: api.defaults.baseURL,
      timeout: api.defaults.timeout,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const data = response.data;

  if (
    typeof data?.accessToken !== "string" ||
    !data.accessToken ||
    typeof data?.refreshToken !== "string" ||
    !data.refreshToken
  ) {
    throw new Error("Invalid refresh response from server.");
  }

  // The backend rotates both tokens, so save both new values.
  await Promise.all([
    saveAccessToken(data.accessToken),
    saveRefreshToken(data.refreshToken),
  ]);

  return data.accessToken;
}

// All simultaneous 401 responses share the same refresh request.
function getFreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = requestNewAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

function isInvalidRefreshToken(error: unknown): boolean {
  if (error instanceof SessionExpiredError) {
    return true;
  }

  if (!axios.isAxiosError(error)) {
    return false;
  }

  const status = error.response?.status;

  return status === 400 || status === 401 || status === 403;
}

async function clearExpiredSession() {
  await Promise.all([
    clearAccessToken(),
    clearRefreshToken(),
    clearUser(),
  ]).catch(() => undefined);

  sessionExpiredHandler?.();
}

// Attach the current access token to protected requests.
api.interceptors.request.use(async (config) => {
  if (isAuthEndpoint(config.url)) {
    return config;
  }

  const token = await getAccessToken();

  if (token) {
    config.headers = AxiosHeaders.from(config.headers);
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});

// Refresh an expired token and retry the original request once.
api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newAccessToken = await getFreshAccessToken();

      originalRequest.headers = AxiosHeaders.from(originalRequest.headers);

      originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);

      return api.request(originalRequest);
    } catch (refreshError) {
      // Only clear the session when the refresh token is invalid.
      // Network failures and server errors should preserve the session.
      if (isInvalidRefreshToken(refreshError)) {
        await clearExpiredSession();
      }

      return Promise.reject(refreshError);
    }
  },
);
