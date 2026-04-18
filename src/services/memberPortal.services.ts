import { httpClient } from "@/lib/axios/httpClient";

export const MemberPortalService = {
  // Fetch only projects where the user is a member
  getMyProjects: async () => {
    return await httpClient.get("/projects/my-assignments");
  },

  // Fetch only tasks assigned to the logged-in user
  getMyTasks: async () => {
    return await httpClient.get("/tasks/my-tasks");
  },
  getProjectDetails: async (projectId: string) => {
    return await httpClient.get(`/projects/${projectId}`);
  },

  // Fetch personal attendance history for the timesheet
  getMyAttendance: async (month: number, year: number) => {
    return await httpClient.get(`/attendance/stats/my-history?month=${month}&year=${year}`);
  }
};