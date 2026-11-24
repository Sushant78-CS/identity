export interface StudentProfile {
  userId: number;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  accountStatus: string;
  studentId: string;
  admissionYear: number | null;

  college: {
    id: number;
    code: string;
    name: string;
  } | null;

  enrollment: {
    academicYear: number;
    semester: number;
    department: string;
    course: string;
    status: string;
  } | null;
}
