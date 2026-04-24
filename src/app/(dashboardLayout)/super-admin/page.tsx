/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardService } from "@/services/dashboard.services";
import { CompanyService } from "@/services/company.services";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Loader2, DollarSign, Building2, Users, FolderKanban,
  ShieldAlert, CheckCircle2, Ban, TrendingUp, Zap, Crown,
} from "lucide-react";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// ✅ Hardcoded colors — no CSS variable injection needed
const PLAN_COLORS: Record<string, string> = {
  FREE: "#94a3b8",
  PRO: "#3b82f6",
  ENTERPRISE: "#8b5cf6",
};

const PLAN_META: Record<string, { label: string; icon: React.ReactNode; gradient: string; badge: string }> = {
  FREE: {
    label: "Free Tier",
    icon: <Zap className="w-4 h-4" />,
    gradient: "from-slate-100 to-slate-50 dark:from-slate-800/60 dark:to-slate-900/40",
    badge: "border-slate-300 text-slate-600 bg-slate-50 dark:border-slate-600 dark:text-slate-300",
  },
  PRO: {
    label: "Pro",
    icon: <TrendingUp className="w-4 h-4" />,
    gradient: "from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-950/30",
    badge: "border-blue-400 text-blue-600 bg-blue-50 dark:border-blue-500 dark:text-blue-300",
  },
  ENTERPRISE: {
    label: "Enterprise",
    icon: <Crown className="w-4 h-4" />,
    gradient: "from-violet-100 to-violet-50 dark:from-violet-900/40 dark:to-violet-950/30",
    badge: "border-violet-400 text-violet-600 bg-violet-50 dark:border-violet-500 dark:text-violet-300",
  },
};

const chartConfig = {
  count: { label: "Workspaces" },
  FREE: { label: "Free Tier", color: PLAN_COLORS.FREE },
  PRO: { label: "Pro", color: PLAN_COLORS.PRO },
  ENTERPRISE: { label: "Enterprise", color: PLAN_COLORS.ENTERPRISE },
} satisfies ChartConfig;

