import { api } from "@/services/api/api-client";

import {
  clearAccessToken,
  clearRefreshToken,
  getRefreshToken,
  saveAccessToken,
  saveRefreshToken,
} from "@/services/storage/token-storage";

import type {
  ApiId,
  AuthRole,
  AuthSessionResponse,
  CurrentUserResponse,
  StaffLoginRequest,
  StudentLoginRequest,
} from "@/features/auth/types/auth.types";

const VALID_ROLES: AuthRole[] = [
  "STUDENT",
  "STAFF",
  "COLLEGE_ADMIN",
  "SUPER_ADMIN",
];

function isValidId(value: unknown): value is ApiId {
  return (
    (typeof value === "string" && value.length > 0) ||
    (typeof value === "number" && Number.isFinite(value))
  );
}

function validateSession(data: unknown): AuthSessionResponse {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid authentication response.");
  }

  const response = data as Record<string, unknown>;

  if (
    typeof response.accessToken !== "string" ||
    !response.accessToken ||
    typeof response.refreshToken !== "string" ||
    !response.refreshToken ||
    typeof response.tokenType !== "string" ||
    typeof response.expiresIn !== "number" ||
    !isValidId(response.userId) ||
    typeof response.fullName !== "string" ||
    typeof response.role !== "string" ||
    !VALID_ROLES.includes(response.role as AuthRole)
  ) {
    throw new Error("Invalid login response from server.");
  }

  if (response.collegeId !== null && !isValidId(response.collegeId)) {
    throw new Error("Invalid college information.");
  }

  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    tokenType: response.tokenType,
    expiresIn: response.expiresIn,
    userId: response.userId,
    fullName: response.fullName,
    role: response.role as AuthRole,
    collegeId: response.collegeId as ApiId | null,
  };
}

async function completeLogin(
  path: string,
  body: StudentLoginRequest | StaffLoginRequest,
): Promise<AuthSessionResponse> {
  // Correct Axios signature: URL, body, config.
  const response = await api.post<unknown>(path, body, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  const session = validateSession(response.data);

  // Save JWT securely before reporting successful login.
  await Promise.all([
    saveAccessToken(session.accessToken),
    saveRefreshToken(session.refreshToken),
  ]);

  return session;
}

export const AuthService = {
  loginStudent(credentials: StudentLoginRequest) {
    return completeLogin("/api/auth/student/login", credentials);
  },

  loginStaff(credentials: StaffLoginRequest) {
    return completeLogin("/api/auth/admin/login", credentials);
  },

  async getCurrentUser(): Promise<CurrentUserResponse> {
    const response = await api.get<CurrentUserResponse>("/api/auth/me");

    return response.data;
  },

  async logout() {
    const refreshToken = await getRefreshToken();

    try {
      if (refreshToken) {
        await api.post("/api/auth/logout", {
          refreshToken,
        });
      }
    } finally {
      await Promise.all([clearAccessToken(), clearRefreshToken()]);
    }
  },
};
