export type ApiId = string | number;

export type AuthRole = "STUDENT" | "STAFF" | "COLLEGE_ADMIN" | "SUPER_ADMIN";

export interface StudentLoginRequest {
  collegeCode: string;
  studentId: string;
  password: string;
}

export interface StaffLoginRequest {
  email: string;
  password: string;
}

// export interface AuthSessionResponse {
//   accessToken: string;
//   tokenType: string;
//   expiresIn: number;
//   userId: ApiId;
//   fullName: string;
//   role: AuthRole;
//   collegeId: ApiId | null;
// }

export interface AuthSessionResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId: ApiId;
  fullName: string;
  role: AuthRole;
  collegeId: ApiId | null;
}

export interface CurrentUserResponse {
  userId: ApiId;
  role: AuthRole;
  collegeId: ApiId | null;
  fullName?: string;
}

export interface AuthUserSnapshot extends CurrentUserResponse {
  studentId?: string;
}
