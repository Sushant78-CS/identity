import { api } from "@/services/api/api-client";

import type {
  DailyVerificationHistory,
  VerificationHistorySummary,
} from "../types/history.types";

export const HistoryService = {
  async getSummary(): Promise<VerificationHistorySummary> {
    const response = await api.get<VerificationHistorySummary>(
      "/api/staff/verification-history/summary",
    );

    return response.data;
  },

  async getDailyHistory(date: string): Promise<DailyVerificationHistory> {
    const response = await api.get<DailyVerificationHistory>(
      "/api/staff/verification-history/daily",
      {
        params: { date },
      },
    );

    return response.data;
  },
};
