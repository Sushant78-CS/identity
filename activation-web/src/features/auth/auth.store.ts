import { create } from "zustand";
import axios from "axios";

import { authService } from "./auth.service";
import { authStorage } from "./auth.storage";

import type { AdminLoginRequest, AdminUser } from "./auth.types";

type AuthStatus =
  | "idle"
  | "checking"
  | "authenticated"
  | "unauthenticated"
  | "unavailable";

interface AuthState {
  status: AuthStatus;
  user: AdminUser | null;
  error: string | null;

  login: (request: AdminLoginRequest) => Promise<void>;
  restoreSession: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ?? error.message ?? "Something went wrong."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

export const useAuthStore = create<AuthState>((set) => ({
  status: "idle",
  user: null,
  error: null,

  login: async (request) => {
    set({ error: null });

    try {
      const response = await authService.login(request);

      set({
        status: "authenticated",
        user: {
          userId: response.userId,
          fullName: response.fullName,
          role: response.role,
          collegeId: response.collegeId,
        },
        error: null,
      });
    } catch (error) {
      authStorage.clear();

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (status === 401) {
          set({
            status: "unauthenticated",
            user: null,
            error: null,
          });

          return;
        }

        // Network errors, server errors and CORS failures
        // should not be treated as an expired login.
        set({
          status: "unavailable",
          user: null,
          error: getErrorMessage(error),
        });

        return;
      }

      set({
        status: "unavailable",
        user: null,
        error: getErrorMessage(error),
      });
    }
  },

  restoreSession: async () => {
    set({
      status: "checking",
      error: null,
    });

    try {
      // The refresh cookie is sent automatically by the browser.
      const response = await authService.refresh();

      // Verify the newly issued access token.
      const currentUser = await authService.getCurrentUser();

      set({
        status: "authenticated",
        user: {
          userId: currentUser.userId,
          fullName: response.fullName,
          role: response.role,
          collegeId: currentUser.collegeId,
        },
        error: null,
      });
    } catch (error) {
      authStorage.clear();

      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.status !== 401
      ) {
        set({
          status: "unavailable",
          user: null,
          error: getErrorMessage(error),
        });

        return;
      }

      set({
        status: "unauthenticated",
        user: null,
        error: null,
      });
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      set({
        status: "unauthenticated",
        user: null,
        error: null,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
if (typeof window !== "undefined") {
  window.addEventListener("identity:session-expired", () => {
    authStorage.clear();

    useAuthStore.setState({
      status: "unauthenticated",
      user: null,
      error: "Your session has expired. Please sign in again.",
    });
  });
}
