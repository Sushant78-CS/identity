import { create } from "zustand";

import { StaffService } from "../services/staff.service";
import type { StaffProfileResponse } from "../types/staff.types";

interface StaffState {
  profile: StaffProfileResponse | null;
  isLoading: boolean;
  error: string | null;
  hasFetched: boolean;

  fetchProfile: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearProfile: () => void;
}

export const useStaffStore = create<StaffState>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,
  hasFetched: false,

  fetchProfile: async () => {
    const state = get();

    if (state.hasFetched || state.isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const profile = await StaffService.getProfile();

      set({
        profile,
        isLoading: false,
        hasFetched: true,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load staff profile.",
      });
    }
  },

  refreshProfile: async () => {
    if (get().isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const profile = await StaffService.getProfile();

      set({
        profile,
        isLoading: false,
        hasFetched: true,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to refresh staff profile.",
      });
    }
  },

  clearProfile: () => {
    set({
      profile: null,
      isLoading: false,
      error: null,
      hasFetched: false,
    });
  },
}));
