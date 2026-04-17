import { httpClient } from "@/lib/axios/httpClient";
import { LoginFormData } from "@/zod/auth.validation";

export const AuthService = {
  login: async (data: LoginFormData) => {
    // Matches your backend route: /api/v1/auth/login
    const response = await httpClient.post("/auth/login", data);
    return response.data;
  },
};