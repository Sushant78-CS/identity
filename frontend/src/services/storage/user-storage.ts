import * as SecureStore from "expo-secure-store";

import type {
  ApiId,
  AuthRole,
  AuthUserSnapshot,
} from "@/features/auth/types/auth.types";

const USER_KEY = "identity.auth-user";

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

function isValidUser(value: unknown): value is AuthUserSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }

  const user = value as Record<string, unknown>;

  return (
    isValidId(user.userId) &&
    typeof user.fullName === "string" &&
    user.fullName.trim().length > 0 &&
    typeof user.role === "string" &&
    VALID_ROLES.includes(user.role as AuthRole) &&
    (user.collegeId === null || isValidId(user.collegeId)) &&
    (user.studentId === undefined || typeof user.studentId === "string")
  );
}

export async function saveUser(user: AuthUserSnapshot): Promise<void> {
  if (!isValidUser(user)) {
    throw new Error("Cannot save invalid user information.");
  }

  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function getUser(): Promise<AuthUserSnapshot | null> {
  const storedUser = await SecureStore.getItemAsync(USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    const parsedUser: unknown = JSON.parse(storedUser);

    if (!isValidUser(parsedUser)) {
      await clearUser();
      return null;
    }

    return parsedUser;
  } catch {
    await clearUser();
    return null;
  }
}

export async function clearUser(): Promise<void> {
  await SecureStore.deleteItemAsync(USER_KEY);
}
