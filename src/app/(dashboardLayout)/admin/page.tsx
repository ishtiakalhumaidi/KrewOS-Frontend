/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "@/services/dashboard.services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, Users, ShieldAlert, ListTodo, Loader2 } from "lucide-react";

export default function AdminDashboardPage() {
  // Fetch stats using React Query
  const { data: statsResponse, isLoading, isError } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: DashboardService.getStats,
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !statsResponse?.success) {
    return (
      <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
        Failed to load dashboard statistics. Please try refreshing the page.
      </div>
    );
  }

  const stats = statsResponse.data.stats;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Company Overview</h1>
        <p className="text-muted-foreground">
          Welcome back. Here is what is happening across your projects today.
        </p>
      </div>
      
      {/* Top Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.projectCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.employeeCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Total Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.taskCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Safety Incidents</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats?.incidentCount || 0}</div>
            {stats?.incidentCount > 0 && (
              <p className="text-xs text-red-500 mt-1">Requires attention</p>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Task Status Distribution Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Task Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.taskStatusDistribution?.length > 0 ? (
              <div className="space-y-4">
                {stats.taskStatusDistribution.map((item: any) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.status.replace("_", " ")}</span>
                    <span className="text-sm font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No tasks created yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}