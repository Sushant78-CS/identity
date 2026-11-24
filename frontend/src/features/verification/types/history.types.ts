export interface VerificationHistorySummary {
  totalVerifications: number;
  todayVerifications: number;
  today: string;
}

export interface VerificationRecord {
  id: number;
  studentId: string;
  studentName: string;
  verifiedAt: string;
}

export interface DailyVerificationHistory {
  date: string;
  totalVerifications: number;
  verifications: VerificationRecord[];
}
