/* eslint-disable react/no-children-prop */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/modules/Auth/LoginForm.tsx
"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { AuthService } from "@/services/auth.services";
import { loginSchema } from "@/zod/auth.validation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setCookie } from "@/lib/cookieUtils";
import { toast } from "sonner";

export default function LoginForm() {
  const router = useRouter();

  // 1. React Query Mutation for Login
 const loginMutation = useMutation({
    mutationFn: AuthService.login,
    onSuccess: (res) => {
      toast.success("Logged in successfully!");
      router.push("/dashboard");
    },
   onError: (error: any, variables: any) => {
      const errorMessage = error?.response?.data?.message;
      if (errorMessage === "Email not verified") {
        toast.error("Please verify your email before logging in.");
    
        router.push(`/verify?email=${encodeURIComponent(variables.email)}`);
      } else {
        toast.error(errorMessage || "Failed to login. Please try again.");
      }
    }
  });

  // 2. TanStack Form Setup (NEW API - No adapter needed!)
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    // We pass the validation to the onSubmit directly
    onSubmit: async ({ value }) => {
      loginMutation.mutate(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      <div className="space-y-4">
        {/* Email Field */}
        <form.Field
          name="email"
          validators={{
            // 👉 NEW API: Just pass the Zod schema directly!
            onChange: loginSchema.shape.email,
          }}
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Email</Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="example@krewos.com"
                disabled={loginMutation.isPending}
              />
              {field.state.meta.errors.length > 0 ? (
                <p className="text-sm text-destructive font-medium">
                  {field.state.meta.errors
                    .map((err: any) => err.message || err)
                    .join(", ")}
                </p>
              ) : null}
            </div>
          )}
        />

        {/* Password Field */}
        <form.Field
          name="password"
          validators={{
            onChange: loginSchema.shape.password,
          }}
          children={(field) => (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={field.name}>Password</Label>
                <a
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <Input
                id={field.name}
                name={field.name}
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                disabled={loginMutation.isPending}
              />
              {field.state.meta.errors.length > 0 ? (
                <p className="text-sm text-destructive font-medium">
                  {field.state.meta.errors
                    .map((err: any) => err.message || err)
                    .join(", ")}
                </p>
              ) : null}
            </div>
          )}
        />
      </div>

      {/* Global Error Message */}
      {loginMutation.isError && (
        <div className="p-3 text-sm rounded-md bg-destructive/15 text-destructive">
          {(loginMutation.error as any).response?.data?.message ||
            "Invalid credentials. Please try again."}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
}
