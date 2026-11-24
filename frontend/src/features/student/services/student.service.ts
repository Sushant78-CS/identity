import type { StudentProfile } from "@/features/student/types/student.types";
import { api } from "@/services/api/api-client";

export async function getStudentProfile(): Promise<StudentProfile> {
  const response = await api.get<StudentProfile>("/api/student/profile");

  return response.data;
}
