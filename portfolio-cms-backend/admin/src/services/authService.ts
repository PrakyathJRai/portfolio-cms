
import api from "./api";

export interface Admin {
  id: string;
  name: string;
  email: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  admin: Admin;
}

interface LoginCredentials {
  email: string;
  password: string;
}

export const loginAdmin = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    credentials
  );

  return response.data;
};
