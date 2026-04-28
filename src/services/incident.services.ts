/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpClient } from "@/lib/axios/httpClient";

export const IncidentService = {
  // 👉 NEW: Global fetch with query parameters for filtering/pagination
  getCompanyIncidents: async (params?: Record<string, any>) => {
    return await httpClient.get("/incidents", { params });
  },

  getProjectIncidents: async (projectId: string) => {
    return await httpClient.get(`/incidents/project/${projectId}`);
  },

  reportIncident: async (data: FormData) => {
    return await httpClient.post("/incidents", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getMyIncidents: async () => {
    return await httpClient.get("/incidents/my-reports");
  },

  resolveIncident: async (incidentId: string, data: FormData) => {
    return await httpClient.patch(`/incidents/${incidentId}/resolve`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteIncident: async (incidentId: string) => {
    return await httpClient.delete(`/incidents/${incidentId}`);
  },
};