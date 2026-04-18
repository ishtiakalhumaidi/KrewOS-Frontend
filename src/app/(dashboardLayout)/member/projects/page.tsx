/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { MemberPortalService } from "@/services/memberPortal.services";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  MapPin,
  HardHat,
  Users,
  CheckSquare,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function MyProjectsPage() {
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["my-projects"],
    queryFn: MemberPortalService.getMyProjects,
  });

  const projects = response?.data || [];

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    toast.error(
      (error as any)?.response?.data?.message ||
        "Failed to load your assigned projects.",
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Active Sites</h1>
        <p className="text-muted-foreground mt-1">
          Select a construction site below to view tasks, report incidents, or
          clock in.
        </p>
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed shadow-none bg-zinc-50 dark:bg-zinc-900/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
              <HardHat className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">No Active Assignments</h2>
            <p className="text-muted-foreground max-w-md">
              You are not currently assigned to any construction projects.
              Please contact your Site Manager or Company Admin for site
              assignments.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <Card
              key={project.id}
              className="flex flex-col hover:shadow-md transition-shadow duration-200"
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge
                    variant={
                      project.status === "ACTIVE" ? "default" : "secondary"
                    }
                    className="mb-2"
                  >
                    {project.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-medium flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {project.location}
                  </span>
                </div>
                <CardTitle
                  className="text-xl line-clamp-1"
                  title={project.name}
                >
                  {project.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 min-h-[40px]">
                  {project.description || "No description provided."}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-4 border-t dark:border-zinc-800">
                  <div className="flex flex-col items-center justify-center p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded-md">
                    <span className="flex items-center text-xs text-muted-foreground mb-1">
                      <Users className="h-3 w-3 mr-1" /> Team
                    </span>
                    <span className="font-bold">
                      {project._count?.members || 0}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded-md">
                    <span className="flex items-center text-xs text-muted-foreground mb-1">
                      <CheckSquare className="h-3 w-3 mr-1" /> Tasks
                    </span>
                    <span className="font-bold">
                      {project._count?.tasks || 0}
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2">
                <Button className="w-full" asChild>
                  <Link href={`/member/projects/${project.id}`}>
                    Go to Site Portal <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
