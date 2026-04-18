/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskService } from "@/services/task.services";
import { TaskStatus, TaskPriority } from "@/types/enums.types";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, GripVertical, Clock, MoreHorizontal } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TasksTab({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>(TaskPriority.MEDIUM);

  // Fetch Tasks
  const { data: tasksResponse, isLoading } = useQuery({
    queryKey: ["project-tasks", projectId],
    queryFn: () => TaskService.getProjectTasks(projectId),
    enabled: !!projectId,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: TaskService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] });
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setPriority(TaskPriority.MEDIUM);
    },
  });

  const statusMutation = useMutation({
    mutationFn: TaskService.updateTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: TaskService.deleteTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] }),
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    createMutation.mutate({ projectId, title, description, priority });
  };

  const tasks = tasksResponse?.data || [];

  // Group tasks by status for the Kanban board
  const columns = [
    { id: TaskStatus.TODO, label: "To Do", color: "bg-zinc-100 dark:bg-zinc-800" },
    { id: TaskStatus.IN_PROGRESS, label: "In Progress", color: "bg-blue-50 dark:bg-blue-900/20" },
    { id: TaskStatus.IN_REVIEW, label: "In Review", color: "bg-amber-50 dark:bg-amber-900/20" },
    { id: TaskStatus.DONE, label: "Done", color: "bg-green-50 dark:bg-green-900/20" },
  ];

  if (isLoading) {
    return <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Task Board</h2>
          <p className="text-muted-foreground text-sm">Manage and track project activities.</p>
        </div>

        {/* CREATE TASK MODAL */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-2" /> New Task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Task</DialogTitle></DialogHeader>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-2">
                <Label>Task Title *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Pour concrete foundation" required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Task details..." />
              </div>
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
                     {/* 👉 Update this specific section inside your DropdownMenuContent */}
<DropdownMenuContent align="end">
  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Move to...</div>
  {columns.filter(c => c.id !== task.status).map(c => (
    <DropdownMenuItem 
      key={c.id} 
      // 👉 Notice we added `projectId` to the data object here!
      onClick={() => statusMutation.mutate({ taskId: task.id, data: { projectId, status: c.id } })}
    >
      {c.label}
    </DropdownMenuItem>
  ))}
  <DropdownMenuItem 
    className="text-destructive focus:text-destructive mt-2" 
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