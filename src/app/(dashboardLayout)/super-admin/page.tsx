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
  ShieldAlert, CheckCircle2, Ban, TrendingUp, Zap, Crown, Settings2, MinusCircle, Activity, MoreVertical,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

const PLAN_COLORS: Record<string, string> = {
  FREE: "#94a3b8",
  PRO: "#3b82f6",
  ENTERPRISE: "#8b5cf6",
};

const PLAN_META: Record<string, { label: string; icon: React.ReactNode; bgClass: string; textClass: string }> = {
  FREE: {
    label: "Free Tier",
    icon: <Zap className="w-5 h-5" />,
    bgClass: "bg-slate-100 dark:bg-zinc-800",
    textClass: "text-slate-600 dark:text-zinc-400",
  },
  PRO: {
    label: "Pro",
    icon: <TrendingUp className="w-5 h-5" />,
    bgClass: "bg-blue-100 dark:bg-blue-900/40",
    textClass: "text-blue-600 dark:text-blue-400",
  },
  ENTERPRISE: {
    label: "Enterprise",
    icon: <Crown className="w-5 h-5" />,
    bgClass: "bg-violet-100 dark:bg-violet-900/40",
    textClass: "text-violet-600 dark:text-violet-400",
  },
};

// 👉 OUTSIDE COMPONENT TO PREVENT RE-RENDERS
const StatCard = ({ title, value, icon: Icon, description, color, delay }: any) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
    <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden hover:shadow-md transition-shadow h-full">
      <CardContent className="p-8 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between mb-6">
          <div className={cn("p-4 rounded-2xl", color)}>
            <Icon className="h-6 w-6" />
          </div>
          <Badge variant="outline" className="font-bold text-[10px] tracking-widest uppercase border-slate-200 dark:border-zinc-700 shadow-sm">
            Global
          </Badge>
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{title}</h3>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">{value}</p>
            {description && <p className="text-sm font-bold text-zinc-400 tracking-wide">{description}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

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

  const statusMutation = useMutation({
    mutationFn: CompanyService.changeCompanyStatus,
    onSuccess: (res) => {
      toast.success(res?.data?.message || "Company status updated");
      queryClient.invalidateQueries({ queryKey: ["all-companies"] });
      queryClient.invalidateQueries({ queryKey: ["super-admin-stats"] });
    },
    onError: () => toast.error("Failed to update company status"),
  });

  const handleStatusChangeRequest = (companyId: string, companyName: string, newStatus: string) => {
    toast(`Change status for ${companyName}?`, {
      description: `This will mark the company as ${newStatus}. Do you want to proceed?`,
      action: {
        label: "Yes, Confirm",
        onClick: () => statusMutation.mutate({ companyId, status: newStatus }),
      },
      cancel: {
        label: "Cancel",
        onClick: () => console.log("Status change canceled"),
      },
      duration: 6000,
    });
  };

  if (isStatsLoading || isCompaniesLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
      </div>
    );
  }

  const stats = statsResponse?.data?.data || statsResponse?.data || {};
  const companies = companiesResponse?.data?.data || [];

  const chartData =
    stats?.subscriptionDistribution?.map((item: any) => ({
      plan: item.plan,
      count: item.count,
      fill: PLAN_COLORS[item.plan] ?? "#94a3b8",
    })) || [];

  const totalWorkspaces = chartData.reduce((sum: number, d: any) => sum + d.count, 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 pt-4">
      
      {/* ─── Header Section ─── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-1">
        <div className="space-y-4">
          <div className="inline-flex items-center rounded-full border border-violet-200/80 bg-violet-50 dark:border-violet-800/60 dark:bg-violet-900/30 px-4 py-1.5 text-sm font-bold tracking-wide text-violet-700 dark:text-violet-400 shadow-sm uppercase">
            <ShieldAlert className="mr-2.5 h-4 w-4" /> System Active
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Master Console
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl leading-relaxed font-medium">
            Global platform analytics, revenue tracking, and workspace management.
          </p>
        </div>
      </div>

      {/* ─── Key Metrics ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${((stats.totalRevenueCents || 0) / 100).toFixed(2)}`} 
          description="Lifetime Earnings"
          icon={DollarSign} 
          color="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" 
          delay={0.1}
        />
        <StatCard 
          title="Active Workspaces" 
          value={stats.companyCount || 0} 
          description="Registered Companies"
          icon={Building2} 
          color="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" 
          delay={0.2}
        />
        <StatCard 
          title="Global Users" 
          value={stats.userCount || 0} 
          description="Across All Tenants"
          icon={Users} 
          color="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" 
          delay={0.3}
        />
        <StatCard 
          title="Total Projects" 
          value={stats.projectCount || 0} 
          description="Platform Wide"
          icon={FolderKanban} 
          color="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400" 
          delay={0.4}
        />
      </div>

      {/* ─── Chart & Summaries ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* Dynamic Chart Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="xl:col-span-2">
          <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden h-full">
            <CardHeader className="p-8 border-b border-slate-100 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/10 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center">
                  <Activity className="w-6 h-6 mr-3 text-violet-600 dark:text-violet-400" /> Plan Distribution
                </CardTitle>
                <CardDescription className="text-base font-medium mt-1">Workspace count by subscription tier.</CardDescription>
              </div>
              <Badge variant="outline" className="px-4 py-2 text-xs font-extrabold text-zinc-500 uppercase tracking-widest border-slate-200 dark:border-zinc-700">
                {totalWorkspaces} Total
              </Badge>
            </CardHeader>
            <CardContent className="p-8 h-[350px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="plan" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 600, fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 600, fontSize: 12 }} allowDecimals={false} />
                    <Tooltip cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }} contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={80}>
                      {chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-400 font-medium">
                  No subscription data yet.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Plan Summary Sidebar */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="space-y-6">
          {["ENTERPRISE", "PRO", "FREE"].map((plan) => {
            const meta = PLAN_META[plan];
            const entry = chartData.find((d: any) => d.plan === plan);
            const count = entry?.count ?? 0;
            const pct = totalWorkspaces > 0 ? Math.round((count / totalWorkspaces) * 100) : 0;

            return (
              <Card key={plan} className="rounded-[2rem] border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn("p-3.5 rounded-2xl", meta.bgClass, meta.textClass)}>
                      {meta.icon}
                    </div>
                    <div>
                      <p className="font-extrabold text-lg tracking-tight uppercase text-zinc-900 dark:text-white">{meta.label}</p>
                      <p className="text-sm font-medium text-zinc-500 mt-0.5">{pct}% of platform</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-3xl font-extrabold tracking-tight", meta.textClass)}>
                      {count}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>
      </div>

      {/* ─── Workspace Directory Table ─── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}>
        <Card className="rounded-[2.5rem] border-indigo-200 dark:border-indigo-900/50 shadow-sm bg-indigo-50/30 dark:bg-indigo-900/10 overflow-hidden">
          <CardContent className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight text-indigo-900 dark:text-indigo-400 flex items-center">
                <Building2 className="w-6 h-6 mr-3 text-indigo-600 dark:text-indigo-400" /> Workspace Directory
              </CardTitle>
              <CardDescription className="text-base font-medium mt-2 text-indigo-800/60 dark:text-indigo-300/60 max-w-lg">
                Manage all registered construction companies, review subscriptions, and adjust active/suspended statuses.
              </CardDescription>
            </div>
            <Link href="/super-admin/companies" className="shrink-0">
              <Button className="h-14 px-8 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_8px_20px_-6px_rgba(79,70,229,0.5)] active:scale-95 transition-all text-base">
                Manage All Companies <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}