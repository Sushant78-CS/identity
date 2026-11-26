import { api } from "../../services/api";

import type {
  CreateStaffRequest,
  PageResponse,
  StaffQueryParams,
  StaffResponse,
  UpdateStaffRequest,
  UpdateStaffStatusRequest,
} from "./staff.types";

export const staffService = {
  async getAllStaff(
    params: StaffQueryParams,
  ): Promise<PageResponse<StaffResponse>> {
    const response = await api.get<PageResponse<StaffResponse>>(
      "/api/college-admin/staff",
      { params },
    );

    return response.data;
  },

  async getStaffById(staffId: number): Promise<StaffResponse> {
    const response = await api.get<StaffResponse>(
      `/api/college-admin/staff/${staffId}`,
    );

    return response.data;
  },

  async createStaff(request: CreateStaffRequest): Promise<StaffResponse> {
    const response = await api.post<StaffResponse>(
      "/api/college-admin/staff",
      request,
    );

    return response.data;
  },

  async updateStaff(
    staffId: number,
    request: UpdateStaffRequest,
  ): Promise<StaffResponse> {
    const response = await api.put<StaffResponse>(
      `/api/college-admin/staff/${staffId}`,
      request,
    );

    return response.data;
  },

  async updateStaffStatus(
    staffId: number,
    request: UpdateStaffStatusRequest,
  ): Promise<StaffResponse> {
    const response = await api.patch<StaffResponse>(
      `/api/college-admin/staff/${staffId}/status`,
      request,
    );

    return response.data;
  },
};
