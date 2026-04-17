

import { httpClient } from "@/lib/axios/httpClient";

export const DashboardService = {
  getStats: async () => {
    const response = await httpClient.get("/dashboard/stats");
    return response.data;
  },
};