/* eslint-disable react/no-children-prop */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { MemberService } from "@/services/member.services";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Camera, Mail } from "lucide-react";
import { toast } from "sonner";

// ------------------------------------------------------------------
// 1. MAIN PAGE COMPONENT (Handles fetching the data)
// ------------------------------------------------------------------
export default function ProfileSettingsPage() {
  const { data: response, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: MemberService.getMyProfile,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  const user = response?.data;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your public profile and personal information.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AvatarUploadCard user={user} />
        <PersonalInfoFormCard user={user} />
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// 2. AVATAR UPLOAD COMPONENT (Handles file upload separately)
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
    errors.forEach((err: any) => {
      toast.error(err.message);
    });
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
    <Card className="md:col-span-1 shadow-sm h-fit">
      <CardHeader>
        <CardTitle className="text-sm">Profile Picture</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="h-32 w-32 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border-2 border-dashed border-zinc-300 relative overflow-hidden mb-4">
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-12 w-12 text-zinc-400" />
          )}
        </div>

        <div className="relative w-full">
          <Input
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleAvatarUpload}
            disabled={avatarMutation.isPending}
          />
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            disabled={avatarMutation.isPending}
          >
            {avatarMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Camera className="h-4 w-4 mr-2" />
            )}
            {avatarMutation.isPending ? "Uploading..." : "Change Photo"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------------
// 3. TANSTACK FORM COMPONENT (Handles text updates)
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
        errors.forEach((err: any) => {
          toast.error(err.message);
        });
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
    <Card className="md:col-span-2 shadow-sm">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Your system role is <strong>{user?.role}</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* TANSTACK FIELD: NAME */}
            <form.Field
              name="name"
              children={(field) => (
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
              )}
            />

            {/* TANSTACK FIELD: PHONE */}
            <form.Field
              name="phone"
              children={(field) => (
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              )}
            />

            {/* READ-ONLY FIELD: EMAIL */}
            <div className="space-y-2 md:col-span-2">
              <Label>Email (Read-only)</Label>
              <div className="flex items-center px-3 h-10 rounded-md border bg-zinc-50 dark:bg-zinc-900/50 text-muted-foreground text-sm cursor-not-allowed">
                <Mail className="h-4 w-4 mr-2" /> {user?.email}
              </div>
            </div>
          </div>

          <div className="pt-2">
            {/* TANSTACK SUBSCRIBE: BUTTON STATE */}
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Save Changes
                </Button>
              )}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
