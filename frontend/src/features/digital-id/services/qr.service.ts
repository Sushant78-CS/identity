import { isAxiosError } from "axios";

import { api } from "@/services/api/api-client";

export interface GenerateStudentQrResponse {
  qrValue: string;
  issuedAt: string;
  expiresAt: string;
  expiresInSeconds: number;
}

export interface VerifyStudentQrResponse {
  valid: boolean;
  message: string;
  verifiedAt: string;
  student: {
    studentId: string;
    fullName: string;
    profileImageUrl: string | null;
    collegeName: string;
    department: string;
    course: string;
  };
}

interface ApiErrorResponse {
  message?: string;
}

export const DigitalIdQrService = {
  async generateStudentQr(): Promise<GenerateStudentQrResponse> {
    const { data } = await api.post<GenerateStudentQrResponse>(
      "/api/student/qr/generate",
    );

    if (
      !data?.qrValue ||
      !data.expiresAt ||
      !Number.isFinite(data.expiresInSeconds) ||
      data.expiresInSeconds <= 0
    ) {
      throw new Error("Invalid QR response received from the server.");
    }

    return data;
  },

  async verifyStudentQr(qrToken: string): Promise<VerifyStudentQrResponse> {
    const token = qrToken.trim();

    if (!token) {
      throw new Error("No QR code was detected.");
    }

    const { data } = await api.post<VerifyStudentQrResponse>(
      "/api/staff/qr/verify",
      {
        qrToken: token,
      },
    );

    return data;
  },
};

export function getQrErrorMessage(error: unknown): string {
  if (isAxiosError<ApiErrorResponse>(error)) {
    const status = error.response?.status;
    const serverMessage = error.response?.data?.message;

    if (typeof serverMessage === "string" && serverMessage.trim()) {
      return serverMessage;
    }

    switch (status) {
      case 400:
        return "Invalid QR request. Please try again.";

      case 401:
        return "Your session has expired. Please sign in again.";

      case 403:
        return "You don't have permission to perform this action.";

      case 404:
        return "This QR code could not be found.";

      case 409:
        return "This QR code has already been used.";

      case 410:
        return "This QR code has expired. Generate a new one.";

      default:
        return "Unable to communicate with the verification server.";
    }
  }

  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}
