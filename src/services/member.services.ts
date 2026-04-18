import { httpClient } from "@/lib/axios/httpClient";

export const MemberService = {
  // Fetch all employees in the company
  getCompanyMembers: async () => {
    return await httpClient.get("/companies/company-roster");
  },

  // Update a global user role (e.g., promote MEMBER to ADMIN)
  updateUserRole: async (userId: string, role: string) => {
    return await httpClient.patch(`/users/${userId}/role`, { role });
  },

  // Deactivate a user's access to the company
  deactivateUser: async (userId: string) => {
    return await httpClient.patch(`/users/${userId}/status`, { status: "INACTIVE" });
  }
};