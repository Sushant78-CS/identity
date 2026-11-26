import { api } from "../../services/api";
import { authStorage } from "./auth.storage";

import type { AdminLoginRequest, WebAuthResponse } from "./auth.types";

export const authService = {
  async login(request: AdminLoginRequest): Promise<WebAuthResponse> {
    const { data } = await api.post<WebAuthResponse>(
      "/api/auth/web/admin/login",
      request,
    );

    if (data.role !== "COLLEGE_ADMIN" || !data.accessToken) {
      authStorage.clear();

      throw new Error("This account does not have College Admin access.");
    }

    authStorage.setAccessToken(data.accessToken);

    return data;
  },

  async refresh(): Promise<WebAuthResponse> {
    const { data } = await api.post<WebAuthResponse>("/api/auth/web/refresh");

    if (data.role !== "COLLEGE_ADMIN" || !data.accessToken) {
      authStorage.clear();

      throw new Error("Invalid administrator session.");
    }

    authStorage.setAccessToken(data.accessToken);

    return data;
  },

  async getCurrentUser() {
    const { data } = await api.get<{
      userId: number;
      role: "STUDENT" | "STAFF" | "COLLEGE_ADMIN" | "SUPER_ADMIN";
      collegeId: number | null;
    }>("/api/auth/me");

    return data;
  },

  async logout(): Promise<void> {
    try {
      await api.post("/api/auth/web/logout");
    } finally {
      authStorage.clear();
    }
  },
};
