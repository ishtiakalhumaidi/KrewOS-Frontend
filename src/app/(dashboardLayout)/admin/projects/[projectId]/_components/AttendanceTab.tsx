/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AttendanceService } from "@/services/attendance.services";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, UserCheck, LogOut, MapPin, AlertCircle } from "lucide-react";

export default function AttendanceTab({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();

  // Fetch Today's Attendance Log
  const { data: response, isLoading } = useQuery({
    queryKey: ["project-attendance", projectId],
    queryFn: () => AttendanceService.getTodayAttendance(projectId),
    enabled: !!projectId,
  });

  // Clock In Mutation
  const clockInMutation = useMutation({
    mutationFn: AttendanceService.clockIn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project-attendance", projectId] }),
  });

  // Clock Out Mutation
  const clockOutMutation = useMutation({
    mutationFn: AttendanceService.clockOut,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project-attendance", projectId] }),
  });

  const handleClockIn = () => {
    clockInMutation.mutate({ 
      projectId, 
      method: "MANUAL" 
    });
  };

  const records = response?.data || [];

  if (isLoading) {
    return <div className="flex h-40 items-center justify-center border rounded-xl"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      
      {/* ACTION CARD: CLOCK IN / ERRORS */}
      <Card className="shadow-sm border-blue-100 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-950/10">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" /> My Attendance Status
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Clock in to record your hours for today's shift on this site.
              </p>
            </div>
            
            <Button 
              onClick={handleClockIn} 
              disabled={clockInMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
            >
              {clockInMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserCheck className="h-4 w-4 mr-2" />}
              Clock Me In
            </Button>
          </div>

          {/* 👉 THE NEW DYNAMIC ERROR CATCHER STANDARD */}
          {clockInMutation.isError && (
            <div className="mt-4 flex items-center text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
              <AlertCircle className="h-4 w-4 mr-2" />
              {(clockInMutation.error as any)?.response?.data?.message || "Failed to clock in."}
            </div>
          )}
          {clockOutMutation.isError && (
            <div className="mt-4 flex items-center text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
              <AlertCircle className="h-4 w-4 mr-2" />
              {(clockOutMutation.error as any)?.response?.data?.message || "Failed to clock out."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* TODAY's ROSTER TABLE */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Today's Site Roster</CardTitle>
          <CardDescription>Live view of all personnel currently clocked into this project.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center bg-zinc-50 dark:bg-zinc-900/50">
              <UserCheck className="h-8 w-8 text-zinc-400 mb-2" />
              <h3 className="font-semibold text-lg">No workers on site yet</h3>
              <p className="text-muted-foreground text-sm">Personnel will appear here once they clock in.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 border-y border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-3 font-medium">Worker Name</th>
                    <th className="px-6 py-3 font-medium">Time In</th>
                    <th className="px-6 py-3 font-medium">Time Out</th>
                    <th className="px-6 py-3 font-medium">Method</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {records.map((record: any) => (
                    <tr key={record.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                      <td className="px-6 py-4 font-medium flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mr-3 text-xs">
                          {record.user?.name?.charAt(0) || "U"}
                        </div>
                        {record.user?.name || "Unknown Worker"}
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300 font-medium">
                        {new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4">
                        {record.clockOut ? (
                          <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                            {new Date(record.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            <span className="text-xs text-muted-foreground ml-2">({record.hoursWorked} hrs)</span>
                          </span>
                        ) : (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                            <span className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                            Active Now
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="text-[10px]">
                          {record.method?.replace("_", " ") || "UNKNOWN"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!record.clockOut && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => clockOutMutation.mutate(record.id)}
                            disabled={clockOutMutation.isPending}
                          >
                            {clockOutMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <LogOut className="h-3 w-3 mr-2" />}
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