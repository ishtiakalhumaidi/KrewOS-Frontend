import { httpClient } from "@/lib/axios/httpClient";

export const MaterialRequestService = {
  // Matches: GET /project/:projectId
  getProjectMaterials: async (projectId: string) => {
    return await httpClient.get(`/material-requests/project/${projectId}`);
  },
  getMyRequests: async (projectId?: string) => {
    const url = projectId
      ? `/material-requests/my-requests?projectId=${projectId}`
      : "/material-requests/my-requests";
    return await httpClient.get(url);
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

  updateMaterialStatus: async ({
    requestId,
    data,
  }: {
    requestId: string;
    data: FormData;
  }) => {
    return await httpClient.patch(
      `/material-requests/${requestId}/status`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  },
};
