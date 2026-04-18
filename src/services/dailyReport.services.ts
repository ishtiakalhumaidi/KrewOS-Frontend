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

  // Update a report (e.g., editing the summary)
  updateReport: async ({ reportId, data }: { reportId: string; data: any }) => {
    return await httpClient.patch(`/daily-reports/${reportId}`, data);
  }
};