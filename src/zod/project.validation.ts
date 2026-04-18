import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters."),
  location: z.string().min(3, "Location is required."),
  description: z.string().optional(),
  startDate: z.string().optional(), 
  endDate: z.string().optional(),
});

export type CreateProjectFormData = z.infer<typeof createProjectSchema>;