export default function SuperAdminDashboardPage() {
  const queryClient = useQueryClient();

  const { data: statsResponse, isLoading: isStatsLoading } = useQuery({
    queryKey: ["super-admin-stats"],
    queryFn: DashboardService.getStats,
  });

  const { data: companiesResponse, isLoading: isCompaniesLoading } = useQuery({
    queryKey: ["all-companies"],
    queryFn: CompanyService.getAllCompanies,
  });

  const toggleMutation = useMutation({
    mutationFn: CompanyService.toggleCompanyStatus,
    onSuccess: (res) => {
      toast.success(res?.data?.message || "Company status updated");
      queryClient.invalidateQueries({ queryKey: ["all-companies"] });
      queryClient.invalidateQueries({ queryKey: ["super-admin-stats"] });
    },
    onError: () => toast.error("Failed to update company status"),
  });

  if (isStatsLoading || isCompaniesLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = statsResponse?.data;
  const companies = companiesResponse?.data?.data || [];

  const chartData =
    stats?.subscriptionDistribution?.map((item: any) => ({
      plan: item.plan,
      count: item.count,
      fill: PLAN_COLORS[item.plan] ?? "#94a3b8",
    })) || [];

  const totalWorkspaces = chartData.reduce((sum: number, d: any) => sum + d.count, 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Master Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Global platform analytics and workspace management.
          </p>
        </div>
        <div className="flex items-center text-sm font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-700">
          <ShieldAlert className="w-4 h-4 mr-2" /> Super Admin Mode Active
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-emerald-100 bg-gradient-to-br from-emerald-50 to-white dark:border-emerald-900/30 dark:from-emerald-900/20 dark:to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Total Revenue</CardTitle>
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              ${((stats?.totalRevenueCents || 0) / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-blue-100 bg-gradient-to-br from-blue-50 to-white dark:border-blue-900/30 dark:from-blue-900/20 dark:to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300">Active Workspaces</CardTitle>
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40">
              <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats?.companyCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered companies</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-indigo-100 bg-gradient-to-br from-indigo-50 to-white dark:border-indigo-900/30 dark:from-indigo-900/20 dark:to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-800 dark:text-indigo-300">Total Users</CardTitle>
            <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
              <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{stats?.userCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all workspaces</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-amber-100 bg-gradient-to-br from-amber-50 to-white dark:border-amber-900/30 dark:from-amber-900/20 dark:to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-300">Total Projects</CardTitle>
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40">
              <FolderKanban className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats?.projectCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active & completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution — upgraded layout */}
      <div className="grid gap-6 lg:grid-cols-7">

        {/* Bar Chart — col 4 */}
        <Card className="col-span-4 shadow-sm">
          <CardHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Plan Distribution</CardTitle>
                <CardDescription className="mt-0.5">
                  Workspace count by subscription tier
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                {totalWorkspaces} total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {chartData.length > 0 ? (
              <>
                <ChartContainer config={chartConfig} className="h-[220px] w-full">
                  <BarChart data={chartData} margin={{ top: 8, right: 0, left: -20, bottom: 0 }} barSize={48}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="plan"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tick={{ fontSize: 12, fontWeight: 500 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                      tick={{ fontSize: 11 }}
                    />
                    <ChartTooltip
                      cursor={{ fill: "hsl(var(--muted))", radius: 6 }}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>

                {/* Color legend below chart */}
                <div className="flex gap-5 mt-4 justify-center">
                  {chartData.map((entry: any) => (
                    <div key={entry.plan} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span
                        className="w-2.5 h-2.5 rounded-sm inline-block"
                        style={{ background: entry.fill }}
                      />
                      <span className="font-medium">{PLAN_META[entry.plan]?.label ?? entry.plan}</span>
                      <span className="text-foreground font-semibold">({entry.count})</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                No subscription data yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plan summary cards — col 3 */}
        <div className="col-span-3 flex flex-col gap-4">
          {["FREE", "PRO", "ENTERPRISE"].map((plan) => {
            const meta = PLAN_META[plan];
            const entry = chartData.find((d: any) => d.plan === plan);
            const count = entry?.count ?? 0;
            const pct = totalWorkspaces > 0 ? Math.round((count / totalWorkspaces) * 100) : 0;

            return (
              <div
                key={plan}
                className={`flex items-center justify-between rounded-xl border p-4 bg-gradient-to-r ${meta.gradient} transition-all`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ background: PLAN_COLORS[plan] + "22", color: PLAN_COLORS[plan] }}
                  >
                    {meta.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{meta.label}</p>
                    <p className="text-xs text-muted-foreground">{pct}% of total</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: PLAN_COLORS[plan] }}>
                    {count}
                  </p>
                  <p className="text-xs text-muted-foreground">workspaces</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workspace Directory Table */}
      <Card className="shadow-sm">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Workspace Directory</CardTitle>
              <CardDescription>
                Manage all registered construction companies on KrewOS.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="pl-6">Company Name</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company: any) => {
                const planTier = company.subscription?.plan || "FREE";
                const subStatus = company.subscription?.status;
                const meta = PLAN_META[planTier];

                return (
                  <TableRow key={company.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="pl-6 font-medium">{company.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs gap-1 ${meta?.badge ?? ""}`}
                        >
                          {meta?.icon}
                          {planTier}
                        </Badge>
                        {subStatus === "CANCELED" && (
                          <span className="text-[10px] text-red-500 font-bold tracking-wider uppercase">
                            Canceled
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-sm">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        {company._count?.users || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-sm">
                        <FolderKanban className="w-3.5 h-3.5 text-muted-foreground" />
                        {company._count?.projects || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      {company.isActive ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 gap-1 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 gap-1 border border-red-200 dark:border-red-800">
                          <Ban className="w-3 h-3" /> Suspended
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button
                        variant={company.isActive ? "destructive" : "default"}
                        size="sm"
                        disabled={toggleMutation.isPending}
                        onClick={() => {
                          if (
                            confirm(
                              `Are you sure you want to ${company.isActive ? "SUSPEND" : "REACTIVATE"} ${company.name}?`
                            )
                          ) {
                            toggleMutation.mutate(company.id);
                          }
                        }}
                        className={
                          !company.isActive
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : ""
                        }
                      >
                        {toggleMutation.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : company.isActive ? (
                          "Suspend"
                        ) : (
                          "Reactivate"
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {companies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No companies registered yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}