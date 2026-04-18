/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskService } from "@/services/task.services";
import { ProjectMemberService } from "@/services/projectMember.services"; // 👉 Added to fetch the team!
import { TaskStatus, TaskPriority } from "@/types/enums.types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, MoreHorizontal, User, UserMinus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

export default function TasksTab({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>(TaskPriority.MEDIUM);
  const [assignedTo, setAssignedTo] = useState<string>("unassigned"); // 👉 New Assignee State

  // 1. Fetch Tasks
  const { data: tasksResponse, isLoading: isTasksLoading } = useQuery({
    queryKey: ["project-tasks", projectId],
    queryFn: () => TaskService.getProjectTasks(projectId),
    enabled: !!projectId,
  });

  // 2. Fetch Project Team (so we can assign tasks to them!)
  const { data: teamResponse } = useQuery({
    queryKey: ["project-team", projectId],
    queryFn: () => ProjectMemberService.getProjectMembers(projectId),
    enabled: !!projectId,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: TaskService.createTask,
    onSuccess: () => {
      toast.success("Task created and assigned!");
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setPriority(TaskPriority.MEDIUM);
      setAssignedTo("unassigned");
    },
    onError: (error: any) => {
      // 👉 If a standard worker tries to create a task, the backend checkProjectRole will block it here!
      toast.error(error?.response?.data?.message || "Only Project/Site Managers can create tasks.");
    }
  });

  const statusMutation = useMutation({
    mutationFn: TaskService.updateTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: TaskService.deleteTask,
    onSuccess: () => {
      toast.success("Task deleted.");
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Only Project/Site Managers can delete tasks.");
    }
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    const payload: any = { projectId, title, description, priority };
    // 👉 Only attach 'assignedTo' if a specific user was selected
    if (assignedTo && assignedTo !== "unassigned") {
      payload.assignedTo = assignedTo;
    }
    
    createMutation.mutate(payload);
  };

  const tasks = tasksResponse?.data?.data || tasksResponse?.data || [];
  const teamMembers = teamResponse?.data || [];

  // Group tasks by status for the Kanban board
  const columns = [
    { id: TaskStatus.TODO, label: "To Do", color: "bg-zinc-100 dark:bg-zinc-800" },
    { id: TaskStatus.IN_PROGRESS, label: "In Progress", color: "bg-blue-50 dark:bg-blue-900/20" },
    { id: TaskStatus.IN_REVIEW, label: "In Review", color: "bg-amber-50 dark:bg-amber-900/20" },
    { id: TaskStatus.DONE, label: "Done", color: "bg-green-50 dark:bg-green-900/20" },
  ];

  if (isTasksLoading) {
    return <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Task Board</h2>
          <p className="text-muted-foreground text-sm">Manage, assign, and track project activities.</p>
        </div>

        {/* CREATE TASK MODAL */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-2" /> New Task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create & Assign Task</DialogTitle>
              <DialogDescription>Only Site Managers and Project Managers can assign tasks.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-2">
                <Label>Task Title *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Pour concrete foundation" required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Task details..." />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                    <SelectContent>
                      {Object.values(TaskPriority).map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* 👉 NEW: ASSIGNEE DROPDOWN */}
                <div className="space-y-2">
                  <Label>Assign To</Label>
                  <Select value={assignedTo} onValueChange={setAssignedTo}>
                    <SelectTrigger><SelectValue placeholder="Select worker..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Leave Unassigned</SelectItem>
                      {teamMembers.map((member: any) => (
                        <SelectItem key={member.user.id} value={member.user.id}>
                          {member.user.name} ({member.role.replace("_", " ")})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={createMutation.isPending || !title}>
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Save Task"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* KANBAN COLUMNS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {columns.map((col) => (
          <div key={col.id} className={`p-4 rounded-xl border ${col.color} min-h-[400px]`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">{col.label}</h3>
              <Badge variant="secondary" className="bg-white/50 dark:bg-black/20">
                {tasks.filter((t: any) => t.status === col.id).length}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {tasks.filter((t: any) => t.status === col.id).map((task: any) => (
                <Card key={task.id} className="shadow-sm border-zinc-200/60 dark:border-zinc-800/60">
                  <CardHeader className="p-3 pb-0 flex flex-row items-start justify-between">
                    <Badge variant="outline" className={`text-[10px] ${task.priority === 'HIGH' || task.priority === 'URGENT' ? 'text-red-500 border-red-200' : ''}`}>
                      {task.priority}
                    </Badge>
                    
                    {/* TASK ACTIONS */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2"><MoreHorizontal className="h-4 w-4 text-zinc-400" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Move to...</div>
                        {columns.filter(c => c.id !== task.status).map(c => (
                          <DropdownMenuItem 
                            key={c.id} 
                            onClick={() => statusMutation.mutate({ taskId: task.id, data: { projectId, status: c.id } })}
                          >
                            {c.label}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive" 
                          onClick={() => deleteMutation.mutate(task.id)}
                        >
                          Delete Task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>

                  <CardContent className="p-3">
                    <p className="font-medium text-sm leading-tight">{task.title}</p>
                    {task.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>}
                    
                    {/* 👉 NEW: SHOW ASSIGNED WORKER */}
                    <div className="pt-3 mt-2 border-t dark:border-zinc-800">
                      {task.assignee ? (
                        <div className="flex items-center text-xs font-medium text-blue-600 dark:text-blue-400">
                          <User className="h-3 w-3 mr-1" /> {task.assignee.name}
                        </div>
                      ) : (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <UserMinus className="h-3 w-3 mr-1" /> Unassigned
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}