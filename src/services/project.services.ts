import { httpClient } from "@/lib/axios/httpClient";
import { getUserInfo } from "@/lib/authUtils";

export const ProjectService = {
  getCompanyProjects: async () => {
    const userInfo = getUserInfo();
    
    if (!userInfo?.companyId) {
      throw new Error("No company associated with this user.");
    }

    // 👉 Option A: If your backend reads the token and filters automatically
    const response = await httpClient.get("/projects"); 
    
    // 👉 Option B: If your backend route is nested (uncomment if you use this instead)
    // const response = await httpClient.get(`/companies/${userInfo.companyId}/projects`);

    return response.data; 
  },
};