/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpClient } from "@/lib/axios/httpClient";

export const ProjectService = {
  getCompanyProjects: async () => {


    const response = await httpClient.get("/projects"); 

    return response.data; 
  },
  createProject: async (data: any) => {
    const response = await httpClient.post("/projects", data);
    return response.data;
  },
  getProjectById: async (projectId: string) => {
    const response = await httpClient.get(`/projects/${projectId}`);
    return response.data;
  }
};