/* eslint-disable react/no-children-prop */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

import { AuthService } from "@/services/auth.services";
import { loginSchema } from "@/zod/auth.validation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { setAuthCookies } from "@/app/actions/auth";

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: AuthService.login,
    onSuccess: async (response) => {
      const authData = response.data?.data || response.data;

      await setAuthCookies({
        token: authData.token,
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
      });

      toast.success("Welcome back!", {
        description: "You have successfully logged in.",
      });

      router.push("/dashboard");
    },
    onError: (error: any, variables: any) => {
      const errorMessage = error.response?.data?.message || "An unexpected error occurred.";

      if (errorMessage.includes("Email not verified")) {
        toast.error("Verification Required", {
          description: "Please verify your email first. Redirecting...",
        });
        router.push(`/verify?email=${encodeURIComponent(variables.email)}`);
        return;
      }

      if (
        errorMessage.includes("suspended") ||
        errorMessage.includes("inactive") ||
        errorMessage.includes("deleted")
      ) {
        toast.error("Account Access Denied", {
          description: errorMessage,
          duration: 6000, 
        });
        return;
      }

      toast.error("Login Failed", {
        description: "Please check your credentials and try again.",
      });
    },
  });

  const form = useForm({
    defaultValues: { email: "", password: "" },
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
      className="flex flex-col gap-6 w-full"
    >
      {loginMutation.isError && (
        <div className="p-4 rounded-2xl bg-red-50/80 border border-red-100 text-red-800 flex items-start shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)] dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-300 animate-in fade-in slide-in-from-top-2 w-full">
          <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-red-900 dark:text-red-200">Access Denied</h4>
            <p className="text-sm mt-1 opacity-90 leading-snug">
              {(loginMutation.error as any).response?.data?.message ||
                "Invalid credentials. Please check your email and password."}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-5 w-full">
        {/* Email Field */}
        <form.Field
          name="email"
          validators={{ onChange: loginSchema.shape.email }}
          children={(field) => (
            <div className="flex flex-col gap-2 w-full">
              <Label htmlFor={field.name} className="text-slate-700 dark:text-slate-300 font-semibold ml-1">
                Email Address
              </Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="name@company.com"
                disabled={loginMutation.isPending}
                className={`h-14 w-full px-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:bg-white focus-visible:ring-offset-2 transition-all ${
                  field.state.meta.errors.length > 0 ? "border-red-400 focus-visible:ring-red-500 bg-red-50/30" : "focus-visible:ring-blue-600"
                }`}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-red-500 font-semibold ml-1 animate-in fade-in slide-in-from-top-1">
                  {field.state.meta.errors.map((err: any) => err.message || err).join(", ")}
                </p>
              )}
            </div>
          )}
        />

        {/* Password Field */}
        <form.Field
          name="password"
          validators={{ onChange: loginSchema.shape.password }}
          children={(field) => (
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor={field.name} className="text-slate-700 dark:text-slate-300 font-semibold">
                  Password
                </Label>
                <a
                  href="/forgot-password"
                  className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1"
                >
                  Forgot password?
                </a>
              </div>
              
              <div className="relative w-full flex items-center">
                <Input
                  id={field.name}
                  name={field.name}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={loginMutation.isPending}
                  className={`h-14 w-full px-4 pr-12 rounded-2xl bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:bg-white focus-visible:ring-offset-2 transition-all ${
                    field.state.meta.errors.length > 0 ? "border-red-400 focus-visible:ring-red-500 bg-red-50/30" : "focus-visible:ring-blue-600"
                  }`}
                />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loginMutation.isPending}
                  tabIndex={-1}
                  className="absolute right-4 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-red-500 font-semibold ml-1 animate-in fade-in slide-in-from-top-1">
                  {field.state.meta.errors.map((err: any) => err.message || err).join(", ")}
                </p>
              )}
            </div>
          )}
        />
      </div>

      <Button
        type="submit"
        disabled={loginMutation.isPending}
        className="mt-2 w-full h-14 rounded-2xl text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none disabled:opacity-70 disabled:hover:translate-y-0"
      >
        {loginMutation.isPending ? (
          <>
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            Authenticating...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
}