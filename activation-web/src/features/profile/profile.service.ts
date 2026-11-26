import { api } from "../../services/api";
import type { CollegeAdminProfile } from "./profile.types";

export const profileService = {
  async getProfile(): Promise<CollegeAdminProfile> {
    const response = await api.get<CollegeAdminProfile>(
      "/api/college-admin/profile",
    );

    return response.data;
  },
};
