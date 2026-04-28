/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "@/services/dashboard.services"; 

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, Building2, Users, AlertTriangle, CheckCircle2, 
  Plus, HardHat, CheckSquare, BarChart3, ShieldCheck, 
  Package, ClipboardX, CalendarClock, DollarSign, Activity,ReceiptText
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Recharts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// ─── Stat Card Component (Defined outside to prevent re-renders) ───
const StatCard = ({ title, value, icon: Icon, description, color, delay }: any) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
    <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden hover:shadow-md transition-shadow h-full">
      <CardContent className="p-8 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between mb-6">
          <div className={cn("p-4 rounded-2xl", color)}>
            <Icon className="h-6 w-6" />
          </div>
          <Badge variant="outline" className="font-bold text-[10px] tracking-widest uppercase border-slate-200 dark:border-zinc-700 shadow-sm">
            Live
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

// ─── Alert Item Component ───
const AlertItem = ({ icon: Icon, title, description, colorClass, iconColorClass, linkHref, linkText }: any) => (
  <div className={cn("p-5 rounded-3xl border shadow-sm flex items-start gap-4", colorClass)}>
    <div className={cn("mt-1 p-2.5 rounded-xl", iconColorClass)}>
      <Icon className="h-6 w-6" />
    </div>
    <div>
      <p className="font-bold text-lg tracking-tight">{title}</p>
      <p className="text-sm font-medium mt-1 opacity-80">{description}</p>
      <Link href={linkHref}>
        <Button variant="link" className={cn("px-0 h-auto font-bold mt-2", iconColorClass.replace("bg-", "text-").split(" ")[0])}>
          {linkText}
        </Button>
      </Link>
    </div>
  </div>
);

