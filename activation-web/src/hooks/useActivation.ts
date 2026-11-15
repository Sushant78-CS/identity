import { useState } from "react";
import { activateStudent } from "../services/api";

export function useActivation() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const activate = async (token: string, password: string) => {
    if (loading) return false;

    setLoading(true);
    setError("");

    try {
      await activateStudent({
        token,
        password,
      });

      setSuccess(true);

      return true;
    } catch (err: any) {
      let message = "Something went wrong. Please try again.";

      if (err) {
        if (err.status === 401 || err.status === 400) {
          message =
            "This activation link is invalid, expired, or has already been used. Please contact your college administrator for assistance.";
        } else if (err.status === 403) {
          message =
            "Activation is currently not permitted. Please contact your college administrator.";
        } else if (err.status >= 500) {
          message =
            "Our servers are temporarily unavailable. Please try again later.";
        } else {
          message = err.message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);

      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError("");

  return {
    loading,
    success,
    error,
    activate,
    clearError,
  };
}
