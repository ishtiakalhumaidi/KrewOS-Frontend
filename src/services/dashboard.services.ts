import { httpClient } from "@/lib/axios/httpClient";

export const DashboardService = {
  getStats: async () => {
    return await httpClient.get("/dashboard/stats");
  },
};
