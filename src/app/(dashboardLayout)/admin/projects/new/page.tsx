/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-children-prop */
"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Building2, MapPin, Calendar, AlignLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import { ProjectService } from "@/services/project.services";
import { createProjectSchema } from "@/zod/project.validation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CreateProjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 1. React Query Mutation to save the project
  const createMutation = useMutation({
    mutationFn: ProjectService.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
      toast.success("Project created successfully!");
      router.push("/admin/projects");
    },
    onError: (error: any) => {
      const errors = error?.response?.data?.errorSources;

      if (errors?.length) {
        toast.error(errors.map((e: any) => e.message).join("\n"));
      } else {
        toast.error(
          error?.response?.data?.message || "Project creation failed"
        );
      }
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      location: "",
      description: "",
      startDate: "",
      endDate: "",
    },
    onSubmit: async ({ value }) => {
      const payload = {
        ...value,
        startDate: value.startDate
          ? new Date(value.startDate).toISOString()
          : undefined,
        endDate: value.endDate
          ? new Date(value.endDate).toISOString()
          : undefined,
      };
      createMutation.mutate(payload);
    },
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }} 
      className="max-w-5xl mx-auto space-y-8 pb-12"
    >
      
      {/* ─── Header & Back Button ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 px-1">
        <Link href="/admin/projects" className="shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors group">
            <ArrowLeft className="h-5 w-5 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
          </div>
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Create New Project
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-lg leading-relaxed max-w-2xl font-medium">
            Establish a new construction site. This information will be visible to all assigned managers and site workers.
          </p>
        </div>
      </div>

      {/* ─── The Form Card ─── */}
      <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-100 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/10">
          <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center">
            <Building2 className="h-6 w-6 mr-3 text-blue-600 dark:text-blue-400" /> 
            Project Details
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Please fill in the primary logistics for this build.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              
              {/* Project Name */}
              <form.Field
                name="name"
                validators={{ onChange: createProjectSchema.shape.name }}
                children={(field) => (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={field.name} className="text-slate-700 dark:text-slate-300 font-bold ml-1 flex items-center">
                      Project Name <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g. Downtown Highrise Phase 1"
                      className={cn(
                        "h-14 px-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:bg-white focus-visible:ring-offset-2 transition-all w-full text-base",
                        field.state.meta.errors.length > 0 ? "border-red-400 focus-visible:ring-red-600 bg-red-50/30" : "focus-visible:ring-blue-600"
                      )}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm font-semibold text-red-500 ml-1 animate-in fade-in">
                        {field.state.meta.errors.map((err: any) => err.message || err).join(", ")}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Location */}
              <form.Field
                name="location"
                validators={{ onChange: createProjectSchema.shape.location }}
                children={(field) => (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={field.name} className="text-slate-700 dark:text-slate-300 font-bold ml-1 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-zinc-400" /> Site Location <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g. 123 Main St, New York, NY"
                      className={cn(
                        "h-14 px-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:bg-white focus-visible:ring-offset-2 transition-all w-full text-base",
                        field.state.meta.errors.length > 0 ? "border-red-400 focus-visible:ring-red-600 bg-red-50/30" : "focus-visible:ring-blue-600"
                      )}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm font-semibold text-red-500 ml-1 animate-in fade-in">
                        {field.state.meta.errors.map((err: any) => err.message || err).join(", ")}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Start Date */}
              <form.Field
                name="startDate"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="text-slate-700 dark:text-slate-300 font-bold ml-1 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-zinc-400" /> Start Date
                    </Label>
                    <Input
                      type="date"
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="h-14 px-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:bg-white focus-visible:ring-offset-2 focus-visible:ring-blue-600 transition-all w-full text-base"
                    />
                  </div>
                )}
              />

              {/* Estimated End Date */}
              <form.Field
                name="endDate"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="text-slate-700 dark:text-slate-300 font-bold ml-1 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-zinc-400" /> Target End Date
                    </Label>
                    <Input
                      type="date"
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="h-14 px-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:bg-white focus-visible:ring-offset-2 focus-visible:ring-blue-600 transition-all w-full text-base"
                    />
                  </div>
                )}
              />

              {/* Description */}
              <form.Field
                name="description"
                children={(field) => (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={field.name} className="text-slate-700 dark:text-slate-300 font-bold ml-1 flex items-center">
                      <AlignLeft className="h-4 w-4 mr-2 text-zinc-400" /> Scope of Work / Description
                    </Label>
                    <Textarea
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Briefly describe the goals and scope of this project..."
                      className="min-h-[140px] p-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:bg-white focus-visible:ring-offset-2 focus-visible:ring-blue-600 transition-all w-full text-base resize-y"
                    />
                  </div>
                )}
              />
            </div>
           
            {/* ─── Submit Button ─── */}
            <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-zinc-800/50">
              <Button 
                type="submit" 
                disabled={createMutation.isPending}
                className="w-full sm:w-auto h-14 px-8 rounded-2xl text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Establishing Site...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Create Project
                  </>
                )}
              </Button>
            </div>
            
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}