/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskService } from "@/services/task.services";
import { ProjectMemberService } from "@/services/projectMember.services";
import { TaskStatus, TaskPriority } from "@/types/enums.types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, MoreHorizontal, User, UserMinus, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const STATUSES = Object.values(TaskStatus);

export default function TasksTab({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<string>(TaskPriority.MEDIUM);
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>("UNASSIGNED");
  const [newTaskDueDate, setNewTaskDueDate] = useState<string>("");

  const { data: response, isLoading } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => TaskService.getProjectTasks(projectId),
  });

  const { data: teamResponse } = useQuery({
    queryKey: ["project-team", projectId],
    queryFn: () => ProjectMemberService.getProjectMembers(projectId),
  });

  const createMutation = useMutation({
    mutationFn: TaskService.createTask,
    onSuccess: () => {
      toast.success("Task created successfully!");
      setIsModalOpen(false);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskPriority(TaskPriority.MEDIUM);
      setNewTaskAssignee("UNASSIGNED");
      setNewTaskDueDate(""); 
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: FormData }) => TaskService.updateTask({ taskId, data }),
    onSuccess: () => {
      toast.success("Task status updated!");
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    const payload: any = { title: newTaskTitle, description: newTaskDescription, projectId, priority: newTaskPriority };
    if (newTaskAssignee !== "UNASSIGNED") payload.assignedTo = newTaskAssignee;
    if (newTaskDueDate) payload.dueDate = new Date(newTaskDueDate).toISOString();
    createMutation.mutate(payload);
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    const fd = new FormData();
    fd.append("projectId", projectId);
    fd.append("status", newStatus);
    updateStatusMutation.mutate({ taskId, data: fd });
  };

  const tasks = response?.data?.data || response?.data || [];
  const team = teamResponse?.data || [];

  const groupedTasks = {
    [TaskStatus.TODO]: tasks.filter((t: any) => t.status === TaskStatus.TODO),
    [TaskStatus.IN_PROGRESS]: tasks.filter((t: any) => t.status === TaskStatus.IN_PROGRESS),
    [TaskStatus.IN_REVIEW]: tasks.filter((t: any) => t.status === TaskStatus.IN_REVIEW),
    [TaskStatus.DONE]: tasks.filter((t: any) => t.status === TaskStatus.DONE),
  };

  if (isLoading) return <div className="flex min-h-[40vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h3 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Project Tasks</h3>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1 font-medium">
            Manage and assign duties for this specific site.
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="h-12 px-6 rounded-xl font-bold bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 shadow-md transition-all active:scale-95">
              <Plus className="h-5 w-5 mr-2" /> Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] p-8 rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Create New Task</DialogTitle>
              <DialogDescription>Assign a new duty to a team member on this project.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTask} className="space-y-5 pt-4">
              <div className="space-y-2">
                <Label className="font-bold">Task Title *</Label>
                <Input className="h-12 rounded-xl bg-slate-50 dark:bg-zinc-950" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold">Priority</Label>
                  <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-zinc-950"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                      <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                      <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                      <SelectItem value={TaskPriority.URGENT}>Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Assignee</Label>
                  <Select value={newTaskAssignee} onValueChange={setNewTaskAssignee}>
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-zinc-950"><SelectValue placeholder="Assign to..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNASSIGNED" className="italic">Leave Unassigned</SelectItem>
                      {team.map((m: any) => (<SelectItem key={m.userId} value={m.userId}>{m.user?.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold">Deadline / Due Date (Optional)</Label>
                <Input type="date" className="h-12 rounded-xl bg-slate-50 dark:bg-zinc-950" value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label className="font-bold">Description</Label>
                <Textarea className="rounded-xl bg-slate-50 dark:bg-zinc-950 min-h-[100px]" value={newTaskDescription} onChange={(e) => setNewTaskDescription(e.target.value)} />
              </div>

              <Button type="submit" className="w-full h-12 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white mt-4" disabled={createMutation.isPending || !newTaskTitle}>
                {createMutation.isPending ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : "Create Task"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* KANBAN BOARD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {STATUSES.map((status) => (
          <div key={status} className="bg-slate-50/50 dark:bg-zinc-900/50 p-4 rounded-[2rem] border border-slate-200/50 dark:border-zinc-800/50">
            <div className="flex items-center justify-between mb-4 px-2 pt-2">
              <h4 className="font-extrabold text-sm tracking-wide uppercase text-zinc-500 dark:text-zinc-400">
                {status.replace("_", " ")}
              </h4>
              <Badge className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-slate-200 dark:border-zinc-700">
                {groupedTasks[status as TaskStatus].length}
              </Badge>
            </div>
            <div className="space-y-4">
              {groupedTasks[status as TaskStatus].map((task: any) => (
                <Card key={task.id} className="shadow-sm border-slate-200 dark:border-zinc-800 rounded-[1.5rem] bg-white dark:bg-zinc-950 hover:shadow-md transition-all">
                  <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between space-y-0">
                    <Badge className={cn("px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest shadow-none border-0", 
                      task.priority === "URGENT" ? "bg-red-100 text-red-700 dark:bg-red-900/40" : 
                      task.priority === "HIGH" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40" : 
                      "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-400")}>
                      {task.priority}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        {STATUSES.map((s) => (
                          <DropdownMenuItem key={s} disabled={task.status === s || updateStatusMutation.isPending} onClick={() => handleStatusChange(task.id, s as TaskStatus)} className="font-medium">
                            Move to {s.replace("_", " ")}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="p-5 pt-0">
                    <p className="font-bold text-base leading-tight text-zinc-900 dark:text-white">{task.title}</p>
                    {task.description && <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2">{task.description}</p>}
                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-zinc-800 space-y-2.5">
                      {task.assignee ? (
                        <div className="flex items-center text-xs font-bold text-blue-600 dark:text-blue-400"><User className="h-3.5 w-3.5 mr-1.5" /> {task.assignee.name}</div>
                      ) : (
                        <div className="flex items-center text-xs font-medium text-zinc-400"><UserMinus className="h-3.5 w-3.5 mr-1.5" /> Unassigned</div>
                      )}
                      {task.dueDate && (
                        <div className={cn("flex items-center text-xs font-bold", new Date(task.dueDate) < new Date() && task.status !== "DONE" ? "text-red-500" : "text-zinc-500")}>
                          <Calendar className="h-3.5 w-3.5 mr-1.5" /> Due: {new Date(task.dueDate).toLocaleDateString()}
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