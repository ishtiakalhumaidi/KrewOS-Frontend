/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskService } from "@/services/task.services";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Clock, MapPin, AlertCircle, Calendar, ArrowRightCircle } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

const STATUSES = ["TODO", "IN_PROGRESS", "COMPLETED", "BLOCKED"];

export default function MyTasksPage() {
  const queryClient = useQueryClient();

  // 1. Fetch worker's assigned tasks
  const { data: response, isLoading } = useQuery({
    queryKey: ["my-tasks"],
    queryFn: TaskService.getMyTasks,
  });

  // 2. Mutation to change task status
  const updateStatusMutation = useMutation({
    mutationFn: TaskService.updateTask,
    onSuccess: () => {
      toast.success("Task status updated!");
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update task.");
    }
  });

  // Helper to trigger the status update (Requires projectId for backend auth!)
  const handleStatusChange = (taskId: string, projectId: string, newStatus: string) => {
    updateStatusMutation.mutate({
      taskId,
      data: { projectId, status: newStatus }
    });
  };

  // Extract tasks (QueryBuilder usually nests it in response.data.data)
  const tasks = response?.data?.data || response?.data || [];

  // Group tasks by status for the Kanban lanes
  const groupedTasks = {
    TODO: tasks.filter((t: any) => t.status === "TODO"),
    IN_PROGRESS: tasks.filter((t: any) => t.status === "IN_PROGRESS"),
    COMPLETED: tasks.filter((t: any) => t.status === "COMPLETED"),
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT": return <Badge className="bg-red-600 hover:bg-red-700">Urgent</Badge>;
      case "HIGH": return <Badge className="bg-orange-500 hover:bg-orange-600">High</Badge>;
      case "MEDIUM": return <Badge variant="secondary" className="text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-500">Medium</Badge>;
      default: return <Badge variant="outline" className="text-zinc-500">Low</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
        <p className="text-muted-foreground mt-1">Manage your assigned duties across all project sites.</p>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-xl bg-zinc-50 dark:bg-zinc-900/50">
          <CheckCircle2 className="h-12 w-12 text-zinc-300 mb-4" />
          <h3 className="font-semibold text-lg">You're all caught up!</h3>
          <p className="text-muted-foreground text-sm max-w-sm mt-1">
            You currently have no tasks assigned to you. Enjoy the downtime!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* LANE 1: TO DO */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-zinc-200 dark:border-zinc-800 pb-2">
              <h3 className="font-bold text-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-zinc-400" /> To Do
              </h3>
              <Badge variant="secondary">{groupedTasks.TODO.length}</Badge>
            </div>
            {groupedTasks.TODO.map((task: any) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onStatusChange={handleStatusChange} 
                isUpdating={updateStatusMutation.isPending} 
                getPriorityBadge={getPriorityBadge} 
              />
            ))}
          </div>

          {/* LANE 2: IN PROGRESS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-blue-200 dark:border-blue-900 pb-2">
              <h3 className="font-bold text-lg flex items-center text-blue-700 dark:text-blue-400">
                <Clock className="w-5 h-5 mr-2" /> In Progress
              </h3>
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">{groupedTasks.IN_PROGRESS.length}</Badge>
            </div>
            {groupedTasks.IN_PROGRESS.map((task: any) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onStatusChange={handleStatusChange} 
                isUpdating={updateStatusMutation.isPending} 
                getPriorityBadge={getPriorityBadge} 
              />
            ))}
          </div>

          {/* LANE 3: COMPLETED */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-green-200 dark:border-green-900 pb-2">
              <h3 className="font-bold text-lg flex items-center text-green-700 dark:text-green-400">
                <CheckCircle2 className="w-5 h-5 mr-2" /> Completed
              </h3>
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400">{groupedTasks.COMPLETED.length}</Badge>
            </div>
            {groupedTasks.COMPLETED.map((task: any) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onStatusChange={handleStatusChange} 
                isUpdating={updateStatusMutation.isPending} 
                getPriorityBadge={getPriorityBadge} 
              />
            ))}
          </div>

        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// Reusable Task Card Component for the Lanes
// ----------------------------------------------------
function TaskCard({ task, onStatusChange, isUpdating, getPriorityBadge }: any) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow cursor-default border-zinc-200 dark:border-zinc-800">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start mb-1">
          {getPriorityBadge(task.priority)}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs border bg-zinc-50 dark:bg-zinc-900">
                Move <ArrowRightCircle className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Update Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {STATUSES.map(status => (
                <DropdownMenuItem 
                  key={status} 
                  disabled={task.status === status || isUpdating}
                  onClick={() => onStatusChange(task.id, task.projectId, status)}
                >
                  {status.replace("_", " ")}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
        <CardTitle className="text-base font-bold leading-tight">{task.title}</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 space-y-3">
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
        )}
        
        <div className="pt-2 border-t dark:border-zinc-800 space-y-1">
          <div className="flex items-center text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <MapPin className="w-3 h-3 mr-1" /> {task.project?.name || "Unknown Site"}
          </div>
          
          {task.dueDate && (
            <div className={`flex items-center text-xs font-medium ${
              new Date(task.dueDate) < new Date() && task.status !== "COMPLETED" 
                ? "text-red-600 dark:text-red-400" 
                : "text-zinc-500"
            }`}>
              <Calendar className="w-3 h-3 mr-1" /> Due: {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}