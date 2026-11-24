export interface VerifyQrRequest {
  qrToken: string;
}

export interface VerifiedStudentInfo {
  studentId: string;
  fullName: string;
  profileImageUrl?: string | null;
  collegeName: string;
  department: string;
  course: string;
}

export interface StudentVerificationResponse {
  valid: boolean;
  message: string;
  verifiedAt: string | null;
  student?: VerifiedStudentInfo | null;
}
