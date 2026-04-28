/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { MemberPortalService } from "@/services/memberPortal.services";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  HardHat,
  Users,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; badge: string }> = {
  ACTIVE: {
    label: "Active",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  },
  COMPLETED: {
    label: "Completed",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  },
  ON_HOLD: {
    label: "On Hold",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  },
  PLANNING: {
    label: "Planning",
    badge: "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-400",
  },
};

function ProjectSkeleton() {
  return (
    <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm">
      <CardHeader className="p-8 pb-4 space-y-4">
        <div className="flex justify-between">
          <div className="h-6 w-24 bg-slate-100 dark:bg-zinc-800 animate-pulse rounded-full" />
          <div className="h-6 w-32 bg-slate-100 dark:bg-zinc-800 animate-pulse rounded-full" />
        </div>
        <div className="h-8 w-3/4 bg-slate-100 dark:bg-zinc-800 animate-pulse rounded-xl" />
      </CardHeader>
      <CardContent className="p-8 pt-0 space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-100 dark:bg-zinc-800 animate-pulse rounded-md" />
          <div className="h-4 w-2/3 bg-slate-100 dark:bg-zinc-800 animate-pulse rounded-md" />
        </div>
      </CardContent>
      <CardFooter className="p-8 pt-0 mt-auto">
        <div className="h-14 w-full bg-slate-100 dark:bg-zinc-800 animate-pulse rounded-2xl" />
      </CardFooter>
    </Card>
  );
}

export default function MyProjectsPage() {
  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: ["my-projects"],
    queryFn: MemberPortalService.getMyProjects,
  });

  const projects = response?.data || [];

  if (isError) {
    toast.error((error as any)?.response?.data?.message || "Failed to load projects.");
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 pt-4 space-y-8">
      
      {/* ─── Premium Header Section ─── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-4 px-1">
        <div className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50 dark:border-blue-800/60 dark:bg-blue-900/30 px-4 py-1.5 text-sm font-bold tracking-wide text-blue-700 dark:text-blue-400 shadow-sm uppercase">
          <HardHat className="mr-2.5 h-4 w-4" /> Global Overview
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Project Command Center
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl leading-relaxed font-medium mt-2">
              Real-time monitoring and management of your active construction sites.
            </p>
          </div>
          <div className="shrink-0 flex flex-col items-start md:items-end bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
            <p className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest mb-1">Total Assignments</p>
            <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 leading-none">{isLoading ? <Loader2 className="w-6 h-6 animate-spin"/> : projects.length}</p>
          </div>
        </div>
      </motion.div>

      {/* ─── Projects Grid ─── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => <ProjectSkeleton key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 rounded-[2.5rem] border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <div className="p-6 bg-slate-50 dark:bg-zinc-800 shadow-inner border border-slate-100 dark:border-zinc-700/50 rounded-[2rem] mb-6">
            <HardHat className="h-12 w-12 text-zinc-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">No Active Projects</h2>
          <p className="text-zinc-500 font-medium max-w-md text-center mt-2">
            You currently do not have any projects assigned to your profile. Check back later or contact your Site Manager.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {projects.map((project: any, index: number) => {
            const status = statusConfig[project.status] || statusConfig.PLANNING;

            return (
              <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }} className="h-full">
                <Card className="h-full flex flex-col rounded-[2.5rem] border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
                  
                  <CardHeader className="p-8 pb-4">
                    <div className="flex items-start justify-between mb-4 gap-4">
                      <Badge className={cn("px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest shadow-none border-0", status.badge)}>
                        {status.label}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800/50 px-3 py-1.5 rounded-full border border-slate-100 dark:border-zinc-800 shrink-0">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-extrabold uppercase tracking-widest truncate max-w-[120px]">
                          {project.location || "Remote"}
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-bold leading-tight text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {project.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-8 pt-0 flex-1 flex flex-col justify-between space-y-6">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed line-clamp-3">
                      {project.description || "Project specifications, site blueprints, and safety protocols for this location."}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100 dark:border-zinc-800/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                          <Users className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-extrabold text-zinc-900 dark:text-white">{project._count?.members || 0}</span>
                          <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">Staff</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-extrabold text-zinc-900 dark:text-white">{project._count?.tasks || 0}</span>
                          <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">Tasks</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-8 pt-0 mt-auto">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full h-14 rounded-2xl font-bold border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white hover:bg-blue-600 hover:text-white hover:border-blue-600 dark:hover:bg-blue-600 transition-all duration-300 group/btn shadow-sm"
                    >
                      <Link href={`/member/projects/${project.id}`} className="flex items-center justify-center">
                        Access Workspace
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </Button>
                  </CardFooter>
                  
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}