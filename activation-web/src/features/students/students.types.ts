export interface StudentListResponse {
  id: number;
  studentId: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  admissionYear: number | null;
  accountStatus: string;
  profileImageUrl: string | null;
  departmentName: string | null;
  courseName: string | null;
  academicYear: number | null;
  semester: number | null;
  createdAt: string;
}

export interface CurrentEnrollment {
  enrollmentId: number;
  departmentName: string | null;
  courseName: string | null;
  academicYear: number | null;
  semester: number | null;
  admissionYear: number | null;
  status: string | null;
  startDate: string | null;
  endDate: string | null;
}

export interface StudentDetailsResponse {
  id: number;
  studentId: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  accountStatus: string;
  admissionYear: number | null;
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
  currentEnrollment: CurrentEnrollment | null;
}

export interface StudentPageResponse {
  content: StudentListResponse[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface StudentQueryParams {
  page: number;
  size: number;
  search?: string;
  status?: string;
}
