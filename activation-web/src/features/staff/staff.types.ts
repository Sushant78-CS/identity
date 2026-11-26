export interface CreateStaffRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  initialPassword: string;
}

export interface StaffResponse {
  id: number;
  collegeId: number;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  status: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface StaffQueryParams {
  page: number;
  size: number;
  search?: string;
  status?: string;
}

export interface CreateStaffRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  initialPassword: string;
}

export interface UpdateStaffRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
}

export type AccountStatus = "ACTIVE" | "SUSPENDED" | "INACTIVE";

export interface UpdateStaffStatusRequest {
  status: AccountStatus;
}

// export interface StaffResponse {
//   id: number;
//   collegeId: number;
//   fullName: string;
//   email: string;
//   phoneNumber: string | null;
//   role: string;
//   status: string;
//   createdAt: string;
// }

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface StaffQueryParams {
  page: number;
  size: number;
  search?: string;
  status?: string;
}
