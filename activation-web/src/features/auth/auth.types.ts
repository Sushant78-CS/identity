export type AdminRole = "COLLEGE_ADMIN" | "STAFF" | "SUPER_ADMIN";

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface WebAuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  fullName: string;
  role: AdminRole;
  collegeId: number | null;
}

export interface AdminUser {
  userId: number;
  fullName: string;
  role: AdminRole;
  collegeId: number | null;
}

export interface AuthenticatedUser {
  userId: number;
  role: AdminRole;
  collegeId: number | null;
}
