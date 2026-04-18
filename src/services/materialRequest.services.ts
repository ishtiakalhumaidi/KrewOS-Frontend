import { httpClient } from "@/lib/axios/httpClient";

export const MaterialRequestService = {
  // Matches: GET /project/:projectId
  getProjectMaterials: async (projectId: string) => {
    return await httpClient.get(`/material-requests/project/${projectId}`);
  },

  // Matches: POST /
  createMaterialRequest: async (data: { 
    projectId: string; 
    itemName: string; 
    quantity: number; 
    unit: string;
    notes?: string;
  }) => {
    return await httpClient.post("/material-requests", data);
  },

  // Matches: PATCH /:requestId/status
  // Zod requires projectId in the body for authorization check!
  updateMaterialStatus: async ({ requestId, projectId, status }: { requestId: string; projectId: string; status: string }) => {
    return await httpClient.patch(`/material-requests/${requestId}/status`, { 
      projectId, 
      status 
    });
  }
};