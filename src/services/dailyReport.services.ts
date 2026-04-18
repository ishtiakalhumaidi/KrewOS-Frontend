/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpClient } from "@/lib/axios/httpClient";

export const DailyReportService = {
  // Fetch reports for a specific project
  getProjectReports: async (projectId: string) => {
    return await httpClient.get(`/daily-reports/project/${projectId}`);
  },

  // Submit a new daily report
  createReport: async (data: { 
    projectId: string; 
    reportDate: string; 
    summary: string; 
    workersPresent: number;
    weatherCondition: string;
  }) => {
    return await httpClient.post("/daily-reports", data);
  },

createDailyReport: async (data: FormData) => {
    return await httpClient.post("/daily-reports", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
};