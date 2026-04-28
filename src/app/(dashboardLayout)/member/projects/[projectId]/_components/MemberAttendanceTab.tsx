/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AttendanceService } from "@/services/attendance.services";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, LogOut, CheckCircle2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function MemberAttendanceTab({ projectId }: { projectId: string, myRole: string }) {
  const queryClient = useQueryClient();
  const { data: todayAttendance, isLoading } = useQuery({
    queryKey: ["my-attendance-today", projectId],
    queryFn: () => AttendanceService.getMyTodayAttendance(projectId), 
  });

  const record = todayAttendance?.data;

  const clockInMutation = useMutation({
    mutationFn: () => AttendanceService.clockIn({ projectId, method: "MANUAL" }),
    onSuccess: () => {
      toast.success("Successfully clocked in!");
      queryClient.invalidateQueries({ queryKey: ["my-attendance-today", projectId] });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: (attendanceId: string) => AttendanceService.clockOut(attendanceId),
    onSuccess: () => {
      toast.success("Shift completed. Clocked out!");
      queryClient.invalidateQueries({ queryKey: ["my-attendance-today", projectId] });
    },
  });

  if (isLoading) return <div className="flex py-20 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto mt-4">
      <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden text-center">
        <CardHeader className="p-8 border-b bg-slate-50/50 dark:bg-zinc-900/10">
          <CardTitle className="text-2xl font-bold tracking-tight">Site Timecard</CardTitle>
          <CardDescription className="text-base font-medium">Official daily log for payroll verification.</CardDescription>
        </CardHeader>
        <CardContent className="p-12 flex flex-col items-center space-y-8">
          
          {!record && (
            <>
              <div className="h-32 w-32 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center border-4 border-white dark:border-zinc-950 shadow-xl ring-1 ring-slate-200 dark:ring-zinc-800">
                <Clock className="h-12 w-12 text-zinc-400" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">Ready for shift?</p>
                <p className="text-zinc-500 font-medium">You haven&apos;t clocked in for today yet.</p>
              </div>
              <Button 
                size="lg" 
                className="h-16 px-12 rounded-2xl text-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)] transition-all active:scale-95"
                onClick={() => clockInMutation.mutate()}
                disabled={clockInMutation.isPending}
              >
                {clockInMutation.isPending ? <Loader2 className="mr-2 animate-spin" /> : <Clock className="mr-2" />}
                Clock In Now
              </Button>
            </>
          )}

          {record && !record.clockOut && (
            <>
              <div className="h-32 w-32 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border-4 border-white dark:border-zinc-950 shadow-xl ring-1 ring-blue-200 dark:ring-blue-800 animate-pulse">
                <Clock className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-extrabold text-blue-700 dark:text-blue-400">Shift Active</p>
                <div className="flex items-center justify-center gap-2 text-zinc-500 font-bold bg-slate-50 dark:bg-zinc-800 px-4 py-2 rounded-full border">
                   <Calendar className="h-4 w-4" /> Started at {new Date(record.clockIn).toLocaleTimeString()}
                </div>
              </div>
              <Button 
                size="lg" 
                variant="destructive"
                className="h-16 px-12 rounded-2xl text-lg font-bold shadow-[0_8px_20px_-6px_rgba(239,68,68,0.5)] active:scale-95 transition-all"
                onClick={() => clockOutMutation.mutate(record.id)}
                disabled={clockOutMutation.isPending}
              >
                {clockOutMutation.isPending ? <Loader2 className="mr-2 animate-spin" /> : <LogOut className="mr-2" />}
                End Shift
              </Button>
            </>
          )}

          {record && record.clockOut && (
            <>
              <div className="h-32 w-32 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center border-4 border-white dark:border-zinc-950 shadow-xl ring-1 ring-emerald-200 dark:ring-emerald-800">
                <CheckCircle2 className="h-14 w-14 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">Shift Complete</p>
                <p className="text-zinc-600 dark:text-zinc-400 text-lg font-bold">Total Work: <span className="text-zinc-900 dark:text-white px-2 py-1 bg-slate-100 dark:bg-zinc-800 rounded-lg">{record.hoursWorked} hrs</span></p>
              </div>
            </>
          )}

        </CardContent>
      </Card>
    </motion.div>
  );
}