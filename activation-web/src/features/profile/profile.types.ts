export interface CollegeAdminProfile {
  userId: number;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  status: string;
  createdAt: string;
  college: CollegeInfo | null;
}

export interface CollegeInfo {
  id: number;
  code: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  officialEmail: string;
  contactNumber: string;
  websiteUrl: string | null;
  status: string;
}
