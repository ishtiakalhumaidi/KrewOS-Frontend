/* eslint-disable react/no-children-prop */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { MemberService } from "@/services/member.services";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Camera, Mail, UserCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ------------------------------------------------------------------
// 1. MAIN PAGE COMPONENT
// ------------------------------------------------------------------
export default function ProfileSettingsPage() {
  const { data: response, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: MemberService.getMyProfile,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
      </div>
    );
  }

  const user = response?.data;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-6xl mx-auto space-y-8 pb-12 pt-4">
      
      {/* ─── Header Section ─── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-1">
        <div className="space-y-4">
          <div className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50 dark:border-blue-800/60 dark:bg-blue-900/30 px-4 py-1.5 text-sm font-bold tracking-wide text-blue-700 dark:text-blue-400 shadow-sm uppercase">
            <UserCircle className="mr-2.5 h-4 w-4" /> Personal Profile
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Account Settings
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl leading-relaxed font-medium">
            Manage your public profile, contact information, and account preferences.
          </p>
        </div>
      </div>

      {/* ─── Main Content Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <AvatarUploadCard user={user} />
        <PersonalInfoFormCard user={user} />
      </div>
    </motion.div>
  );
}

// ------------------------------------------------------------------
// 2. AVATAR UPLOAD COMPONENT
// ------------------------------------------------------------------
function AvatarUploadCard({ user }: { user: any }) {
  const queryClient = useQueryClient();

  const avatarMutation = useMutation({
    mutationFn: MemberService.updateAvatar,
    onSuccess: () => {
      toast.success("Profile picture updated!");
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: (error: any) => {
      const errors = error?.response?.data?.errorSources;
      if (errors?.length) {
        errors.forEach((err: any) => toast.error(err.message));
      } else {
        toast.error(error?.response?.data?.message || "Failed to upload image.");
      }
    }
  });

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("avatar", file);
      avatarMutation.mutate(formData);
    }
  };

  return (
    <Card className="lg:col-span-1 rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
      <CardHeader className="p-8 border-b border-slate-100 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/10 text-center">
        <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white">Profile Picture</CardTitle>
      </CardHeader>
      <CardContent className="p-8 flex flex-col items-center">
        
        {/* Big Premium Avatar Circle */}
        <div className="relative group mb-8">
          <div className="h-40 w-40 rounded-[2rem] bg-slate-100 dark:bg-zinc-800 flex items-center justify-center border-4 border-white dark:border-zinc-950 shadow-xl overflow-hidden ring-1 ring-slate-200 dark:ring-zinc-800 transition-transform duration-300 group-hover:scale-105">
            {user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <User className="h-16 w-16 text-zinc-400" />
            )}
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          
          {/* File Input hidden over the avatar area */}
          <Input
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onChange={handleAvatarUpload}
            disabled={avatarMutation.isPending}
            title="Click to upload"
          />
        </div>

        <div className="w-full relative">
          <Input
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onChange={handleAvatarUpload}
            disabled={avatarMutation.isPending}
          />
          <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-slate-200 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-95 transition-all">
            {avatarMutation.isPending ? <Loader2 className="h-5 w-5 mr-2 animate-spin text-blue-600" /> : <Camera className="h-5 w-5 mr-2 text-zinc-500" />}
            {avatarMutation.isPending ? "Uploading Image..." : "Change Photo"}
          </Button>
        </div>
        
        <p className="text-xs font-medium text-zinc-500 mt-4 text-center">
          Supported formats: JPG, PNG, WEBP. Max size: 5MB.
        </p>
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------------
// 3. TANSTACK FORM COMPONENT
// ------------------------------------------------------------------
function PersonalInfoFormCard({ user }: { user: any }) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: MemberService.updateProfile,
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: (error: any) => {
      const errors = error?.response?.data?.errorSources;
      if (errors?.length) {
        errors.forEach((err: any) => toast.error(err.message));
      } else {
        toast.error(error?.response?.data?.message || "Update failed.");
      }
    },
  });

  const form = useForm({
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
    },
    onSubmit: async ({ value }) => {
      updateMutation.mutate(value);
    },
  });

  return (
    <Card className="lg:col-span-2 rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
      <CardHeader className="p-8 border-b border-slate-100 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center">
              <User className="h-6 w-6 mr-3 text-blue-600 dark:text-blue-400" /> Personal Details
            </CardTitle>
            <CardDescription className="text-base mt-1">
              Update your core personal information.
            </CardDescription>
          </div>
          <Badge className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 shadow-none border-0 flex items-center">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Role: {user?.role.replace("_", " ")}
          </Badge>
        </div>
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
            
            {/* TANSTACK FIELD: NAME */}
            <form.Field
              name="name"
              children={(field) => (
                <div className="space-y-2 md:col-span-2">
                  <Label className="font-bold text-slate-700 dark:text-slate-300 ml-1">Full Name</Label>
                  <Input
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="h-14 px-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:ring-blue-600 transition-all text-base"
                  />
                </div>
              )}
            />

            {/* TANSTACK FIELD: PHONE */}
            <form.Field
              name="phone"
              children={(field) => (
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700 dark:text-slate-300 ml-1">Phone Number</Label>
                  <Input
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="h-14 px-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:ring-blue-600 transition-all text-base"
                  />
                </div>
              )}
            />

            {/* READ-ONLY FIELD: EMAIL */}
            <div className="space-y-2">
              <Label className="font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</Label>
              <div className="flex items-center px-4 h-14 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-100/50 dark:bg-zinc-950/50 text-slate-500 dark:text-zinc-500 text-base font-medium cursor-not-allowed shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)]">
                <Mail className="h-5 w-5 mr-3 opacity-70" /> {user?.email}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-zinc-800/50 flex justify-end">
            {/* TANSTACK SUBSCRIBE: BUTTON STATE */}
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || updateMutation.isPending}
                  className="w-full sm:w-auto h-14 px-10 rounded-2xl text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] active:scale-95 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {updateMutation.isPending ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : null}
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              )}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}