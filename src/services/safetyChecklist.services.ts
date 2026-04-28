/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpClient } from "@/lib/axios/httpClient";

export const SafetyChecklistService = {
  getCompanyChecklists: async (params?: Record<string, any>) => {
    return await httpClient.get("/safety-checklists", { params }); 
  },

  getProjectChecklists: async (projectId: string) => {
    return await httpClient.get(`/safety-checklists/project/${projectId}`);
  },

  createChecklist: async (data: {
    projectId: string;
    checkDate: string;
    checklistData: Record<string, boolean>;
    allClear: boolean;
    notes?: string;
  }) => {
    return await httpClient.post("/safety-checklists", data);
  },
};