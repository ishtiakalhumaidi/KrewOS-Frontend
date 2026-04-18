"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ProjectService } from "@/services/project.services";
import Link from "next/link";
import { ArrowLeft, Loader2, MapPin, Calendar, HardHat } from "lucide-react";
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

export default function SingleProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  // Fetch the single project using its ID
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
  console.log(project);

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

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/projects">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {project.name}
            </h1>
            <Badge
              variant={project.status === "ACTIVE" ? "default" : "secondary"}
            >
              {project.status}
            </Badge>
          </div>
          <div className="flex items-center text-muted-foreground mt-1 space-x-4 text-sm">
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

      {/* Tabs Navigation */}
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

        {/* 1. OVERVIEW TAB */}
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

        {/* 2. TASKS TAB (Placeholder for now) */}
        <TabsContent value="tasks" className="mt-6">
          <TasksTab projectId={projectId} />
        </TabsContent>

        {/* 3. TEAM TAB (Placeholder) */}
        <TabsContent value="team" className="mt-6">
          <TeamTab projectId={projectId} />
        </TabsContent>

        {/* 4. MATERIALS TAB (Placeholder) */}
        <TabsContent value="materials" className="mt-6">
          <MaterialsTab projectId={projectId} />
        </TabsContent>

        {/* 5. INCIDENTS TAB */}
        <TabsContent value="incidents" className="mt-6">
          <IncidentsTab projectId={projectId} />
        </TabsContent>

        {/* 6. REPORTS TAB */}
        <TabsContent value="reports" className="mt-6">
          <DailyReportsTab projectId={projectId} />
        </TabsContent>

        {/* 7. ATTENDANCE TAB */}
        <TabsContent value="attendance" className="mt-6">
          <AttendanceTab projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
