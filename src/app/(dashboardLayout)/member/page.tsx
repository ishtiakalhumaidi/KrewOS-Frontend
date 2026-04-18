/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "@/services/dashboard.services";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, HardHat, CheckSquare, ShieldAlert, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MemberDashboardPage() {
  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: DashboardService.getStats,
  });

  const stats = response?.data;

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-sm font-medium text-destructive bg-destructive/10 rounded-md flex items-center">
        <AlertCircle className="h-4 w-4 mr-2" />
        {(error as any)?.response?.data?.message || "Failed to load dashboard stats."}
      </div>
    );
  }

  // Calculate task completion percentage
  const totalTasks = stats?.myTaskCount || 0;
  const doneTasks = stats?.myTaskStatusDistribution?.find((t: any) => t.status === "DONE")?.count || 0;
  const progressPercentage = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Workspace</h1>
        <p className="text-muted-foreground mt-1">Here is an overview of your current assignments and workload.</p>
      </div>

      {/* STAT CARDS */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assigned Projects</CardTitle>
            <HardHat className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.myProjectCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active sites you are assigned to</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.myTaskCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Total work orders assigned to you</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Incidents Reported</CardTitle>
            <ShieldAlert className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.myIncidentCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Safety hazards you have logged</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* TASK PROGRESS CHART */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Task Completion</CardTitle>
            <CardDescription>Your progress across all assigned tasks.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Overall Progress</span>
                <span className="font-bold text-green-600">{progressPercentage}%</span>
              </div>
              <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-500" 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t dark:border-zinc-800">
                {stats?.myTaskStatusDistribution?.map((item: any) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground capitalize">{item.status.replace("_", " ").toLowerCase()}</span>
                    <span className="font-bold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QUICK ACTIONS */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Jump straight to your active workflows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-between h-12" asChild>
              <Link href="/member/tasks">
                <span className="flex items-center"><CheckSquare className="mr-2 h-4 w-4 text-zinc-500" /> View My Task Board</span>
                <ArrowRight className="h-4 w-4 text-zinc-400" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between h-12" asChild>
              <Link href="/member/projects">
                <span className="flex items-center"><HardHat className="mr-2 h-4 w-4 text-zinc-500" /> View Assigned Projects</span>
                <ArrowRight className="h-4 w-4 text-zinc-400" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}