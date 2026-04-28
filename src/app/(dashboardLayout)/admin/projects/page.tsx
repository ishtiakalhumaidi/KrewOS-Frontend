/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { ProjectService } from "@/services/project.services";
import Link from "next/link";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, HardHat, Building2, MapPin, Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProjectsManagementPage() {
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: ProjectService.getCompanyProjects,
  });

  const projects = response || [];

  const getStatusBadge = (status: string) => {
    const base = "px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest shadow-none border-0";
    switch (status) {
      case "ACTIVE": return <Badge className={cn(base, "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400")}>{status}</Badge>;
      case "COMPLETED": return <Badge className={cn(base, "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400")}>{status}</Badge>;
      case "ON_HOLD": return <Badge className={cn(base, "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400")}>{status.replace("_", " ")}</Badge>;
      default: return <Badge className={cn(base, "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300")}>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 pt-4">
      
      {/* ─── Header Section ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }} 
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
      >
        <div className="space-y-4">
          <div className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50 dark:border-blue-800/60 dark:bg-blue-900/30 px-4 py-1.5 text-sm font-bold tracking-wide text-blue-700 dark:text-blue-400 shadow-sm uppercase">
            <Building2 className="mr-2.5 h-4 w-4" /> Company Projects
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Active Worksites
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl leading-relaxed font-medium">
            Manage all construction projects, establish new sites, and monitor high-level operational status.
          </p>
        </div>

        <Link href="/admin/projects/new" className="shrink-0">
          <Button className="w-full sm:w-auto h-12 px-6 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] transition-all active:scale-95">
            <Plus className="mr-2 h-5 w-5" />
            Create New Project
          </Button>
        </Link>
      </motion.div>

      {/* ─── Error State ─── */}
      {isError && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-2xl bg-red-50/80 border border-red-100 text-red-800 font-medium">
          Failed to load projects. Please check your connection or contact support.
        </motion.div>
      )}

      {/* ─── Projects Table Card ─── */}
      {!isError && (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
            
            <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/10 border-b border-slate-100 dark:border-zinc-800/50 p-8 hidden md:block">
              <CardTitle className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Project Directory</CardTitle>
              <CardDescription className="text-base mt-1">A complete list of your company&apos;s build sites.</CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mb-6 shadow-inner border border-blue-200/50 dark:border-blue-800/50">
                    <HardHat className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-extrabold text-2xl text-zinc-900 dark:text-white">No Projects Found</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-lg mt-2 mb-8 max-w-md font-medium">
                    You have not established any construction sites yet. Click the button below to get started.
                  </p>
                  <Link href="/admin/projects/new">
                    <Button className="h-14 px-8 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] transition-all active:scale-95">
                      <Plus className="mr-2 h-5 w-5" /> Establish First Project
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-zinc-950/50">
                      <TableRow className="border-b border-slate-100 dark:border-zinc-800 hover:bg-transparent">
                        <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Project Details</TableHead>
                        <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</TableHead>
                        <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500">Timeline</TableHead>
                        <TableHead className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects.map((project: any) => (
                        <TableRow 
                          key={project.id} 
                          className="border-b border-slate-100 dark:border-zinc-800/50 hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors"
                        >
                          <TableCell className="px-8 py-6">
                            <p className="font-bold text-lg text-zinc-900 dark:text-white">{project.name}</p>
                            <p className="flex items-center text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 font-medium">
                              <MapPin className="h-4 w-4 mr-1.5" /> {project.location}
                            </p>
                          </TableCell>
                          
                          <TableCell className="px-8 py-6">
                            {getStatusBadge(project.status)}
                          </TableCell>
                          
                          <TableCell className="px-8 py-6">
                            <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-300 font-medium">
                              <Calendar className="h-4 w-4 mr-2 text-zinc-400" />
                              {project.startDate ? new Date(project.startDate).toLocaleDateString() : "TBD"} 
                              <ArrowRight className="h-3 w-3 mx-2 text-zinc-300 dark:text-zinc-600" />
                              {project.endDate ? new Date(project.endDate).toLocaleDateString() : "TBD"}
                            </div>
                          </TableCell>

                          <TableCell className="px-8 py-6 text-right">
                            <Link href={`/admin/projects/${project.id}`}>
                              <Button variant="outline" className="h-10 rounded-xl font-bold border-slate-200 dark:border-zinc-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 dark:hover:border-blue-800 transition-all active:scale-95">
                                View Workspace
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}