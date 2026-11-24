import axios from "axios";
import { create } from "zustand";

import {
  clearAccessToken,
  clearRefreshToken,
  getAccessToken,
} from "@/services/storage/token-storage";
import { clearUser, getUser, saveUser } from "@/services/storage/user-storage";

import { AuthService } from "@/features/auth/services/auth.service";
import { getStudentProfile } from "@/features/student/services/student.service";

import type {
  AuthSessionResponse,
  AuthUserSnapshot,
  StaffLoginRequest,
  StudentLoginRequest,
} from "@/features/auth/types/auth.types";
import type { StudentProfile } from "@/features/student/types/student.types";
import { registerSessionExpiredHandler } from "@/services/api/api-client";

export type AuthStatus =
  "idle" | "checking" | "authenticated" | "unauthenticated" | "unavailable";

interface AuthState {
  status: AuthStatus;
  user: AuthUserSnapshot | null;
  studentProfile: StudentProfile | null;
  error: string | null;

  restoreSession: () => Promise<void>;
  fetchStudentProfile: () => Promise<void>;
  loginStudent: (credentials: StudentLoginRequest) => Promise<void>;
  loginStaff: (credentials: StaffLoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const DEFAULT_ERROR = "Something went wrong. Please try again.";

const SIGNED_OUT = {
  status: "unauthenticated",
  user: null,
  studentProfile: null,
} as const;

// ---------- Helpers ----------

function getHttpStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message ?? DEFAULT_ERROR;
  }
  return error instanceof Error ? error.message : DEFAULT_ERROR;
}

function toUser(session: AuthSessionResponse): AuthUserSnapshot {
  return {
    userId: session.userId,
    fullName: session.fullName,
    role: session.role,
    collegeId: session.collegeId,
  };
}

function toStudentUser(profile: StudentProfile): AuthUserSnapshot {
  return {
    userId: profile.userId,
    fullName: profile.fullName,
    role: "STUDENT",
    collegeId: profile.college?.id ?? null,
    studentId: profile.studentId,
  };
}

async function clearSession() {
  await Promise.all([clearAccessToken(), clearRefreshToken(), clearUser()]);
}

// Fetches the student profile and keeps the saved user in sync with it.
async function loadStudent() {
  const profile = await getStudentProfile();
  const user = toStudentUser(profile);
  await saveUser(user);
  return { profile, user };
}

// ---------- Store ----------

export const useAuthStore = create<AuthState>((set, get) => {
  // Clears local data and moves the app to the signed-out state.
  const signOutLocally = async (error: string | null = null) => {
    await clearSession();
    set({ ...SIGNED_OUT, error });
  };

  registerSessionExpiredHandler(() => {
    useAuthStore.setState({
      status: "unauthenticated",
      user: null,
      studentProfile: null,
      error: "Your session has expired. Please sign in again.",
    });
  });

  return {
    status: "idle",
    user: null,
    studentProfile: null,
    error: null,

    // Restore the saved session when the app starts.
    restoreSession: async () => {
      set({ status: "checking", error: null });

      try {
        if (!(await getAccessToken())) {
          set(SIGNED_OUT);
          return;
        }

        const savedUser = await getUser();

        // Students are verified through the protected profile endpoint.
        if (savedUser?.role === "STUDENT") {
          const { profile, user } = await loadStudent();
          set({
            status: "authenticated",
            user,
            studentProfile: profile,
            error: null,
          });
          return;
        }

        // Staff/admin sessions are verified through the current-user endpoint.
        const currentUser = await AuthService.getCurrentUser();
        const user: AuthUserSnapshot = {
          ...currentUser,
          fullName: currentUser.fullName ?? savedUser?.fullName,
        };

        await saveUser(user);
        set({
          status: "authenticated",
          user,
          studentProfile: null,
          error: null,
        });
      } catch (error: unknown) {
        // The API client may already have signed out the user
        // after detecting an invalid refresh token.
        if (get().status === "unauthenticated") {
          return;
        }

        if (getHttpStatus(error) === 401) {
          await signOutLocally();
          return;
        }

        // Network errors should preserve the session.
        set({
          status: "unavailable",
          error: "Unable to connect to the server. Please try again.",
        });
      }
    },

    // Fetch the latest student profile.
    fetchStudentProfile: async () => {
      try {
        const { profile, user } = await loadStudent();
        set({ user, studentProfile: profile, error: null });
      } catch (error: unknown) {
        if (get().status !== "unauthenticated") {
          if (getHttpStatus(error) === 401) {
            await signOutLocally();
          } else {
            set({ error: getErrorMessage(error) });
          }
        }

        throw error;
      }
    },

    loginStudent: async (credentials) => {
      set({ error: null });

      try {
        // AuthService saves the access token before returning.
        const session = await AuthService.loginStudent(credentials);

        // Save the role early so the session can be restored if the profile fails to load.
        await saveUser({
          ...toUser(session),
          studentId: credentials.studentId.trim(),
        });

        const { profile, user } = await loadStudent();
        set({
          status: "authenticated",
          user,
          studentProfile: profile,
          error: null,
        });
      } catch (error: unknown) {
        // Login worked but the profile failed: keep the session.
        if (getHttpStatus(error) !== 401 && (await getAccessToken())) {
          set({
            status: "unavailable",
            error:
              "Your login was successful, but your profile could not be loaded. Please try again.",
          });
        } else {
          set({ ...SIGNED_OUT, error: getErrorMessage(error) });
        }
        throw error;
      }
    },

    loginStaff: async (credentials) => {
      set({ error: null });

      try {
        const session = await AuthService.loginStaff(credentials);
        const user = toUser(session);

        await saveUser(user);
        set({
          status: "authenticated",
          user,
          studentProfile: null,
          error: null,
        });
      } catch (error: unknown) {
        set({ ...SIGNED_OUT, error: getErrorMessage(error) });
        throw error;
      }
    },

    logout: async () => {
      try {
        await AuthService.logout();
      } catch {
        // Local logout must still work if the backend is unavailable.
      } finally {
        await signOutLocally();
      }
    },

    clearError: () => set({ error: null }),
  };
});
