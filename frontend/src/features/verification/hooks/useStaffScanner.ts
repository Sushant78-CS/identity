import axios from "axios";
import { useCallback, useRef, useState } from "react";

import { VerificationService } from "../services/verification.service";
import type { StudentVerificationResponse } from "../types/verification.types";

type ScannerStatus =
  "scanning" | "processing" | "success" | "invalid" | "error";

export function useStaffScanner() {
  const [status, setStatus] = useState<ScannerStatus>("scanning");

  const [result, setResult] = useState<StudentVerificationResponse | null>(
    null,
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const scanLocked = useRef(false);

  const handleQrScanned = useCallback(async (qrToken: string) => {
    const token = qrToken.trim();

    if (!token || scanLocked.current) return;

    scanLocked.current = true;
    setStatus("processing");
    setErrorMessage(null);

    try {
      const response = await VerificationService.verifyQr({
        qrToken: token,
      });

      setResult(response);
      setStatus(response.valid ? "success" : "invalid");
    } catch (error: unknown) {
      let message = "Unable to verify this QR code. Please try again.";

      if (axios.isAxiosError(error)) {
        if (!error.response) {
          message = "Network error. Check your internet connection.";
        } else if (error.response.status === 403) {
          message = "You don't have permission to verify this student.";
        } else if (error.response.status >= 500) {
          message = "Server error. Please try again later.";
        }
      }

      setErrorMessage(message);
      setStatus("error");
    }
  }, []);

  const scanAgain = useCallback(() => {
    scanLocked.current = false;
    setResult(null);
    setErrorMessage(null);
    setStatus("scanning");
  }, []);

  return {
    status,
    result,
    errorMessage,
    isProcessing: status === "processing",
    isScanning: status === "scanning",
    handleQrScanned,
    scanAgain,
  };
}
