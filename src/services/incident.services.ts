import { httpClient } from "@/lib/axios/httpClient";

export const IncidentService = {
  // Matches: GET /project/:projectId
  getProjectIncidents: async (projectId: string) => {
    return await httpClient.get(`/incidents/project/${projectId}`);
  },

  // Matches: POST /
 reportIncident: async (formData: FormData) => {
    return await httpClient.post("/incidents", formData);
  },

  // Matches: PATCH /:incidentId/resolve
  resolveIncident: async ({ incidentId, isResolved, resolutionNotes }: { incidentId: string; isResolved: boolean; resolutionNotes?: string }) => {
    return await httpClient.patch(`/incidents/${incidentId}/resolve`, { 
      isResolved,
      resolutionNotes
    });
  }
};