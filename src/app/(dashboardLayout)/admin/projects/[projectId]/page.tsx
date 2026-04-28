/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjectService } from "@/services/project.services";
import { ProjectMemberService } from "@/services/projectMember.services";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Loader2, MapPin, Calendar, Settings2, CheckCircle2, Edit3, ClipboardList 
} from "lucide-react";

// Tab Components
import TeamTab from "./_components/TeamTab";
import TasksTab from "./_components/TasksTab";
import MaterialsTab from "./_components/MaterialsTab";
import IncidentsTab from "./_components/IncidentsTab";
import DailyReportsTab from "./_components/DailyReportsTab";
import AttendanceTab from "./_components/AttendanceTab";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Helper to format ISO dates to YYYY-MM-DD for HTML date inputs
const formatDateForInput = (dateString?: string) => {
  if (!dateString) return "";
  return new Date(dateString).toISOString().split("T")[0];
};

export default function SingleProjectPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const projectId = params.projectId as string;

  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  // Form state for the Edit Panel
  const [editForm, setEditForm] = useState({
    name: "",
    location: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "PLANNING",
  });

  // 1. Fetch the single project
  const {
    data: projectResponse,
    isLoading: isProjectLoading,
    isError,
  } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => ProjectService.getProjectById(projectId),
    enabled: !!projectId,
  });

  // 2. Fetch the logged-in user's specific role on THIS project
  const { data: memberResponse, isLoading: isMemberLoading } = useQuery({
    queryKey: ["project-member", projectId, "me"],
    queryFn: () => ProjectMemberService.getMyRole(projectId),
    enabled: !!projectId,
  });

  const project = projectResponse?.data || projectResponse;
  const myRole = memberResponse?.data?.role || "PROJECT_MANAGER"; 

  // 3. Setup the Generic Update Mutation
  const updateProjectMutation = useMutation({
    mutationFn: (updateData: any) => 
      ProjectService.updateProject(projectId, updateData),
    onSuccess: (data, variables) => {
      if (Object.keys(variables).length === 1 && variables.status) {
        toast.success(`Project marked as ${variables.status.replace("_", " ")}`);
      } else {
        toast.success("Project details updated successfully!");
        setIsEditSheetOpen(false); 
      }
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update project");
    }
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProjectMutation.mutate(editForm);
  };

  // Loading State
  if (isProjectLoading || isMemberLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  // Error State
  if (isError || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Project Not Found</h2>
        <p className="text-zinc-500">This project may have been deleted or you don&apos;t have access.</p>
        <Button className="h-12 px-6 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white" onClick={() => router.push("/admin/projects")}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  // Premium Status Badge Helper
  const getStatusBadge = (status: string) => {
    const base = "px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest shadow-none border-0";
    switch (status) {
      case "ACTIVE": return <Badge className={cn(base, "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400")}>{status}</Badge>;
      case "COMPLETED": return <Badge className={cn(base, "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400")}>{status}</Badge>;
      case "ON_HOLD": return <Badge className={cn(base, "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400")}>{status.replace("_", " ")}</Badge>;
      default: return <Badge className={cn(base, "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300")}>{status}</Badge>;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8 pb-12 w-full max-w-[100vw] overflow-hidden">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 px-1">
        
        <div className="flex items-start gap-4 lg:gap-6">
          <Link href="/dashboard" className="shrink-0 mt-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors group">
              <ArrowLeft className="h-5 w-5 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
            </div>
          </Link>
          
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">{project.name}</h1>
              {getStatusBadge(project.status)}
            </div>
            <div className="flex flex-wrap items-center text-zinc-500 dark:text-zinc-400 gap-4 text-sm font-medium">
              <span className="flex items-center"><MapPin className="h-4 w-4 mr-1.5" /> {project.location}</span>
              <span className="flex items-center"><Calendar className="h-4 w-4 mr-1.5" /> Created: {new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* --- ACTION BUTTONS --- */}
        {(myRole === "PROJECT_MANAGER" || myRole === "SITE_MANAGER") && (
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto shrink-0">
            
            {/* Edit Details Sheet */}
            <Sheet 
              open={isEditSheetOpen} 
              onOpenChange={(isOpen) => {
                setIsEditSheetOpen(isOpen);
                if (isOpen && project) {
                  setEditForm({
                    name: project.name || "",
                    location: project.location || "",
                    description: project.description || "",
                    startDate: formatDateForInput(project.startDate),
                    endDate: formatDateForInput(project.endDate),
                    status: project.status || "PLANNING",
                  });
                }
              }}
            >
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto h-12 px-6 rounded-xl font-bold bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-sm active:scale-95 transition-all">
                  <Edit3 className="h-4 w-4 mr-2" /> Edit Details
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md overflow-y-auto sm:rounded-l-[2.5rem] border-l border-slate-200 dark:border-zinc-800 p-8 shadow-2xl">
                <SheetHeader className="mb-8">
                  <SheetTitle className="text-2xl font-bold">Edit Project</SheetTitle>
                </SheetHeader>
                
                <form onSubmit={handleEditSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="font-bold">Project Name</Label>
                    <Input className="h-12 rounded-xl bg-slate-50 dark:bg-zinc-950" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} required />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold">Location</Label>
                    <Input className="h-12 rounded-xl bg-slate-50 dark:bg-zinc-950" value={editForm.location} onChange={(e) => setEditForm({...editForm, location: e.target.value})} required />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold">Project Status</Label>
                    <select 
                      className="flex h-12 w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 px-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 transition-all"
                      value={editForm.status}
                      onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    >
                      <option value="PLANNING">Planning</option>
                      <option value="ACTIVE">Active</option>
                      <option value="ON_HOLD">On Hold</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold">Start Date</Label>
                      <Input type="date" className="h-12 rounded-xl bg-slate-50 dark:bg-zinc-950" value={editForm.startDate} onChange={(e) => setEditForm({...editForm, startDate: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">Target End Date</Label>
                      <Input type="date" className="h-12 rounded-xl bg-slate-50 dark:bg-zinc-950" value={editForm.endDate} onChange={(e) => setEditForm({...editForm, endDate: e.target.value})} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold">Scope of Work</Label>
                    <Textarea className="min-h-[120px] rounded-xl bg-slate-50 dark:bg-zinc-950 p-4" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} />
                  </div>

                  <div className="pt-4">
                    <Button type="submit" className="w-full h-14 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] active:scale-95 transition-all" disabled={updateProjectMutation.isPending}>
                      {updateProjectMutation.isPending ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : null} Save Changes
                    </Button>
                  </div>
                </form>
              </SheetContent>
            </Sheet>

            {/* Quick Status Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto h-12 px-6 rounded-xl font-bold bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-sm active:scale-95 transition-all" disabled={updateProjectMutation.isPending}>
                  {updateProjectMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Settings2 className="h-4 w-4 mr-2" />} Manage Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                <DropdownMenuLabel className="font-bold text-xs uppercase tracking-wider text-zinc-500">Change Project Phase</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="py-2.5 cursor-pointer font-medium" onClick={() => updateProjectMutation.mutate({ status: "PLANNING" })} disabled={project.status === "PLANNING"}>Set to Planning</DropdownMenuItem>
                <DropdownMenuItem className="py-2.5 cursor-pointer font-medium" onClick={() => updateProjectMutation.mutate({ status: "ACTIVE" })} disabled={project.status === "ACTIVE"}>Set to Active</DropdownMenuItem>
                <DropdownMenuItem className="py-2.5 cursor-pointer font-medium text-amber-600 focus:text-amber-700" onClick={() => updateProjectMutation.mutate({ status: "ON_HOLD" })} disabled={project.status === "ON_HOLD"}>Put On Hold</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="py-2.5 cursor-pointer font-bold text-emerald-600 focus:text-emerald-700" onClick={() => updateProjectMutation.mutate({ status: "COMPLETED" })} disabled={project.status === "COMPLETED"}>
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Mark as Completed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        )}
      </div>

      {/* --- SCROLLABLE TABS NAVIGATION --- */}
      <Tabs defaultValue={myRole === "SAFETY_OFFICER" ? "incidents" : "overview"} className="w-full">
        
        <div className="relative w-full">
          {/* Hide scrollbar but allow touch scrolling on mobile */}
          <TabsList className="flex w-full justify-start overflow-x-auto no-scrollbar h-16 rounded-[1.25rem] bg-slate-100 dark:bg-zinc-900/80 p-1.5 shadow-inner border border-slate-200/50 dark:border-zinc-800/80 mb-8">
            <TabsTrigger value="overview" className="shrink-0 rounded-xl px-5 h-full font-bold text-sm text-zinc-600 dark:text-zinc-400 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm transition-all">
              Overview
            </TabsTrigger>
            <TabsTrigger value="tasks" className="shrink-0 rounded-xl px-5 h-full font-bold text-sm text-zinc-600 dark:text-zinc-400 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm transition-all">
              {myRole === "WORKER" ? "My Tasks" : "All Tasks"}
            </TabsTrigger>

            {myRole !== "WORKER" && myRole !== "SUBCONTRACTOR" && (
              <>
                <TabsTrigger value="team" className="shrink-0 rounded-xl px-5 h-full font-bold text-sm text-zinc-600 dark:text-zinc-400 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm transition-all">Team</TabsTrigger>
                <TabsTrigger value="materials" className="shrink-0 rounded-xl px-5 h-full font-bold text-sm text-zinc-600 dark:text-zinc-400 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm transition-all">Materials</TabsTrigger>
              </>
            )}

            {(myRole === "SAFETY_OFFICER" || myRole === "SITE_MANAGER" || myRole === "PROJECT_MANAGER") && (
              <TabsTrigger value="incidents" className="shrink-0 rounded-xl px-5 h-full font-bold text-sm text-zinc-600 dark:text-zinc-400 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400 data-[state=active]:shadow-sm transition-all">
                Safety & Checklists
              </TabsTrigger>
            )}

            <TabsTrigger value="reports" className="shrink-0 rounded-xl px-5 h-full font-bold text-sm text-zinc-600 dark:text-zinc-400 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm transition-all">Daily Reports</TabsTrigger>
            <TabsTrigger value="attendance" className="shrink-0 rounded-xl px-5 h-full font-bold text-sm text-zinc-600 dark:text-zinc-400 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm transition-all">Time & Attendance</TabsTrigger>
          </TabsList>
        </div>

        {/* --- TABS CONTENT --- */}
        <TabsContent value="overview" className="outline-none">
          <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-100 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/10">
              <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center">
                <ClipboardList className="h-6 w-6 mr-3 text-blue-600 dark:text-blue-400" /> Project Scope & Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap font-medium max-w-4xl">
                {project.description || "No description provided for this project."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-100 dark:border-zinc-800/50">
                <div className="p-5 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 mb-1">Start Date</p>
                  <p className="text-lg font-bold text-zinc-900 dark:text-white">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : "TBD"}
                  </p>
                </div>
                <div className="p-5 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 mb-1">Target End Date</p>
                  <p className="text-lg font-bold text-zinc-900 dark:text-white">
                    {project.endDate ? new Date(project.endDate).toLocaleDateString() : "TBD"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="outline-none"><TasksTab projectId={projectId} /></TabsContent>
        
        {myRole !== "WORKER" && myRole !== "SUBCONTRACTOR" && (
          <>
            <TabsContent value="team" className="outline-none"><TeamTab projectId={projectId} /></TabsContent>
            <TabsContent value="materials" className="outline-none"><MaterialsTab projectId={projectId} /></TabsContent>
          </>
        )}

        {(myRole === "SAFETY_OFFICER" || myRole === "SITE_MANAGER" || myRole === "PROJECT_MANAGER") && (
          <TabsContent value="incidents" className="outline-none"><IncidentsTab projectId={projectId} /></TabsContent>
        )}
        
        <TabsContent value="reports" className="outline-none"><DailyReportsTab projectId={projectId} /></TabsContent>
        <TabsContent value="attendance" className="outline-none"><AttendanceTab projectId={projectId} /></TabsContent>
      </Tabs>
    </motion.div>
  );
}