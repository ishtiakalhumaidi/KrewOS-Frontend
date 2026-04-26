/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { MemberPortalService } from "@/services/memberPortal.services";
import { AttendanceService } from "@/services/attendance.services";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  MapPin,
  Clock,
  ShieldAlert,
  Package,
  CheckCircle2,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function WorkerSitePortalPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const queryClient = useQueryClient();

  // 1. Fetch Project Details
  const { data: projectResponse, isLoading: isProjectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => MemberPortalService.getProjectDetails(projectId),
    enabled: !!projectId,
  });

  // 2. Fetch Worker's Status for Today
  const { data: attendanceResponse, isLoading: isAttendanceLoading } = useQuery(
    {
      queryKey: ["my-attendance", projectId],
      queryFn: () => AttendanceService.getMyTodayAttendance(projectId),
      enabled: !!projectId,
    },
  );

  // 3. Clock In Mutation
  const clockInMutation = useMutation({
    mutationFn: () =>
      AttendanceService.clockIn({ projectId, method: "MOBILE_APP" }),
    onSuccess: () => {
      toast.success("Successfully clocked into site!");
      queryClient.invalidateQueries({ queryKey: ["my-attendance", projectId] });
    },
      onError: (error: any) => {
  const errors = error?.response?.data?.errorSources;

  if (errors?.length) {
    errors.forEach((err: any) => {
      toast.error(err.message);
    });
  } else {
    toast.error(error?.response?.data?.message || "Failed to clock in.");
  }
}
  });

  // 4. Clock Out Mutation
  const clockOutMutation = useMutation({
    mutationFn: (attendanceId: string) =>
      AttendanceService.clockOut(attendanceId),
    onSuccess: () => {
      toast.success("Successfully clocked out for the day!");
      queryClient.invalidateQueries({ queryKey: ["my-attendance", projectId] });
    },
    onError: (error: any) => {
  const errors = error?.response?.data?.errorSources;

  if (errors?.length) {
    errors.forEach((err: any) => {
      toast.error(err.message);
    });
  } else {
    toast.error(error?.response?.data?.message || "Failed to clock out.");
  }
}
  });

  const project = projectResponse?.data;
  const todayRecord = attendanceResponse?.data;

  if (isProjectLoading || isAttendanceLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-4 text-center mt-10">
        Project not found or access denied.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              Site Portal
            </Badge>
            <Badge
              variant={project.status === "ACTIVE" ? "default" : "secondary"}
            >
              {project.status}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground flex items-center mt-1">
            <MapPin className="h-4 w-4 mr-1" /> {project.location}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* DYNAMIC ATTENDANCE TERMINAL */}
        <Card
          className={`md:col-span-2 border-2 ${
            todayRecord?.clockOut
              ? "border-green-100 bg-green-50/30 dark:border-green-900 dark:bg-green-950/20"
              : todayRecord
                ? "border-orange-100 bg-orange-50/30 dark:border-orange-900 dark:bg-orange-950/20"
                : "border-blue-100 bg-blue-50/30 dark:border-blue-900 dark:bg-blue-950/20"
          }`}
        >
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" /> Daily Time Clock
            </CardTitle>
            <CardDescription>
              Record your hours for this specific construction site.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6 space-y-4">
            {
              /* SCENARIO 1: Shift is entirely finished */
              todayRecord?.clockOut ? (
                <div className="flex flex-col items-center">
                  <div className="h-16 w-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-green-700 dark:text-green-500">
                    Shift Completed
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    You worked {todayRecord.hoursWorked} hours today.
                  </p>
                </div>
              ) : /* SCENARIO 2: Currently clocked in, need to clock out */
              todayRecord ? (
                <>
                  <Button
                    size="lg"
                    className="w-full max-w-sm h-16 text-lg bg-orange-500 hover:bg-orange-600 shadow-lg"
                    onClick={() => clockOutMutation.mutate(todayRecord.id)}
                    disabled={clockOutMutation.isPending}
                  >
                    {clockOutMutation.isPending ? (
                      <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                    ) : (
                      <LogOut className="h-6 w-6 mr-2" />
                    )}
                    Clock Out
                  </Button>
                  <p className="text-xs text-orange-600/80 dark:text-orange-400 font-medium animate-pulse">
                    You are currently active on site. Don't forget to clock out!
                  </p>
                </>
              ) : (
                /* SCENARIO 3: Has not clocked in yet */
                <>
                  <Button
                    size="lg"
                    className="w-full max-w-sm h-16 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg"
                    onClick={() => clockInMutation.mutate()}
                    disabled={clockInMutation.isPending}
                  >
                    {clockInMutation.isPending ? (
                      <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-6 w-6 mr-2" />
                    )}
                    Clock In to Site
                  </Button>
                  <p className="text-xs text-muted-foreground text-center max-w-xs">
                    Ensure you have your PPE on before clocking in.
                  </p>
                </>
              )
            }
          </CardContent>
        </Card>

        {/* QUICK ACTIONS */}
        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start h-12"
                asChild
              >
                <Link href={`/member/tasks?projectId=${projectId}`}>
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" /> View
                  My Tasks
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-12"
                asChild
              >
                <Link href="/member/report-incident">
                  <ShieldAlert className="mr-2 h-4 w-4 text-orange-600" />{" "}
                  Report Incident
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-12"
                asChild
              >
                <Link href="/member/materials">
                  <Package className="mr-2 h-4 w-4 text-purple-600" /> Request
                  Material
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* PROJECT DETAILS */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Site Instructions & Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
            {project.description ||
              "No specific instructions provided for this site."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