export default function UnifiedDashboardPage() {
  const { data: statsRes, isLoading, isError } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: DashboardService.getStats,
  });

  if (isLoading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-blue-600" /></div>;
  if (isError) return <div className="flex min-h-[60vh] items-center justify-center text-red-500 font-bold">Failed to load statistics.</div>;

  // Safely extract the payload based on your exact JSON format
  const stats = statsRes?.data?.data || statsRes?.data || {};
  const role = stats.role || "MEMBER";

  // ==========================================
  // SUPER ADMIN VIEW
  // ==========================================
  if (role === "SUPER_ADMIN") {
    const subDist = stats.subscriptionDistribution || [];
    const saChartData = [
      { name: 'Free', count: subDist.find((s:any)=>s.plan==='FREE')?.count||0, color: '#94a3b8'},
      { name: 'Pro', count: subDist.find((s:any)=>s.plan==='PRO')?.count||0, color: '#3b82f6'},
      { name: 'Enterprise', count: subDist.find((s:any)=>s.plan==='ENTERPRISE')?.count||0, color: '#8b5cf6'},
    ];

    return (
      <div className="space-y-8 max-w-7xl mx-auto pb-12 pt-4">
        <div className="space-y-4 px-1">
          <div className="inline-flex items-center rounded-full border border-violet-200/80 bg-violet-50 dark:border-violet-800/60 dark:bg-violet-900/30 px-4 py-1.5 text-sm font-bold tracking-wide text-violet-700 dark:text-violet-400 uppercase">
            <Activity className="mr-2.5 h-4 w-4" /> System Health
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Super Admin Console</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Companies" value={stats.companyCount || 0} icon={Building2} color="bg-blue-100 text-blue-600" delay={0.1} />
          <StatCard title="Active Users" value={stats.userCount || 0} icon={Users} color="bg-indigo-100 text-indigo-600" delay={0.2} />
          <StatCard title="Estimated MRR" value={`$${((stats.estimatedMRRCents || 0) / 100).toFixed(2)}`} icon={DollarSign} color="bg-emerald-100 text-emerald-600" delay={0.3} />
          <StatCard title="Lifetime Revenue" value={`$${((stats.totalRevenueCents || 0) / 100).toFixed(2)}`} icon={ReceiptText} color="bg-violet-100 text-violet-600" delay={0.4} />
        </div>

        <Card className="rounded-[2.5rem] border-slate-200 shadow-sm overflow-hidden mt-8">
          <CardHeader className="p-8 border-b bg-slate-50/50">
            <CardTitle className="text-2xl font-bold flex items-center"><BarChart3 className="w-6 h-6 mr-3 text-violet-600" /> Subscription Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-8 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={saChartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontWeight: 600, fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontWeight: 600, fontSize: 12 }} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }} contentStyle={{ borderRadius: '1rem', fontWeight: 'bold' }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={80}>
                  {saChartData.map((entry: any, index: number) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==========================================
  // DATA EXTRACTION (ADMIN & MEMBER)
  // ==========================================
  const isAdmin = role === "ADMIN" || role === "OWNER";
  
  // Calculate Task Completion Rate dynamically
  const taskDist = isAdmin ? (stats.taskStatusDistribution || []) : (stats.myTaskStatusDistribution || []);
  const completedTasksObj = taskDist.find((t: any) => t.status === "DONE");
  const completedTasks = completedTasksObj ? completedTasksObj.count : 0;
  const totalTasks = isAdmin ? (stats.taskCount || 0) : (stats.myTaskCount || 0);
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const chartData = [
    { name: 'To Do', count: taskDist.find((t:any) => t.status === 'TODO')?.count || 0, color: '#64748b' },
    { name: 'In Progress', count: taskDist.find((t:any) => t.status === 'IN_PROGRESS')?.count || 0, color: '#3b82f6' },
    { name: 'Completed', count: completedTasks, color: '#10b981' },
  ];

  // Action Center Specifics
  const failedChecks = stats.failedSafetyChecksToday || [];
  const subStats = stats.subscriptionStats || null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 pt-4">
      
      {/* ─── Header Section ─── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-1">
        <div className="space-y-4">
          <div className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50 dark:border-blue-800/60 dark:bg-blue-900/30 px-4 py-1.5 text-sm font-bold tracking-wide text-blue-700 dark:text-blue-400 shadow-sm uppercase">
            <Building2 className="mr-2.5 h-4 w-4" /> {isAdmin ? "Command Center" : "My Workspace"}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {isAdmin ? "Company Overview" : "Personal Dashboard"}
          </h1>
        </div>
        {isAdmin && (
          <Link href="/admin/projects/new" className="shrink-0">
            <Button className="h-14 px-8 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] active:scale-95 text-base">
              <Plus className="mr-2 h-5 w-5" /> Establish Site
            </Button>
          </Link>
        )}
      </div>

      {/* ─── Key Metrics ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={isAdmin ? "Total Sites" : "My Assigned Sites"} 
          value={isAdmin ? (stats.projectCount || 0) : (stats.myProjectCount || 0)} 
          icon={HardHat} 
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" 
          delay={0.1}
        />
        <StatCard 
          title={isAdmin ? "Global Workforce" : "Overdue Tasks"} 
          value={isAdmin ? (stats.employeeCount || 0) : (stats.overdueTasks || 0)} 
          icon={isAdmin ? Users : CalendarClock} 
          color={(!isAdmin && stats.overdueTasks > 0) ? "bg-red-100 text-red-600 shadow-[0_0_20px_rgba(220,38,38,0.2)]" : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"} 
          delay={0.2}
        />
        <StatCard 
          title="Safety Alerts" 
          value={isAdmin ? (stats.incidentCount || 0) : (stats.myIncidentCount || 0)} 
          icon={AlertTriangle} 
          color={(isAdmin ? stats.incidentCount : stats.myIncidentCount) > 0 ? "bg-red-100 text-red-600 shadow-[0_0_20px_rgba(220,38,38,0.2)] dark:bg-red-900/40 dark:text-red-400" : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"} 
          delay={0.3}
        />
        {/* 👉 THE FIX: Re-added the Task Completion Rate Card! */}
        <StatCard 
          title="Tasks Completed" 
          value={`${completionRate}%`} 
          description={`${completedTasks} of ${totalTasks} Done`}
          icon={CheckSquare} 
          color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400" 
          delay={0.4}
        />
      </div>

      {/* ─── Dashboard Core Content ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* Dynamic Chart Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="xl:col-span-2">
          <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden h-full bg-white dark:bg-zinc-900">
            <CardHeader className="p-8 border-b bg-slate-50/50 dark:bg-zinc-900/10 dark:border-zinc-800/50">
              <CardTitle className="text-2xl font-bold flex items-center">
                <BarChart3 className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-400" /> {isAdmin ? "Global" : "Personal"} Task Distribution
              </CardTitle>
              <CardDescription className="text-base font-medium mt-1">Visual breakdown of assigned work phases.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} stroke="#334155" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontWeight: 600, fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontWeight: 600, fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={80}>
                    {chartData.map((entry: any, index: number) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dynamic Action Sidebar */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="space-y-8">
          <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden bg-white dark:bg-zinc-900">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-bold tracking-tight">Action Center</CardTitle>
              <CardDescription className="text-base font-medium">Critical items requiring attention.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
              
              {/* ADMIN ALERTS */}
              {isAdmin && (
                <>
                  {stats.incidentCount > 0 && <AlertItem icon={AlertTriangle} title="Safety Incidents" description={`${stats.incidentCount} unresolved hazards detected.`} colorClass="bg-red-50/50 border-red-100 text-red-900 dark:bg-red-900/10 dark:border-red-900/30 dark:text-red-400" iconColorClass="bg-red-100 text-red-600 dark:bg-red-900/50" linkHref="/admin/incidents" linkText="Review Incidents" />}
                  {failedChecks.length > 0 && <AlertItem icon={ClipboardX} title="Failed Inspections" description={`${failedChecks.length} checklists reported issues today.`} colorClass="bg-amber-50/50 border-amber-100 text-amber-900 dark:bg-amber-900/10 dark:border-amber-900/30 dark:text-amber-400" iconColorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/50" linkHref="/admin/incidents" linkText="View Reports" />}
                  {stats.pendingMaterialRequests > 0 && <AlertItem icon={Package} title="Material Requests" description={`${stats.pendingMaterialRequests} supply orders pending approval.`} colorClass="bg-blue-50/50 border-blue-100 text-blue-900 dark:bg-blue-900/10 dark:border-blue-900/30 dark:text-blue-400" iconColorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/50" linkHref="/admin/projects" linkText="Review Workspaces" />}
                  
                  {/* All Clear Fallback */}
                  {(stats.incidentCount === 0 && failedChecks.length === 0 && stats.pendingMaterialRequests === 0) && (
                    <div className="p-8 text-center flex flex-col items-center bg-slate-50 dark:bg-zinc-950 rounded-3xl border border-slate-100 dark:border-zinc-800">
                      <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-4"><CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" /></div>
                      <p className="font-extrabold text-lg text-zinc-900 dark:text-white">All Clear</p>
                      <p className="text-sm text-zinc-500 font-medium">No pending actions required.</p>
                    </div>
                  )}
                </>
              )}

              {/* MEMBER ALERTS */}
              {!isAdmin && (
                <>
                  {stats.overdueTasks > 0 && <AlertItem icon={CalendarClock} title="Overdue Tasks" description={`You have ${stats.overdueTasks} tasks past their deadline.`} colorClass="bg-red-50/50 border-red-100 text-red-900 dark:bg-red-900/10 dark:border-red-900/30 dark:text-red-400" iconColorClass="bg-red-100 text-red-600 dark:bg-red-900/50" linkHref="/admin/projects" linkText="Update Tasks" />}
                  {(stats.upcomingDeadlines || []).length > 0 && <AlertItem icon={CalendarClock} title="Upcoming Deadlines" description={`${stats.upcomingDeadlines.length} tasks due in the next 3 days.`} colorClass="bg-amber-50/50 border-amber-100 text-amber-900 dark:bg-amber-900/10 dark:border-amber-900/30 dark:text-amber-400" iconColorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/50" linkHref="/admin/projects" linkText="View Schedule" />}
                  {stats.myPendingMaterials > 0 && <AlertItem icon={Package} title="Pending Supplies" description={`Waiting on approval for ${stats.myPendingMaterials} material requests.`} colorClass="bg-blue-50/50 border-blue-100 text-blue-900 dark:bg-blue-900/10 dark:border-blue-900/30 dark:text-blue-400" iconColorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/50" linkHref="/admin/projects" linkText="Check Status" />}
                  
                  {/* All Clear Fallback */}
                  {(stats.overdueTasks === 0 && (stats.upcomingDeadlines || []).length === 0 && stats.myPendingMaterials === 0) && (
                    <div className="p-8 text-center flex flex-col items-center bg-slate-50 dark:bg-zinc-950 rounded-3xl border border-slate-100 dark:border-zinc-800">
                      <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-4"><CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" /></div>
                      <p className="font-extrabold text-lg text-zinc-900 dark:text-white">You&apos;re Caught Up!</p>
                      <p className="text-sm text-zinc-500 font-medium">No urgent deadlines or alerts.</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Subscription & Usage Panel (ADMIN ONLY) ─── */}
      {(isAdmin && subStats) && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}>
          <Card className="rounded-[2.5rem] border-indigo-200 dark:border-indigo-900/50 shadow-sm bg-indigo-50/30 dark:bg-indigo-900/10 overflow-hidden">
            <CardHeader className="p-8 border-b border-indigo-100 dark:border-indigo-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight text-indigo-900 dark:text-indigo-400 flex items-center">
                  <ShieldCheck className="w-6 h-6 mr-3 text-indigo-600 dark:text-indigo-400" /> Plan Usage & Limits
                </CardTitle>
                <CardDescription className="text-base font-medium mt-1 text-indigo-800/60 dark:text-indigo-300/60">
                  Current Tier: <strong className="uppercase">{subStats.plan}</strong>
                </CardDescription>
              </div>
              <Link href="/admin/settings/billing" className="shrink-0">
                <Button className="h-12 px-6 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm active:scale-95 transition-all">
                  Manage Billing
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <h4 className="font-bold text-indigo-900 dark:text-indigo-300">Active Projects</h4>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{subStats.projectsUsed} / {subStats.projectsLimit}</span>
                </div>
                <div className="h-4 bg-indigo-100 dark:bg-indigo-950 rounded-full overflow-hidden shadow-inner">
                  <div className={cn("h-full rounded-full transition-all duration-1000", (subStats.projectsUsed / subStats.projectsLimit) > 0.9 ? "bg-red-500" : "bg-indigo-500")} style={{ width: `${Math.round((subStats.projectsUsed / subStats.projectsLimit) * 100)}%` }} />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <h4 className="font-bold text-indigo-900 dark:text-indigo-300">Team Members</h4>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{subStats.membersUsed} / {subStats.membersLimit}</span>
                </div>
                <div className="h-4 bg-indigo-100 dark:bg-indigo-950 rounded-full overflow-hidden shadow-inner">
                  <div className={cn("h-full rounded-full transition-all duration-1000", (subStats.membersUsed / subStats.membersLimit) > 0.9 ? "bg-red-500" : "bg-indigo-500")} style={{ width: `${Math.round((subStats.membersUsed / subStats.membersLimit) * 100)}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}