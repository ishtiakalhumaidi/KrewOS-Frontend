/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskService } from "@/services/task.services";
import { TaskStatus } from "@/types/enums.types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2, CheckCircle2, Clock, AlertCircle, Calendar, Search, 
  ListFilter, PlayCircle, FilterX, Flag 
} from "lucide-react";
import { toast } from "sonner";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, 
  DropdownMenuLabel, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const STATUSES = Object.values(TaskStatus);

export default function MemberTasksTab({ projectId, myRole }: { projectId: string; myRole: string }) {
  const queryClient = useQueryClient();
  const isManager = myRole === "SITE_MANAGER" || myRole === "PROJECT_MANAGER";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("ALL");
  const [dueDateFilter, setDueDateFilter] = useState("");

  const { data: response, isLoading } = useQuery({
    queryKey: ["tasks", projectId, myRole],
    queryFn: () => isManager ? TaskService.getProjectTasks(projectId) : TaskService.getMyTasks(projectId),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: FormData }) => TaskService.updateTask({taskId, data}),
    onSuccess: () => {
      toast.success("Task status updated!");
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update task.");
    }
  });

  const handleStatusChange = (taskId: string, projId: string, newStatus: TaskStatus) => {
    const fd = new FormData();
    fd.append("status", newStatus);
    fd.append("projectId", projId);
    updateStatusMutation.mutate({ taskId, data: fd });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedPriority("ALL");
    setDueDateFilter("");
  };

  let tasks = response?.data?.data || response?.data || [];
  if (!isManager) tasks = tasks.filter((t: any) => t.projectId === projectId);

  if (searchQuery) {
    tasks = tasks.filter((t: any) => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  if (selectedPriority !== "ALL") tasks = tasks.filter((t: any) => t.priority === selectedPriority);
  if (dueDateFilter) tasks = tasks.filter((t: any) => t.dueDate && new Date(t.dueDate).toISOString().split("T")[0] === dueDateFilter);

  const groupedTasks = {
    [TaskStatus.TODO]: tasks.filter((t: any) => t.status === TaskStatus.TODO),
    [TaskStatus.IN_PROGRESS]: tasks.filter((t: any) => t.status === TaskStatus.IN_PROGRESS),
    [TaskStatus.IN_REVIEW]: tasks.filter((t: any) => t.status === TaskStatus.IN_REVIEW),
    [TaskStatus.DONE]: tasks.filter((t: any) => t.status === TaskStatus.DONE),
  };

  const isFiltering = searchQuery || selectedPriority !== "ALL" || dueDateFilter;

  if (isLoading) return <div className="flex py-32 justify-center items-center"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>;

  return (
    <div className="mt-4 space-y-8">
      
      {/* ─── Premium 2-Tier Filter Panel (Consistent with Global Tasks) ─── */}
      <div className="bg-white/80 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/60 p-5 rounded-[2rem] shadow-sm backdrop-blur-md flex flex-col gap-4">
        
        {/* Label (Optional: Keep it if you want the exact Global match) */}
        <div className="flex justify-between items-center w-full">
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 flex items-center px-2">
            <ListFilter className="w-4 h-4 mr-2"/> Filters
          </h3>
        </div>

        {/* Tier 1: Search & Clear */}
        <div className="flex flex-col md:flex-row items-center gap-4 w-full">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <Input 
              placeholder="Search site tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 rounded-2xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:ring-blue-500 font-medium w-full text-base transition-all"
            />
          </div>
          {isFiltering && (
            <Button 
              variant="ghost" 
              onClick={clearFilters} 
              className="h-14 px-6 rounded-2xl text-red-600 font-bold border border-transparent hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95 transition-all shrink-0"
            >
              <FilterX className="w-4 h-4 mr-2" /> Clear
            </Button>
          )}
        </div>

        {/* Tier 2: 2-Column Dropdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-2/3 xl:w-1/2">
          
          {/* Priority Select */}
          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className=" rounded-2xl p-4 py-7 dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:ring-blue-500 font-medium w-full text-base">
              <SelectValue placeholder="Priority Level" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-200 dark:border-zinc-800">
              <SelectItem value="ALL" className="py-3 font-medium">All Priorities</SelectItem>
              <SelectItem value="URGENT" className="py-3 font-bold text-red-600">Urgent</SelectItem>
              <SelectItem value="HIGH" className="py-3 font-bold text-orange-600">High</SelectItem>
              <SelectItem value="MEDIUM" className="py-3 font-bold text-amber-600">Medium</SelectItem>
              <SelectItem value="LOW" className="py-3 font-medium text-slate-600">Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Input */}
          <div className="relative w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">Due</span>
            <Input 
              type="date" 
              value={dueDateFilter} 
              onChange={(e) => setDueDateFilter(e.target.value)} 
              className="pl-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:ring-blue-500 font-medium w-full text-base transition-all text-zinc-600 dark:text-zinc-300"
            />
          </div>

        </div>
      </div>

      {/* ─── Task Board ─── */}
      {tasks.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 text-center flex flex-col items-center border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] bg-white dark:bg-zinc-900 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 dark:bg-zinc-800 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner border border-slate-100 dark:border-zinc-700/50">
            <CheckCircle2 className="w-10 h-10 text-zinc-300 dark:text-zinc-500" />
          </div>
          <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">No Site Tasks</h3>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-2 max-w-sm">
            {isFiltering ? "No tasks match your current filters." : "You have no assignments on this project site."}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start pb-10">
          {Object.entries(groupedTasks).map(([status, list]: any) => (
            <div key={status} className="space-y-6">
              
              {/* Column Header */}
              <div className={cn(
                "flex items-center justify-between border-b-2 pb-4", 
                status === "IN_PROGRESS" ? "border-blue-500" : 
                status === "DONE" ? "border-emerald-500" : 
                status === "IN_REVIEW" ? "border-purple-500" : "border-zinc-200 dark:border-zinc-800"
              )}>
                <h3 className="font-extrabold text-sm tracking-widest uppercase text-zinc-900 dark:text-zinc-100">{status.replace("_", " ")}</h3>
                <Badge variant="secondary" className="font-bold rounded-lg px-2 shadow-sm">{list.length}</Badge>
              </div>
              
              {/* Task Cards */}
              <div className="space-y-4">
                {list.map((task: any) => {
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";
                  
                  return (
                    <motion.div key={task.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                      <Card className="rounded-[1.5rem] border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all bg-white dark:bg-zinc-900">
                        <CardHeader className="p-5 pb-3">
                          <div className="flex justify-between items-start mb-3">
                            <Badge className={cn(
                              "px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-tighter border-0 shadow-none", 
                              task.priority === "URGENT" ? "bg-red-100 text-red-700 dark:bg-red-900/40" : 
                              task.priority === "HIGH" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40" : 
                              "bg-slate-100 text-slate-700 dark:bg-zinc-800"
                            )}>
                              <Flag className="w-2.5 h-2.5 mr-1" strokeWidth={3} /> {task.priority}
                            </Badge>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-12 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-[10px] font-bold uppercase tracking-widest" disabled={updateStatusMutation.isPending}>
                                  Move
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-2xl p-2 w-52 shadow-xl border-slate-200 dark:border-zinc-800">
                                <DropdownMenuLabel className="text-[10px] uppercase font-bold text-zinc-400 px-3 py-2">Set Task Status</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-50 dark:bg-zinc-800" />
                                {STATUSES.map((s) => (
                                  <DropdownMenuItem 
                                    key={s} 
                                    disabled={task.status === s || updateStatusMutation.isPending} 
                                    onClick={() => handleStatusChange(task.id, task.projectId, s as TaskStatus)} 
                                    className="font-bold py-2.5 px-3 cursor-pointer rounded-xl transition-colors focus:bg-blue-50 dark:focus:bg-blue-900/20 focus:text-blue-600 dark:focus:text-blue-400"
                                  >
                                    {s === "DONE" && <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />}
                                    {s === "IN_PROGRESS" && <PlayCircle className="w-4 h-4 mr-2 text-blue-500" />}
                                    {s === "IN_REVIEW" && <Search className="w-4 h-4 mr-2 text-purple-500" />}
                                    {s === "TODO" && <Clock className="w-4 h-4 mr-2 text-zinc-400" />}
                                    {s.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <CardTitle className="text-base font-bold leading-tight text-zinc-900 dark:text-zinc-100">{task.title}</CardTitle>
                        </CardHeader>
                        
                        <CardContent className="p-5 pt-0 space-y-4">
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-medium">{task.description}</p>
                          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-col gap-2">
                            {task.dueDate && (
                              <div className={cn(
                                "flex items-center text-[10px] font-extrabold uppercase tracking-widest", 
                                isOverdue ? "text-red-500" : "text-zinc-400"
                              )}>
                                {isOverdue ? <AlertCircle className="w-3 h-3 mr-1.5" /> : <Calendar className="w-3 h-3 mr-1.5 opacity-70" />}
                                {isOverdue ? "Overdue" : "Due"} {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            )}
                            <div className="flex items-center text-[10px] font-bold text-zinc-300 dark:text-zinc-600 uppercase tracking-widest">
                              <Clock className="w-3 h-3 mr-1.5" /> Created {new Date(task.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}