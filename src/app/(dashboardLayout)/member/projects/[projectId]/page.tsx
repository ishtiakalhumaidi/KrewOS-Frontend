/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { MemberPortalService } from "@/services/memberPortal.services";
import { ProjectMemberService } from "@/services/projectMember.services";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, MapPin, ArrowLeft, Phone, Mail, HardHat, ShieldCheck, LayoutGrid, Clock, CheckSquare, Package, FileText, Users, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import MemberAttendanceTab from "./_components/MemberAttendanceTab";
import MemberTasksTab from "./_components/MemberTasksTab";
import MemberSafetyTab from "./_components/MemberSafetyTab";
import MemberTeamTab from "./_components/MemberTeamTab";
import MemberMaterialsTab from "./_components/MemberMaterialsTab";
import MemberReportsTab from "./_components/MemberReportsTab";

export default function MemberProjectWorkspace() {
  const params = useParams();
  const projectId = params.projectId as string;

  const { data: projectResponse, isLoading: isProjectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => MemberPortalService.getProjectDetails(projectId),
    enabled: !!projectId,
  });

  const { data: memberResponse, isLoading: isMemberLoading } = useQuery({
    queryKey: ["project-member", projectId, "me"],
    queryFn: () => ProjectMemberService.getMyRole(projectId),
    enabled: !!projectId,
  });

  const { data: teamResponse, isLoading: isTeamLoading } = useQuery({
    queryKey: ["project-team", projectId],
    queryFn: () => ProjectMemberService.getProjectMembers(projectId),
    enabled: !!projectId,
  });

  const project = projectResponse?.data || projectResponse;
  const myRole = memberResponse?.data?.role || "WORKER";
  const teamMembers = teamResponse?.data || [];

  const projectManagers = teamMembers.filter((m: any) => m.role === "PROJECT_MANAGER" || m.role === "SITE_MANAGER");
  const safetyOfficers = teamMembers.filter((m: any) => m.role === "SAFETY_OFFICER");

  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);
  const currentTab = activeTab ?? (myRole === "SAFETY_OFFICER" ? "safety" : myRole === "WORKER" ? "tasks" : "overview");

  if (isProjectLoading || isMemberLoading || isTeamLoading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 pt-4">
      {/* ─── Premium Header ─── */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div className="flex items-center space-x-5">
          <Link href="/member/projects">
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-slate-200 dark:border-zinc-800 shadow-sm hover:bg-slate-50 transition-all">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">{project.name}</h1>
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border-0">
                {myRole.replace("_", " ")}
              </Badge>
            </div>
            <div className="flex items-center text-zinc-500 font-medium mt-2 text-sm">
              <MapPin className="h-4 w-4 mr-1.5 text-zinc-400" /> {project.location}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Premium Navigation Tabs ─── */}
      <Tabs value={currentTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap justify-start gap-2 h-auto p-1 mb-8 bg-slate-100/50 dark:bg-zinc-900/50 rounded-[1.5rem] border border-slate-200/50 dark:border-zinc-800/50 w-fit">
          <TabsTrigger value="overview" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all"><LayoutGrid className="w-4 h-4 mr-2"/>Overview</TabsTrigger>
          <TabsTrigger value="timecard" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all"><Clock className="w-4 h-4 mr-2"/>Timecard</TabsTrigger>
          <TabsTrigger value="tasks" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all"><CheckSquare className="w-4 h-4 mr-2"/>Tasks</TabsTrigger>
          <TabsTrigger value="materials" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all"><Package className="w-4 h-4 mr-2"/>Materials</TabsTrigger>
          {(myRole === "SAFETY_OFFICER" || myRole === "SITE_MANAGER" || myRole === "PROJECT_MANAGER") && (
            <TabsTrigger value="safety" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all"><ShieldAlert className="w-4 h-4 mr-2"/>Safety</TabsTrigger>
          )}
          {(myRole === "SITE_MANAGER" || myRole === "PROJECT_MANAGER") && (
            <>
               <TabsTrigger value="reports" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all"><FileText className="w-4 h-4 mr-2"/>Reports</TabsTrigger>
               <TabsTrigger value="team" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all"><Users className="w-4 h-4 mr-2"/>Team</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="overview" className="outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <CardHeader className="p-8 border-b bg-slate-50/50 dark:bg-zinc-900/10">
                <CardTitle className="text-2xl font-bold">Site Instructions</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed text-lg font-medium">
                  {project.description || "No specific instructions provided for this site by management."}
                </p>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-xl font-bold flex items-center"><HardHat className="w-6 h-6 mr-3 text-blue-600" /> Key Personnel</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-4">
                  {projectManagers.map((pm: any) => (
                    <div key={pm.userId} className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm"><AvatarFallback>{pm.user?.name?.charAt(0)}</AvatarFallback></Avatar>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold truncate text-zinc-900 dark:text-white">{pm.user?.name}</p>
                        <p className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{pm.role.replace("_", " ")}</p>
                      </div>
                      <a href={`tel:${pm.user.phone}`} className="h-10 w-10 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-blue-600 transition-colors shadow-sm"><Phone className="w-4 h-4" /></a>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="timecard" className="outline-none"><MemberAttendanceTab projectId={projectId} myRole={myRole} /></TabsContent>
        <TabsContent value="tasks" className="outline-none"><MemberTasksTab projectId={projectId} myRole={myRole} /></TabsContent>
        <TabsContent value="materials" className="outline-none"><MemberMaterialsTab projectId={projectId} myRole={myRole} /></TabsContent>
        <TabsContent value="reports" className="outline-none"><MemberReportsTab projectId={projectId} /></TabsContent>
        <TabsContent value="safety" className="outline-none"><MemberSafetyTab projectId={projectId} /></TabsContent>
        <TabsContent value="team" className="outline-none"><MemberTeamTab projectId={projectId} /></TabsContent>
      </Tabs>
    </div>
  );
}