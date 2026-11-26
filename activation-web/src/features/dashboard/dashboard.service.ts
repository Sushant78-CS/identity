import { api } from "../../services/api";
import type { CollegeAdminDashboard } from "./dashboard.types";

export const dashboardService = {
  async getDashboard(): Promise<CollegeAdminDashboard> {
    const response = await api.get<CollegeAdminDashboard>(
      "/api/college-admin/dashboard",
    );

    return response.data;
  },
};
