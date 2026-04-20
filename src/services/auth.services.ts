/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpClient } from "@/lib/axios/httpClient";
import { LoginFormData } from "@/zod/auth.validation";

export const AuthService = {
  // 🔐 Standard Login
  login: async (data: LoginFormData) => {
    // Returns { user, accessToken, refreshToken, token } from backend controller
    return await httpClient.post("/auth/login", data);
  },

  // 🚪 Logout (Clears server-side session)
  logout: async () => {
    return await httpClient.post("/auth/logout", {});
  },

  resendVerificationCode: async (email: string) => {
    return await httpClient.post("/auth/resend-verification", { email });
  },
  // 👉 1. New Company Registration
  registerCompany: async (data: {
    companyName: string;
    name: string;
    email: string;
    password: string;
  }) => {
    return await httpClient.post("/auth/register", data);
  },

  // 👉 2. Verify the 6-digit OTP
  verifyEmail: async (data: { email: string; otp: string }) => {
    return await httpClient.post("/auth/verify-email", data);
  },

  sendInvite: async (data: { email: string; role: string }) => {
    return await httpClient.post("/auth/invite", data);
  },

  acceptInvite: async (data: any) => {
    return await httpClient.post("/auth/accept-invite", data);
  },

  // 🔑 Password Management
  changePassword: async (data: any) => {
    return await httpClient.post("/auth/change-password", data);
  },

  forgotPassword: async (email: string) => {
    return await httpClient.post("/auth/forget-password", { email });
  },

  resetPassword: async (data: any) => {
    return await httpClient.post("/auth/reset-password", data);
  },

  // 🔄 Token Refresh (Handled automatically by axios interceptor, but here if needed)
  refreshToken: async () => {
    return await httpClient.post("/auth/refresh-token", {});
  },
};
