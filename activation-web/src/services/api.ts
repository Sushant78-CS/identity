import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not configured");
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

export interface ActivateStudentRequest {
  token: string;
  password: string;
}

export interface ActivationResponse {
  message: string;
}

export const activateStudent = async (
  request: ActivateStudentRequest,
): Promise<ActivationResponse> => {
  const response = await api.post<ActivationResponse>(
    "/api/auth/student/activate",
    request,
  );

  return response.data;
};
