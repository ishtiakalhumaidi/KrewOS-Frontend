/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "@/services/dashboard.services";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  Users,
  FolderKanban,
  ShieldAlert,
  CheckCircle2,
  TrendingUp,
  CalendarClock,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { Pie, PieChart, Cell } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const taskChartConfig = {
  count: { label: "Tasks" },
  TODO: { label: "To Do", color: "hsl(var(--chart-3))" },
  IN_PROGRESS: { label: "In Progress", color: "hsl(var(--chart-1))" },
  IN_REVIEW: { label: "In Review", color: "hsl(var(--chart-4))" },
  DONE: { label: "Done", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

export default function AdminDashboardPage() {
  const { data: response, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: DashboardService.getStats,
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = response?.data;
  const subStats = stats?.subscriptionStats;

  const formatLimit = (limit: number) =>
    limit === 999999 ? "Unlimited" : limit;
  const calculatePercentage = (used: number, limit: number) =>
    limit === 999999 ? (used > 0 ? 5 : 0) : Math.min(100, (used / limit) * 100);

  const STATUS_COLORS: Record<string, string> = {
    TODO: "#94a3b8", // slate
    IN_PROGRESS: "#3b82f6", // blue
    IN_REVIEW: "#f59e0b", // amber
    DONE: "#22c55e", // green
  };

  const chartData =
    stats?.taskStatusDistribution?.map((item: any) => ({
      status: item.status,
      count: item.count,
      fill: STATUS_COLORS[item.status] ?? "#6b7280",
    })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your workspace operations and subscription limits.
        </p>
      </div>

      {/* WORKSPACE QUOTAS */}
      {subStats && (
        <Card className="border-blue-100 bg-blue-50/30 dark:border-blue-900/50 dark:bg-blue-900/10 shadow-sm">
          <CardHeader className="pb-3 border-b border-blue-100/50 dark:border-blue-900/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />{" "}
                  Workspace Quotas
                </CardTitle>
                <CardDescription>
                  Current usage for your <strong>{subStats.plan}</strong> plan.
                </CardDescription>
              </div>
              <Link href="/admin/settings/billing">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-blue-50 text-black"
                >
                  Manage Billing
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    Active Projects
                  </span>
                  <span className="text-muted-foreground">
                    {subStats.projectsUsed} /{" "}
                    {formatLimit(subStats.projectsLimit)}
                  </span>
                </div>
                <Progress
                  value={calculatePercentage(
                    subStats.projectsUsed,
                    subStats.projectsLimit,
                  )}
                  className={`h-2 ${
                    subStats.projectsUsed >= subStats.projectsLimit &&
                    subStats.projectsLimit !== 999999
                      ? "bg-red-200 [&>div]:bg-red-600"
                      : ""
                  }`}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    Team Members
                  </span>
                  <span className="text-muted-foreground">
                    {subStats.membersUsed} /{" "}
                    {formatLimit(subStats.membersLimit)}
                  </span>
                </div>
                <Progress
                  value={calculatePercentage(
                    subStats.membersUsed,
                    subStats.membersLimit,
                  )}
                  className={`h-2 ${
                    subStats.membersUsed >= subStats.membersLimit &&
                    subStats.membersLimit !== 999999
                      ? "bg-red-200 [&>div]:bg-red-600"
                      : ""
                  }`}
                />
              </div>

              {subStats.plan !== "FREE" && subStats.daysRemaining !== null ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300 flex items-center">
                      <CalendarClock className="w-4 h-4 mr-1.5 text-zinc-500" />{" "}
                      Billing Cycle
                    </span>
                    <span className="text-muted-foreground">
                      {subStats.daysRemaining} days left
                    </span>
                  </div>
                  <Progress
                    value={
                      100 -
                      (subStats.daysRemaining /
                        (subStats.totalPeriodDays || 30)) *
                        100
                    }
                    className="h-2 bg-zinc-200 dark:bg-zinc-800 [&>div]:bg-indigo-500"
                  />
                  <p className="text-xs text-muted-foreground text-right mt-1">
                    Renews on{" "}
                    {new Date(subStats.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center p-3 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                  <p className="text-sm text-muted-foreground">
                    You are currently on the Free tier.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* PIE CHART & KPI GRID */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
        {/* DONUT CHART */}
        <Card className="col-span-3 shadow-sm flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Task Distribution</CardTitle>
            <CardDescription>
              Overview of task statuses across all projects
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            {chartData.length > 0 ? (
              <>
                <ChartContainer
                  config={taskChartConfig}
                  className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={chartData}
                      dataKey="count"
                      nameKey="status"
                      innerRadius={60}
                      strokeWidth={5}
                    >
                      {/* ✅ Cell renders the correct fill color per slice */}
                      {chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-3 pb-4 mt-2">
                  {chartData.map((entry: any) => {
                    const label =
                      taskChartConfig[
                        entry.status as keyof typeof taskChartConfig
                      ]?.label ?? entry.status;
                    return (
                      <div
                        key={entry.status}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground"
                      >
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full"
                          style={{ background: entry.fill }}
                        />
                        {label}
                        <span className="font-medium text-foreground">
                          ({entry.count})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg mt-4">
                No tasks created yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* KPI CARDS */}
        <div className="col-span-4 grid gap-4 grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Projects
              </CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.projectCount || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Team Members
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.employeeCount || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.taskCount || 0}</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Safety Incidents
              </CardTitle>
              <ShieldAlert className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.incidentCount || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
