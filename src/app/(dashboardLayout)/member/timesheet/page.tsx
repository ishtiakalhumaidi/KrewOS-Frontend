/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AttendanceService } from "@/services/attendance.services";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Clock, HardHat, CalendarDays, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

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
    <div className="space-y-6">
      {/* HEADER & FILTERS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Timesheet</h1>
          <p className="text-muted-foreground mt-1">Review your logged hours and completed shifts.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-zinc-950 p-2 rounded-lg border shadow-sm">
          <CalendarDays className="h-5 w-5 text-muted-foreground ml-2" />
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px] border-none shadow-none focus:ring-0">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800" />
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px] border-none shadow-none focus:ring-0">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center border rounded-xl bg-white dark:bg-zinc-900">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* STAT SUMMARY CARDS */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-l-4 border-l-blue-500 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Hours Worked</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.totalHoursWorked || 0} <span className="text-lg font-normal text-muted-foreground">hrs</span></div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Shifts Completed</CardTitle>
                <Calendar className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats?.totalShiftsCompleted || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* DETAILED LOGS TABLE */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Shift History</CardTitle>
              <CardDescription>Detailed logs for {MONTHS[Number(selectedMonth) - 1]} {selectedYear}.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center bg-zinc-50 dark:bg-zinc-900/50">
                  <Clock className="h-8 w-8 text-zinc-300 mb-2" />
                  <h3 className="font-semibold text-lg">No shifts found</h3>
                  <p className="text-muted-foreground text-sm">You have no logged hours for this month.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 border-y border-zinc-200 dark:border-zinc-800">
                      <tr>
                        <th className="px-6 py-3 font-medium">Date</th>
                        <th className="px-6 py-3 font-medium">Site/Project</th>
                        <th className="px-6 py-3 font-medium">Clock In</th>
                        <th className="px-6 py-3 font-medium">Clock Out</th>
                        <th className="px-6 py-3 font-medium text-right">Hours</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {logs.map((log: any) => (
                        <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                          <td className="px-6 py-4 font-medium">
                            {new Date(log.clockIn).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <HardHat className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="font-medium">{log.project?.name || "Unknown Site"}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                            {new Date(log.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                            {log.clockOut ? (
                              new Date(log.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            ) : (
                              <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">Active Shift</Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right font-bold">
                            {log.hoursWorked ? `${log.hoursWorked} hrs` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}