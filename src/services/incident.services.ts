import { httpClient } from "@/lib/axios/httpClient";

export const IncidentService = {
  // Matches: GET /project/:projectId
  getProjectIncidents: async (projectId: string) => {
    return await httpClient.get(`/incidents/project/${projectId}`);
  },

  reportIncident: async (data: FormData) => {
    return await httpClient.post("/incidents", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getMyIncidents: async () => {
    return await httpClient.get("/incidents/my-reports");
  },

  resolveIncident: async (incidentId: string, data: FormData) => {
    return await httpClient.patch(`/incidents/${incidentId}/resolve`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
