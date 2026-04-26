/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-children-prop */
"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
    <div className=" mx-auto space-y-6">
      {/* Header & Back Button */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/projects">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create New Project
          </h1>
          <p className="text-muted-foreground">
            Fill in the details to establish a new construction site.
          </p>
        </div>
      </div>

      {/* The Form Card */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            This information will be visible to all assigned managers and
            workers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Name */}
              <form.Field
                name="name"
                validators={{ onChange: createProjectSchema.shape.name }}
                children={(field) => (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={field.name}>Project Name *</Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g. Downtown Highrise Phase 1"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-destructive">
                        {field.state.meta.errors
                          .map((err: any) => err.message || err)
                          .join(", ")}
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
                    <Label htmlFor={field.name}>Site Location *</Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g. 123 Main St, New York, NY"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-destructive">
                        {field.state.meta.errors
                          .map((err: any) => err.message || err) // 👉 Extracts the message property
                          .join(", ")}
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
                    <Label htmlFor={field.name}>Start Date</Label>
                    <Input
                      type="date"
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              />

              {/* Estimated End Date */}
              <form.Field
                name="endDate"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Estimated End Date</Label>
                    <Input
                      type="date"
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              />

              {/* Description */}
              <form.Field
                name="description"
                children={(field) => (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={field.name}>
                      Scope of Work / Description
                    </Label>
                    <Textarea
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Briefly describe the goals and scope of this project..."
                      className="min-h-[100px]"
                    />
                  </div>
                )}
              />
            </div>

           
            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
