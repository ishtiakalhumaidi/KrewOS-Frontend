/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MemberPortalService } from "@/services/memberPortal.services";
import { TaskService } from "@/services/task.services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function MyTasksPage() {
  const queryClient = useQueryClient();

  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: ["my-tasks"],
    queryFn: MemberPortalService.getMyTasks,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status, projectId }: any) => 
      TaskService.updateTask({ taskId, data: { status, projectId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-tasks"] }),
  });

  const tasks = response?.data || [];

  if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Work Orders</h1>
        <p className="text-muted-foreground">Focus on your assigned tasks across all active sites.</p>
      </div>

      {isError && (
        <div className="p-4 text-sm font-medium text-destructive bg-destructive/10 rounded-md">
          {(error as any)?.response?.data?.message || "Failed to load your tasks."}
        </div>
      )}

      <div className="grid gap-4">
        {tasks.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <CheckCircle2 className="mx-auto h-12 w-12 text-zinc-300" />
            <p className="mt-4 text-zinc-500">You're all caught up! No tasks assigned.</p>
          </Card>
        ) : (
          tasks.map((task: any) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={task.priority === "URGENT" ? "destructive" : "outline"}>
                      {task.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{task.project?.name}</span>
                  </div>
                  <h3 className="font-bold text-lg">{task.title}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{task.description}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  {task.status !== "DONE" ? (
                    <button 
                      onClick={() => updateStatusMutation.mutate({ 
                        taskId: task.id, 
                        status: "DONE", 
                        projectId: task.projectId 
                      })}
                      className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-4 py-2 rounded-full hover:bg-green-100 transition-colors"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Done
                    </button>
                  ) : (
                    <Badge className="bg-green-500">Completed</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}