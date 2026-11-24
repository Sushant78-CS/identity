export interface StaffProfileResponse {
  userId: number;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  status: string;
  college: {
    id: number;
    code: string;
    name: string;
  } | null;
  createdAt: string;
}
