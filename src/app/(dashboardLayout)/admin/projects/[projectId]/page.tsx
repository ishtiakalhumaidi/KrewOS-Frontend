/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjectService } from "@/services/project.services";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Calendar,
  Settings2,
  CheckCircle2,
  Edit3,
} from "lucide-react";
import TeamTab from "./_components/TeamTab";
import TasksTab from "./_components/TasksTab";
import MaterialsTab from "./_components/MaterialsTab";
import IncidentsTab from "./_components/IncidentsTab";
import DailyReportsTab from "./_components/DailyReportsTab";
import AttendanceTab from "./_components/AttendanceTab";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Helper to format ISO dates to YYYY-MM-DD for HTML date inputs
const formatDateForInput = (dateString?: string) => {
  if (!dateString) return "";
  return new Date(dateString).toISOString().split("T")[0];
};

export default function SingleProjectPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const projectId = params.projectId as string;

  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  // Form state for the Edit Panel
  const [editForm, setEditForm] = useState({
    name: "",
    location: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "",
  });

  // 1. Fetch the single project
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => ProjectService.getProjectById(projectId),
    enabled: !!projectId,
  });

  const project = response;

  const updateProjectMutation = useMutation({
    mutationFn: (updateData: any) =>
      ProjectService.updateProject(projectId, updateData),
    onSuccess: (data, variables) => {
      // If only status was updated, show a specific message, otherwise general success
      if (Object.keys(variables).length === 1 && variables.status) {
        toast.success(
          `Project marked as ${variables.status.replace("_", " ")}`,
        );
      } else {
        toast.success("Project details updated successfully!");
        setIsEditSheetOpen(false); // Close the sheet automatically
      }
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update project");
    },
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProjectMutation.mutate(editForm);
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold text-destructive">
          Project not found
        </h2>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/admin/projects")}
        >
          Go Back
        </Button>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "COMPLETED":
        return "outline";
      case "ON_HOLD":
        return "destructive";
      case "PLANNING":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild className="mt-1">
            <Link href="/admin/projects">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {project.name}
              </h1>
              <Badge variant={getStatusBadgeVariant(project.status)}>
                {project.status.replace("_", " ")}
              </Badge>
            </div>
            <div className="flex items-center text-muted-foreground mt-2 space-x-4 text-sm">
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" /> {project.location}
              </span>
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" /> Created:{" "}
                {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons Container */}
        <div className="flex items-center space-x-3">
          {/* 👉 NEW: Edit Project Details Sheet */}
          <Sheet
            open={isEditSheetOpen}
            onOpenChange={(isOpen) => {
              setIsEditSheetOpen(isOpen);

              if (isOpen && project) {
                setEditForm({
                  name: project.name || "",
                  location: project.location || "",
                  description: project.description || "",
                  startDate: formatDateForInput(project.startDate),
                  endDate: formatDateForInput(project.endDate),
                  status: project.status || "PLANNING",
                });
              }
            }}
          >
            <SheetTrigger asChild>
              <Button variant="outline">
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
              <SheetHeader className="mb-6">
                <SheetTitle>Edit Project</SheetTitle>
              </SheetHeader>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={editForm.location}
                    onChange={(e) =>
                      setEditForm({ ...editForm, location: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Project Status</Label>
                  <select
                    id="status"
                    className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:focus-visible:ring-zinc-300"
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={editForm.startDate}
                      onChange={(e) =>
                        setEditForm({ ...editForm, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Target End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={editForm.endDate}
                      onChange={(e) =>
                        setEditForm({ ...editForm, endDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Scope of Work</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                  />
                </div>

                <div className="pt-6">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={updateProjectMutation.isPending}
                  >
                    {updateProjectMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Save Changes
                  </Button>
                </div>
              </form>
            </SheetContent>
          </Sheet>

          {/* Existing Quick Status Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                disabled={updateProjectMutation.isPending}
              >
                {updateProjectMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Settings2 className="h-4 w-4 mr-2" />
                )}
                Manage Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Change Project Phase</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  updateProjectMutation.mutate({ status: "PLANNING" })
                }
                disabled={project.status === "PLANNING"}
              >
                Set to Planning
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  updateProjectMutation.mutate({ status: "ACTIVE" })
                }
                disabled={project.status === "ACTIVE"}
              >
                Set to Active
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  updateProjectMutation.mutate({ status: "ON_HOLD" })
                }
                disabled={project.status === "ON_HOLD"}
                className="text-amber-600 focus:text-amber-600"
              >
                Put On Hold
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  updateProjectMutation.mutate({ status: "COMPLETED" })
                }
                disabled={project.status === "COMPLETED"}
                className="text-green-600 focus:text-green-600 font-medium"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" /> Mark as Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs Navigation (Remains Exactly the Same) */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-7 lg:w-[700px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="incidents">Safety</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="attendance">Time</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Project Scope & Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {project.description ||
                  "No description provided for this project."}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                  <p className="text-sm font-medium text-zinc-500">
                    Start Date
                  </p>
                  <p className="font-semibold mt-1">
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString()
                      : "TBD"}
                  </p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                  <p className="text-sm font-medium text-zinc-500">
                    Target End Date
                  </p>
                  <p className="font-semibold mt-1">
                    {project.endDate
                      ? new Date(project.endDate).toLocaleDateString()
                      : "TBD"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tasks" className="mt-6">
          <TasksTab projectId={projectId} />
        </TabsContent>
        <TabsContent value="team" className="mt-6">
          <TeamTab projectId={projectId} />
        </TabsContent>
        <TabsContent value="materials" className="mt-6">
          <MaterialsTab projectId={projectId} />
        </TabsContent>
        <TabsContent value="incidents" className="mt-6">
          <IncidentsTab projectId={projectId} />
        </TabsContent>
        <TabsContent value="reports" className="mt-6">
          <DailyReportsTab projectId={projectId} />
        </TabsContent>
        <TabsContent value="attendance" className="mt-6">
          <AttendanceTab projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
