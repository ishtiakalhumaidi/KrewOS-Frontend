import { httpClient } from "@/lib/axios/httpClient";

export const MaterialRequestService = {
  // Matches: GET /project/:projectId
  getProjectMaterials: async (projectId: string) => {
    return await httpClient.get(`/material-requests/project/${projectId}`);
  },
getMyRequests: async () => {
    return await httpClient.get("/material-requests/my-requests");
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

  updateMaterialStatus: async ({ requestId, data }: { requestId: string; data: FormData }) => {
    return await httpClient.patch(`/material-requests/${requestId}/status`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
};