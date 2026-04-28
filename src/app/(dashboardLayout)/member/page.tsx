/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "@/services/dashboard.services";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Loader2, HardHat, CheckSquare, AlertCircle, ArrowRight, 
  CalendarClock, Package, Clock, Calendar, CheckCircle2, UserCircle,
  Building2
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// 👉 Defined OUTSIDE the main component to prevent React re-render crashes
const StatCard = ({ title, value, icon: Icon, description, color, delay }: any) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
    <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden hover:shadow-md transition-shadow h-full">
      <CardContent className="p-8 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between mb-6">
          <div className={cn("p-4 rounded-2xl", color)}>
            <Icon className="h-6 w-6" />
          </div>
          <Badge variant="outline" className="font-bold text-[10px] tracking-widest uppercase border-slate-200 dark:border-zinc-700 shadow-sm">
            Personal
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

const ActionLink = ({ href, icon: Icon, title, subtitle, colorClass }: any) => (
  <Link href={href} className="block group">
    <div className="p-5 rounded-3xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-800 shadow-[inset_0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-sm transition-all duration-300 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={cn("p-3 rounded-2xl transition-colors", colorClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-bold text-zinc-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{title}</p>
          <p className="text-xs font-medium text-zinc-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <ArrowRight className="h-5 w-5 text-zinc-300 dark:text-zinc-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
    </div>
  </Link>
);

