import { api } from "@/services/api/api-client";

import type {
  StudentVerificationResponse,
  VerifyQrRequest,
} from "../types/verification.types";

const STAFF_QR_ENDPOINT = "/api/staff/qr/verify";

export const VerificationService = {
  async verifyQr(
    request: VerifyQrRequest,
  ): Promise<StudentVerificationResponse> {
    const response = await api.post<StudentVerificationResponse>(
      STAFF_QR_ENDPOINT,
      request,
    );

    return response.data;
  },
};
