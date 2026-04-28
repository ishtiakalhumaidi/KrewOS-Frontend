/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AttendanceService } from "@/services/attendance.services";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, UserCheck, LogOut, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AttendanceTab({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ["project-attendance", projectId],
    queryFn: () => AttendanceService.getTodayAttendance(projectId),
    enabled: !!projectId,
  });

  const clockInMutation = useMutation({
    mutationFn: AttendanceService.clockIn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project-attendance", projectId] }),
  });

  const clockOutMutation = useMutation({
    mutationFn: AttendanceService.clockOut,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project-attendance", projectId] }),
  });

  const handleClockIn = () => clockInMutation.mutate({ projectId, method: "MANUAL" });
  const records = response?.data || [];

  if (isLoading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* ACTION CARD */}
      <Card className="rounded-[2rem] border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 shadow-sm overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-extrabold flex items-center text-blue-800 dark:text-blue-400 tracking-tight">
                <Clock className="h-6 w-6 mr-3" /> My Attendance Status
              </h3>
              <p className="text-blue-600/80 dark:text-blue-300/70 mt-2 font-medium">
                Clock in to record your hours for today's shift on this site.
              </p>
            </div>
            <Button 
              onClick={handleClockIn} 
              disabled={clockInMutation.isPending}
              className="w-full md:w-auto h-14 px-8 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] transition-all active:scale-95"
            >
              {clockInMutation.isPending ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <UserCheck className="h-5 w-5 mr-2" />}
              Clock Me In
            </Button>
          </div>
          {clockInMutation.isError && (
            <div className="mt-6 flex items-center text-sm font-bold text-red-700 bg-red-100 dark:bg-red-900/40 p-4 rounded-xl">
              <AlertCircle className="h-5 w-5 mr-2" />
              {(clockInMutation.error as any)?.response?.data?.message || "Failed to clock in."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ROSTER TABLE */}
      <Card className="rounded-[2rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-100 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/50">
          <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-white">Today's Site Roster</CardTitle>
          <CardDescription className="text-base mt-1">Live view of all personnel currently clocked into this project.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 dark:bg-zinc-950/50">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-4">
                <UserCheck className="h-8 w-8 text-zinc-400" />
              </div>
              <h3 className="font-bold text-xl text-zinc-900 dark:text-white">No workers on site yet</h3>
              <p className="text-zinc-500 mt-2 font-medium">Personnel will appear here once they clock in.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-zinc-950/50 border-b border-slate-100 dark:border-zinc-800">
                  <tr>
                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Worker Name</th>
                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Time In</th>
                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Time Out</th>
                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Method</th>
                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                  {records.map((record: any) => (
                    <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                      <td className="px-8 py-5 font-bold text-zinc-900 dark:text-white flex items-center">
                        <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 flex items-center justify-center mr-4 text-sm shadow-sm">
                          {record.user?.name?.charAt(0) || "U"}
                        </div>
                        {record.user?.name || "Unknown Worker"}
                      </td>
                      <td className="px-8 py-5 text-zinc-600 dark:text-zinc-300 font-medium">
                        {new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-8 py-5">
                        {record.clockOut ? (
                          <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                            {new Date(record.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            <span className="text-xs text-zinc-400 ml-2">({record.hoursWorked} hrs)</span>
                          </span>
                        ) : (
                          <Badge className="px-3 py-1 text-xs font-extrabold uppercase tracking-widest bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 shadow-none hover:bg-emerald-100">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                            Active Now
                          </Badge>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <Badge variant="secondary" className="px-3 py-1 text-[10px] font-bold tracking-wider uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                          {record.method?.replace("_", " ") || "UNKNOWN"}
                        </Badge>
                      </td>
                      <td className="px-8 py-5 text-right">
                        {!record.clockOut && (
                          <Button 
                            variant="outline" 
                            className="h-10 rounded-lg font-bold border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-95"
                            onClick={() => clockOutMutation.mutate(record.id)}
                            disabled={clockOutMutation.isPending}
                          >
                            {clockOutMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
                            Clock Out
                          </Button>
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
    </div>
  );
}