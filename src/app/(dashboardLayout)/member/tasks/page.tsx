/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TaskService } from "@/services/task.services";
import { TaskStatus } from "@/types/enums.types";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2, CheckCircle2, MapPin, Calendar, Search, Settings2, 
  PlayCircle, AlertCircle, CheckSquare, ListFilter, FilterX, Clock, Flag
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, 
  DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const STATUSES = Object.values(TaskStatus);

export default function GlobalMyTasksPage() {
  const queryClient = useQueryClient();

  // --- FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [dueDateFilter, setDueDateFilter] = useState("");

  const { data: response, isLoading } = useQuery({
    queryKey: ["my-tasks"],
    queryFn: () => TaskService.getMyTasks(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string, data: FormData }) => TaskService.updateTask({taskId, data}),
    onSuccess: () => {
      toast.success("Task status updated!");
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] }); 
    },
    onError: (error: any) => {
      const errors = error?.response?.data?.errorSources;
      if (errors?.length) {
        errors.forEach((err: any) => toast.error(err.message));
      } else {
        toast.error(error?.response?.data?.message || "Failed to update task.");
      }
    }
  });

  const handleStatusChange = (taskId: string, projectId: string, newStatus: TaskStatus) => {
    const fd = new FormData();
    fd.append("status", newStatus);
    fd.append("projectId", projectId);
    updateStatusMutation.mutate({ taskId, data: fd });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setProjectFilter("ALL");
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
    setDueDateFilter("");
  };

  const allTasks = response?.data?.data || response?.data || [];

  // Extract unique projects for filter dropdown
  const uniqueProjects = Array.from(new Set(allTasks.map((t: any) => t.projectId)))
    .map(id => {
      const task = allTasks.find((t: any) => t.projectId === id);
      return { id: task.projectId, name: task.project?.name || "Unknown Site" };
    });

  // Apply Filters Client-Side
  let filteredTasks = [...allTasks];
  if (searchQuery) {
    filteredTasks = filteredTasks.filter((t: any) => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  if (projectFilter !== "ALL") filteredTasks = filteredTasks.filter((t: any) => t.projectId === projectFilter);
  if (statusFilter !== "ALL") filteredTasks = filteredTasks.filter((t: any) => t.status === statusFilter);
  if (priorityFilter !== "ALL") filteredTasks = filteredTasks.filter((t: any) => t.priority === priorityFilter);
  if (dueDateFilter) {
    filteredTasks = filteredTasks.filter((t: any) => t.dueDate && new Date(t.dueDate).toISOString().split("T")[0] === dueDateFilter);
  }

  const isFiltering = searchQuery || projectFilter !== "ALL" || statusFilter !== "ALL" || priorityFilter !== "ALL" || dueDateFilter;

  // --- PREMIUM BADGES ---
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT": return <Badge className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 shadow-none border-0"><Flag className="w-3 h-3 mr-1.5" /> Urgent</Badge>;
      case "HIGH": return <Badge className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 shadow-none border-0"><Flag className="w-3 h-3 mr-1.5" /> High</Badge>;
      case "MEDIUM": return <Badge className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 shadow-none border-0"><Flag className="w-3 h-3 mr-1.5" /> Medium</Badge>;
      default: return <Badge className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-400 shadow-none border-0"><Flag className="w-3 h-3 mr-1.5" /> Low</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DONE": return <Badge className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 shadow-none border-0 flex items-center w-fit"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5"/> Done</Badge>;
      case "IN_PROGRESS": return <Badge className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 shadow-none border-0 flex items-center w-fit"><PlayCircle className="w-3.5 h-3.5 mr-1.5"/> In Progress</Badge>;
      case "IN_REVIEW": return <Badge className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 shadow-none border-0 flex items-center w-fit"><Search className="w-3.5 h-3.5 mr-1.5"/> In Review</Badge>;
      default: return <Badge className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest bg-zinc-100 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 shadow-none border-0 flex items-center w-fit"><AlertCircle className="w-3.5 h-3.5 mr-1.5"/> To Do</Badge>;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 pt-4">
      
      {/* ─── Header Section ─── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-4 px-1">
        <div className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50 dark:border-blue-800/60 dark:bg-blue-900/30 px-4 py-1.5 text-sm font-bold tracking-wide text-blue-700 dark:text-blue-400 shadow-sm uppercase">
          <CheckSquare className="mr-2.5 h-4 w-4" /> Assignments
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Global Task List
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl leading-relaxed font-medium">
          A master view of all your assigned duties, priorities, and deadlines across every project site.
        </p>
      </motion.div>

      {/* ─── Master Directory Card ─── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
          
          <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/10 border-b border-slate-100 dark:border-zinc-800/50 p-8">
            <div className="flex flex-col gap-6">
              
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center">
                  <ListFilter className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-400" /> Filter Assignments
                </CardTitle>
                <CardDescription className="text-base font-medium mt-1">Narrow down your workload to focus on what matters.</CardDescription>
              </div>

              {/* 👉 THE NEW 2-TIER FILTER PANEL (Fixes all squishing issues) */}
              <div className="bg-white/60 dark:bg-zinc-950/60 border border-slate-200/60 dark:border-zinc-800/40 p-5 rounded-[2rem] shadow-sm backdrop-blur-md flex flex-col gap-4">
                
                {/* TIER 1: Search & Clear */}
                <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                  <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                    <Input 
                      placeholder="Search tasks by title or description..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-14 rounded-2xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:ring-blue-500 font-medium w-full text-base transition-all"
                    />
                  </div>
                  {isFiltering && (
                    <Button 
                      variant="ghost" 
                      onClick={clearFilters} 
                      className="h-14 px-6 rounded-2xl text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30 font-bold whitespace-nowrap shrink-0 transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/50"
                    >
                      <FilterX className="w-4 h-4 mr-2" /> Clear Filters
                    </Button>
                  )}
                </div>

                {/* TIER 2: 4-Column Dropdown Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
                  
                  {/* Project Select */}
                  <Select value={projectFilter} onValueChange={setProjectFilter}>
                    <SelectTrigger className=" py-7 rounded-2xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:ring-blue-500 font-medium w-full text-base transition-all">
                      <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200 dark:border-zinc-800">
                      <SelectItem value="ALL" className="py-3 font-medium">All Projects</SelectItem>
                      {uniqueProjects.map((p: any) => (
                        <SelectItem key={p.id} value={p.id} className="py-3 font-medium">{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Status Select */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="py-7 rounded-2xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:ring-blue-500 font-medium w-full text-base transition-all">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent className=" rounded-2xl border-slate-200 dark:border-zinc-800">
                      <SelectItem value="ALL" className="py-3 font-medium">All Statuses</SelectItem>
                      <SelectItem value="TODO" className="py-3 font-medium text-zinc-600 dark:text-zinc-400">To Do</SelectItem>
                      <SelectItem value="IN_PROGRESS" className="py-3 font-bold text-blue-600 dark:text-blue-400">In Progress</SelectItem>
                      <SelectItem value="IN_REVIEW" className="py-3 font-bold text-purple-600 dark:text-purple-400">In Review</SelectItem>
                      <SelectItem value="DONE" className="py-3 font-bold text-emerald-600 dark:text-emerald-400">Done</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Priority Select */}
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="py-7 rounded-2xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:ring-blue-500 font-medium w-full text-base transition-all">
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent className=" rounded-2xl border-slate-200 dark:border-zinc-800">
                      <SelectItem value="ALL" className="py-3 font-medium">All Priorities</SelectItem>
                      <SelectItem value="URGENT" className="py-3 font-bold text-red-600">Urgent</SelectItem>
                      <SelectItem value="HIGH" className="py-3 font-bold text-orange-600">High</SelectItem>
                      <SelectItem value="MEDIUM" className="py-3 font-bold text-amber-600">Medium</SelectItem>
                      <SelectItem value="LOW" className="py-3 font-medium text-slate-600">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Date Input */}
                  <div className="relative w-full">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-extrabold uppercase tracking-widest text-zinc-400">Due</span>
                    <Input 
                      type="date" 
                      value={dueDateFilter} 
                      onChange={(e) => setDueDateFilter(e.target.value)} 
                      className="pl-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:ring-blue-500 font-medium w-full text-base transition-all text-zinc-600 dark:text-zinc-300"
                    />
                  </div>

                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-zinc-950/50">
                  <TableRow className="border-b border-slate-100 dark:border-zinc-800 hover:bg-transparent">
                    <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-zinc-500">Task Details</TableHead>
                    <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-zinc-500">Project Site</TableHead>
                    <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-zinc-500">Priority</TableHead>
                    <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-zinc-500">Deadline</TableHead>
                    <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</TableHead>
                    <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-32 text-center">
                        <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600" />
                      </TableCell>
                    </TableRow>
                  ) : filteredTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-24">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-20 h-20 bg-slate-100 dark:bg-zinc-800 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner border border-slate-200/50 dark:border-zinc-700/50">
                            <CheckCircle2 className="w-10 h-10 text-zinc-400" />
                          </div>
                          <p className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                            {isFiltering ? "No Tasks Match Filters" : "You're all caught up!"}
                          </p>
                          <p className="mt-2 text-zinc-500 font-medium text-lg">
                            {isFiltering ? "Try adjusting your search criteria." : "You have no active tasks assigned at this time."}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTasks.map((task: any) => {
                      const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";
                      
                      return (
                        <TableRow key={task.id} className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                          
                          {/* Details */}
                          <TableCell className="px-8 py-6 max-w-[320px]">
                            <p className="font-bold text-lg text-zinc-900 dark:text-white leading-tight mb-1.5">{task.title}</p>
                            {task.description && (
                              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed" title={task.description}>
                                {task.description}
                              </p>
                            )}
                          </TableCell>
                          
                          {/* Project */}
                          <TableCell className="px-8 py-6">
                            <div className="flex items-center text-sm font-bold text-zinc-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl w-fit">
                              <MapPin className="w-4 h-4 mr-2 text-blue-500" /> 
                              {task.project?.name || "Unknown Site"}
                            </div>
                          </TableCell>

                          {/* Priority */}
                          <TableCell className="px-8 py-6">
                            {getPriorityBadge(task.priority)}
                          </TableCell>

                          {/* Deadline */}
                          <TableCell className="px-8 py-6">
                            {task.dueDate ? (
                              <div className={cn("flex items-center text-sm font-bold", isOverdue ? "text-red-600 dark:text-red-400" : "text-zinc-600 dark:text-zinc-400")}>
                                {isOverdue ? <AlertCircle className="w-4 h-4 mr-2" /> : <Calendar className="w-4 h-4 mr-2 opacity-70" />}
                                {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            ) : (
                              <span className="text-sm font-medium text-zinc-400 italic">No deadline</span>
                            )}
                          </TableCell>

                          {/* Status */}
                          <TableCell className="px-8 py-6">
                            {getStatusBadge(task.status)}
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="px-8 py-6 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-10 px-5 rounded-xl font-bold border-slate-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 active:scale-95 transition-all shadow-sm hover:shadow" disabled={updateStatusMutation.isPending}>
                                  {updateStatusMutation.isPending && updateStatusMutation.variables?.taskId === task.id ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <Settings2 className="h-4 w-4 mr-2" />
                                  )}
                                  Update
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-2xl p-2 w-48 shadow-xl border-slate-200 dark:border-zinc-800">
                                <DropdownMenuLabel className="font-extrabold text-[10px] uppercase tracking-widest text-zinc-400">Set Task Status</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-100 dark:bg-zinc-800" />
                                {STATUSES.map((status) => (
                                  <DropdownMenuItem 
                                    key={status} 
                                    disabled={task.status === status || updateStatusMutation.isPending} 
                                    onClick={() => handleStatusChange(task.id, task.projectId, status as TaskStatus)}
                                    className="font-bold py-2.5 cursor-pointer text-zinc-700 dark:text-zinc-300 focus:text-blue-600 dark:focus:text-blue-400 focus:bg-blue-50 dark:focus:bg-blue-900/20 rounded-xl"
                                  >
                                    {status === "DONE" && <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />}
                                    {status === "IN_PROGRESS" && <PlayCircle className="w-4 h-4 mr-2 text-blue-500" />}
                                    {status === "IN_REVIEW" && <Search className="w-4 h-4 mr-2 text-purple-500" />}
                                    {status === "TODO" && <Clock className="w-4 h-4 mr-2 text-zinc-400" />}
                                    {status.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>

                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}