export default function MemberDashboardPage() {
  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: DashboardService.getStats,
  });

  const stats = response?.data?.data || response?.data || {};

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-3xl flex items-center max-w-2xl mx-auto mt-10">
        <AlertCircle className="h-6 w-6 mr-3" />
        {(error as any)?.response?.data?.message || "Failed to load personal dashboard statistics."}
      </div>
    );
  }

  // --- Data Extraction based on new MEMBER JSON ---
  const myProjectCount = stats.myProjectCount || 0;
  const myTaskCount = stats.myTaskCount || 0;
  const overdueTasks = stats.overdueTasks || 0;
  const myPendingMaterials = stats.myPendingMaterials || 0;
  const upcomingDeadlines = stats.upcomingDeadlines || [];
  const taskDist = stats.myTaskStatusDistribution || [];

  // --- Task Math ---
  const doneTasks = taskDist.find((t: any) => t.status === "DONE")?.count || 0;
  const inProgressTasks = taskDist.find((t: any) => t.status === "IN_PROGRESS")?.count || 0;
  const progressPercentage = myTaskCount > 0 ? Math.round((doneTasks / myTaskCount) * 100) : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 pt-4">
      
      {/* ─── Header Section ─── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-4 px-1">
        <div className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50 dark:border-blue-800/60 dark:bg-blue-900/30 px-4 py-1.5 text-sm font-bold tracking-wide text-blue-700 dark:text-blue-400 shadow-sm uppercase">
          <UserCircle className="mr-2.5 h-4 w-4" /> Personal Workspace
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          My Dashboard
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl leading-relaxed font-medium">
          An overview of your current assignments, pending material requests, and upcoming deadlines.
        </p>
      </motion.div>

      {/* ─── Key Metrics ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Assigned Sites" 
          value={myProjectCount} 
          description="Active Projects"
          icon={HardHat} 
          color="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" 
          delay={0.1}
        />
        <StatCard 
          title="Total Tasks" 
          value={myTaskCount} 
          description={`${inProgressTasks} In Progress`}
          icon={CheckSquare} 
          color="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" 
          delay={0.2}
        />
        <StatCard 
          title="Overdue Tasks" 
          value={overdueTasks} 
          description="Action Required"
          icon={CalendarClock} 
          color={overdueTasks > 0 ? "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 shadow-[0_0_20px_rgba(220,38,38,0.2)]" : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"} 
          delay={0.3}
        />
        <StatCard 
          title="Pending Materials" 
          value={myPendingMaterials} 
          description="Awaiting Approval"
          icon={Package} 
          color={myPendingMaterials > 0 ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400" : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400"} 
          delay={0.4}
        />
      </div>

      {/* ─── Dashboard Core Content ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* Dynamic Task & Deadline Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="xl:col-span-2 space-y-8">
          
          {/* Premium Progress Card */}
          <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-100 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/10">
              <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center">
                <CheckCircle2 className="w-6 h-6 mr-3 text-emerald-500" /> Overall Task Completion
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex items-end justify-between mb-4">
                <div className="space-y-1">
                  <p className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">{progressPercentage}%</p>
                  <p className="text-sm font-bold text-zinc-500">{doneTasks} of {myTaskCount} tasks completed</p>
                </div>
                <Badge className={cn("px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest shadow-none border-0", progressPercentage === 100 ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700")}>
                  {progressPercentage === 100 ? "All Caught Up" : "In Progress"}
                </Badge>
              </div>
              <div className="h-6 w-full bg-slate-100 dark:bg-zinc-950 rounded-full overflow-hidden shadow-inner p-1">
                <div 
                  className={cn("h-full rounded-full transition-all duration-1000", progressPercentage === 100 ? "bg-emerald-500" : "bg-blue-600")} 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-100 dark:border-zinc-800/50">
                {taskDist.map((item: any) => (
                  <div key={item.status} className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800">
                    <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">{item.count}</p>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 mt-1">{item.status.replace("_", " ")}</p>
                  </div>
                ))}
                {taskDist.length === 0 && (
                  <div className="col-span-3 text-center py-4 text-sm font-bold text-zinc-400">No tasks assigned yet.</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          {upcomingDeadlines.length > 0 && (
            <Card className="rounded-[2.5rem] border-amber-200 dark:border-amber-900/50 shadow-sm bg-amber-50/30 dark:bg-amber-900/10 overflow-hidden">
              <CardHeader className="p-8 border-b border-amber-100 dark:border-amber-900/20">
                <CardTitle className="text-xl font-bold tracking-tight text-amber-900 dark:text-amber-500 flex items-center">
                  <Clock className="w-6 h-6 mr-3 text-amber-600 dark:text-amber-500" /> Upcoming Deadlines (Next 3 Days)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-amber-100 dark:divide-amber-900/20">
                  {upcomingDeadlines.map((task: any) => (
                    <div key={task.id} className="p-6 px-8 flex items-center justify-between hover:bg-amber-50/50 dark:hover:bg-amber-900/20 transition-colors">
                      <div>
                        <p className="font-bold text-lg text-zinc-900 dark:text-zinc-200">{task.title}</p>
                        <p className="text-sm font-medium text-zinc-500 mt-1 flex items-center">
                          <Building2 className="w-4 h-4 mr-1.5 opacity-70" /> {task.project?.name || "Unknown Project"}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 shadow-none border-0 px-3 py-1 font-bold">
                          <Calendar className="w-3.5 h-3.5 mr-1.5" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Action Sidebar / Quick Links */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="space-y-8">
          <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Quick Links</CardTitle>
              <CardDescription className="text-base font-medium">Jump straight to your active workflows.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
              <ActionLink 
                href="/member/tasks" 
                icon={CheckSquare} 
                title="My Task Board" 
                subtitle="Manage your daily work items"
                colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/60"
              />
              <ActionLink 
                href="/member/projects" 
                icon={HardHat} 
                title="Assigned Projects" 
                subtitle="View site details and members"
                colorClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/60"
              />
              <ActionLink 
                href="/member/materials" 
                icon={Package} 
                title="Material Requests" 
                subtitle="Request supplies for your site"
                colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/60"
              />
            </CardContent>
          </Card>

          {/* All Clear Fallback if no overdue/pending */}
          {(overdueTasks === 0 && myPendingMaterials === 0 && upcomingDeadlines.length === 0) && (
            <div className="p-8 text-center flex flex-col items-center bg-slate-50 dark:bg-zinc-950 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-sm">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-4">
                <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="font-extrabold text-lg text-zinc-900 dark:text-white">You&apos;re Caught Up!</p>
              <p className="text-sm text-zinc-500 font-medium mt-1">No urgent deadlines or pending alerts.</p>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}