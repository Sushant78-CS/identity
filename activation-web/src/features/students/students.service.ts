import { api } from "../../services/api";

import type {
  StudentDetailsResponse,
  StudentListResponse,
  StudentPageResponse,
  StudentQueryParams,
} from "./students.types";

export const studentsService = {
  async getAllStudents(
    params: StudentQueryParams,
  ): Promise<StudentPageResponse> {
    const response = await api.get<StudentPageResponse>(
      "/api/college-admin/students",
      {
        params: {
          page: params.page,
          size: params.size,
          ...(params.search ? { search: params.search } : {}),
          ...(params.status ? { status: params.status } : {}),
        },
      },
    );

    return response.data;
  },

  async getStudentById(studentId: number): Promise<StudentDetailsResponse> {
    const response = await api.get<StudentDetailsResponse>(
      `/api/college-admin/students/${studentId}`,
    );

    return response.data;
  },
};
