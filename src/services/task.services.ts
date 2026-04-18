/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpClient } from "@/lib/axios/httpClient";
// import { TaskStatus, TaskPriority } from "@/types/enums.types";

export const TaskService = {
  // Fetch tasks for a specific project
  getProjectTasks: async (projectId: string) => {
    return await httpClient.get(`/tasks/project/${projectId}`);
  },
  getMyTasks: async () => {
    return await httpClient.get("/tasks/my-tasks");
  },
  // Create a new task
  createTask: async (data: {
    title: string;
    description?: string;
    projectId: string;
    assignedToId?: string;
    priority: string;
  }) => {
    return await httpClient.post("/tasks", data);
  },

  // Update a task (like dragging it to a new status)
  updateTask: async ({ taskId, data }: { taskId: string; data: any }) => {
    return await httpClient.patch(`/tasks/${taskId}`, data);
  },

  // Delete a task
  deleteTask: async (taskId: string) => {
    return await httpClient.delete(`/tasks/${taskId}`);
  },
};
