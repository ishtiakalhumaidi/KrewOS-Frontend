/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AttendanceService } from "@/services/attendance.services";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Clock, HardHat, CalendarDays, Hourglass, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const StatCard = ({ title, value, icon: Icon, suffix, colorClass, delay }: any) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
    <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden hover:shadow-md transition-all h-full">
      <CardContent className="p-8 flex items-center gap-6 h-full">
        <div className={cn("h-16 w-16 rounded-[1.5rem] flex items-center justify-center shrink-0 border-2 border-white shadow-inner", colorClass)}>
          <Icon className="h-8 w-8" />
        </div>
        <div>
          <p className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest mb-1">{title}</p>
          <div className="flex items-baseline gap-1.5">
            <p className="text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">{value}</p>
            {suffix && <p className="text-sm font-bold text-zinc-400">{suffix}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function MyTimesheetPage() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((currentDate.getMonth() + 1).toString());

  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: ["my-timesheet", selectedYear, selectedMonth],
    queryFn: () => AttendanceService.getMyTimesheet(Number(selectedYear), Number(selectedMonth)),
  });

  if (isError) {
    toast.error((error as any)?.response?.data?.message || "Failed to load timesheet.");
  }

  const stats = response?.data;
  const logs = stats?.logs || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 pt-4">
      
      {/* ─── Header & Filters ─── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-4 px-1">
        <div className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50 dark:border-blue-800/60 dark:bg-blue-900/30 px-4 py-1.5 text-sm font-bold tracking-wide text-blue-700 dark:text-blue-400 shadow-sm uppercase">
          <Clock className="mr-2.5 h-4 w-4" /> Attendance Record
        </div>
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              My Timesheet
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl leading-relaxed font-medium mt-2">
              Review your logged hours, completed shifts, and ensure accurate payroll tracking.
            </p>
          </div>
          
          {/* Premium Filter Controls */}
          <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 bg-white/80 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/60 rounded-[2rem] p-3 shadow-sm backdrop-blur-md w-full xl:w-auto">
            <div className="flex items-center pl-3 pr-1">
              <CalendarDays className="h-5 w-5 text-zinc-400 mr-2" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-500">Period:</span>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="h-12 w-full sm:w-[150px] rounded-2xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:ring-blue-500 font-bold text-base transition-all">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-200 dark:border-zinc-800 shadow-xl">
                  {MONTHS.map((m, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()} className="py-2.5 font-medium">{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="h-12 w-full sm:w-[110px] rounded-2xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:ring-blue-500 font-bold text-base transition-all">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-200 dark:border-zinc-800 shadow-xl">
                  <SelectItem value="2026" className="py-2.5 font-medium">2026</SelectItem>
                  <SelectItem value="2025" className="py-2.5 font-medium">2025</SelectItem>
                  <SelectItem value="2024" className="py-2.5 font-medium">2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] bg-white dark:bg-zinc-900 shadow-sm">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* ─── Premium Stat Cards ─── */}
          <div className="grid gap-6 md:grid-cols-2">
            <StatCard 
              title="Total Hours Worked" 
              value={stats?.totalHoursWorked || 0} 
              suffix="hrs"
              icon={Hourglass} 
              colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
              delay={0.1} 
            />
            <StatCard 
              title="Shifts Completed" 
              value={stats?.totalShiftsCompleted || 0} 
              suffix="shifts"
              icon={Calendar} 
              colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
              delay={0.2} 
            />
          </div>

          {/* ─── Detailed Logs Table ─── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-100 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/10">
                <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center">
                  Shift History
                </CardTitle>
                <CardDescription className="text-base font-medium mt-1">
                  Detailed logs for {MONTHS[Number(selectedMonth) - 1]} {selectedYear}.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-0">
                {logs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-zinc-800 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner border border-slate-100 dark:border-zinc-700/50">
                      <Clock className="h-10 w-10 text-zinc-300 dark:text-zinc-500" />
                    </div>
                    <h3 className="font-extrabold text-2xl text-zinc-900 dark:text-white tracking-tight">No Shifts Found</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-2 max-w-sm">
                      You have no logged hours for this month. Ensure you are clocking in when you arrive on site.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-zinc-950/50 text-zinc-500 border-b border-slate-100 dark:border-zinc-800">
                        <tr>
                          <th className="px-8 py-5 text-xs font-extrabold uppercase tracking-wider">Date</th>
                          <th className="px-8 py-5 text-xs font-extrabold uppercase tracking-wider">Site / Project</th>
                          <th className="px-8 py-5 text-xs font-extrabold uppercase tracking-wider text-center">Clock In</th>
                          <th className="px-8 py-5 text-xs font-extrabold uppercase tracking-wider text-center">Clock Out</th>
                          <th className="px-8 py-5 text-xs font-extrabold uppercase tracking-wider text-right">Total Hours</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                        {logs.map((log: any) => (
                          <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                            <td className="px-8 py-6">
                              <span className="font-bold text-base text-zinc-900 dark:text-white">
                                {new Date(log.clockIn).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center text-sm font-bold text-zinc-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 shadow-sm w-fit">
                                <HardHat className="h-4 w-4 mr-2 text-blue-500" />
                                {log.project?.name || "Unknown Site"}
                              </div>
                            </td>
                            <td className="px-8 py-6 text-center font-bold text-zinc-600 dark:text-zinc-400">
                              {new Date(log.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-8 py-6 text-center font-bold text-zinc-600 dark:text-zinc-400">
                              {log.clockOut ? (
                                new Date(log.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              ) : (
                                <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 border-0 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest shadow-none">
                                  <Clock className="w-3 h-3 mr-1.5 animate-pulse" /> Active Shift
                                </Badge>
                              )}
                            </td>
                            <td className="px-8 py-6 text-right">
                              {log.hoursWorked ? (
                                <span className="font-extrabold text-lg text-emerald-600 dark:text-emerald-400 tracking-tight">
                                  {log.hoursWorked} <span className="text-xs text-zinc-400 uppercase tracking-widest ml-0.5">hrs</span>
                                </span>
                              ) : (
                                <span className="font-bold text-zinc-300">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
}