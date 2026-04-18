import { httpClient } from "@/lib/axios/httpClient";

export const AttendanceService = {
  // Clock the logged-in user into the project
  clockIn: async (data: { projectId: string; method?: string; gpsLocation?: string }) => {
    return await httpClient.post("/attendance/clock-in", data);
  },

  // Clock the logged-in user out
  clockOut: async (attendanceId: string) => {
   return await httpClient.patch(`/attendance/clock-out/${attendanceId}`, {});
  },
  getMyTodayAttendance: async (projectId: string) => {
    return await httpClient.get(`/attendance/project/${projectId}/my-today`);
  },

  // Fetch today's roster for the project
  getTodayAttendance: async (projectId: string) => {
    return await httpClient.get(`/attendance/project/${projectId}/today`);
  },
  getMyTimesheet: async (year: number, month: number) => {
    return await httpClient.get(`/attendance/my-timesheet?year=${year}&month=${month}`);
  }
};