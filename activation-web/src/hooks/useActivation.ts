import { useState } from "react";
import axios from "axios";
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
    } catch (err: unknown) {
      let message = "Something went wrong. Please try again.";

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 400 || status === 401) {
          message =
            "This activation link is invalid, expired, or has already been used. Please contact your college administrator for assistance.";
        } else if (status === 403) {
          message =
            "Activation is currently not permitted. Please contact your college administrator.";
        } else if (status && status >= 500) {
          message =
            "Our servers are temporarily unavailable. Please try again later.";
        } else if (!err.response) {
          message =
            "Unable to connect to the server. Please check your internet connection.";
        } else {
          message = err.response.data?.message ?? err.message ?? message;
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
