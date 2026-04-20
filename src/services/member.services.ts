/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpClient } from "@/lib/axios/httpClient";

export const MemberService = {
  getCompanyMembers: async () => {
    return await httpClient.get("/companies/company-roster");
  },

  updateUserRole: async (userId: string, role: string) => {
    return await httpClient.patch(`/users/${userId}/role`, { role });
  },

  deactivateUser: async (userId: string) => {
    return await httpClient.patch(`/users/${userId}/status`, { status: "INACTIVE" });
  },

  getMyProfile: async () => {
    return await httpClient.get("/users/me");
  },

  updateProfile: async (data: any) => {
    return await httpClient.patch("/users/update-profile", data);
  },

  updateAvatar: async (data: FormData) => {
    return await httpClient.patch("/users/update-avatar", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getCompanySettings: async () => {
    return await httpClient.get("/companies/settings");
  },

  updateCompany: async (data: FormData) => {
    return await httpClient.patch("/companies/update", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
};