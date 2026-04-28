import type { ProjectStatus } from "./enums.types";

export type Project = {
  id: string;
  name: string;
  location: string;
  description?: string;
  status: ProjectStatus;
  _count?: {
    members?: number;
    tasks?: number;
  };
};