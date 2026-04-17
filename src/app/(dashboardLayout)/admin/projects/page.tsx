"use client";

import { useQuery } from "@tanstack/react-query";
import { ProjectService } from "@/services/project.services";
import { getUserInfo } from "@/lib/authUtils"; // 👉 Import this
import { Button } from "@/components/ui/button";
import { Plus, Loader2, HardHat } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProjectsManagementPage() {
  const userInfo = getUserInfo();

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["projects", userInfo?.companyId],
    queryFn: ProjectService.getCompanyProjects,
    enabled: !!userInfo?.companyId, 
  });

  const projects = response?.data || [];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage all your company construction projects and sites.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create New Project
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex h-40 items-center justify-center border rounded-xl bg-white dark:bg-zinc-900">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
          Failed to load projects. Please check your connection.
        </div>
      )}

      {/* Empty State OR Projects List */}
      {!isLoading && !isError && (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="h-12 w-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                  <HardHat className="h-6 w-6 text-zinc-400" />
                </div>
                <h3 className="font-semibold text-lg">No projects found</h3>
                <p className="text-muted-foreground text-sm max-w-sm mt-1 mb-4">
                  You haven't created any construction projects yet. Click the button above to get started.
                </p>
                <Button variant="outline">Create New Project</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-6 py-3 font-medium">Project Name</th>
                      <th className="px-6 py-3 font-medium">Location</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Start Date</th>
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {projects.map((project: any) => (
                      <tr key={project.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                          {project.name}
                        </td>
                        <td className="px-6 py-4 text-zinc-500">{project.location}</td>
                        <td className="px-6 py-4">
                          <Badge variant={project.status === "ACTIVE" ? "default" : "secondary"}>
                            {project.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-zinc-500">
                          {project.startDate ? new Date(project.startDate).toLocaleDateString() : "Not set"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm">View Details</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}