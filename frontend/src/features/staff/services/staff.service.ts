import { api } from "@/services/api/api-client";

import type { StaffProfileResponse } from "../types/staff.types";

export const StaffService = {
  async getProfile(): Promise<StaffProfileResponse> {
    const response = await api.get<StaffProfileResponse>("/api/staff/profile");

    return response.data;
  },
};
