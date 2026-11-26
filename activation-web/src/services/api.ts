import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { authStorage } from "../features/auth/auth.storage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not configured");
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
  withCredentials: true,
});

// Separate client prevents the refresh request from
// triggering the same response interceptor.
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
});

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface RefreshResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  fullName: string;
  role: string;
  collegeId: number | null;
}

let refreshPromise: Promise<string> | null = null;

api.interceptors.request.use((config) => {
  const isActivationRequest = config.url?.includes(
    "/api/auth/student/activate",
  );

  const token = authStorage.getAccessToken();

  if (token && !isActivationRequest) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest | undefined;

    const requestUrl = originalRequest?.url ?? "";

    const publicAuthEndpoints = [
      "/api/auth/web/admin/login",
      "/api/auth/web/student/login",
      "/api/auth/web/refresh",
      "/api/auth/web/logout",
      "/api/auth/student/login",
      "/api/auth/admin/login",
      "/api/auth/student/activate",
      "/api/auth/refresh",
      "/api/auth/logout",
    ];

    const isPublicAuthRequest = publicAuthEndpoints.some((endpoint) =>
      requestUrl.includes(endpoint),
    );

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isPublicAuthRequest
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshClient
          .post<RefreshResponse>("/api/auth/web/refresh")
          .then(({ data }) => {
            if (data.role !== "COLLEGE_ADMIN" || !data.accessToken) {
              throw new Error("Invalid administrator session.");
            }

            authStorage.setAccessToken(data.accessToken);

            return data.accessToken;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newAccessToken = await refreshPromise;

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      authStorage.clear();

      window.dispatchEvent(new CustomEvent("identity:session-expired"));

      return Promise.reject(refreshError);
    }
  },
);

// Existing student activation API — preserved.

export interface ActivateStudentRequest {
  token: string;
  password: string;
}

export interface ActivationResponse {
  message: string;
}

export const activateStudent = async (
  request: ActivateStudentRequest,
): Promise<ActivationResponse> => {
  const response = await api.post<ActivationResponse>(
    "/api/auth/student/activate",
    request,
  );

  return response.data;
};
