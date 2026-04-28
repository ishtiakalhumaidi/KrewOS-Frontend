/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AuthService } from "@/services/auth.services";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { setAuthCookies } from "@/app/actions/auth";

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const joinMutation = useMutation({
    mutationFn: AuthService.acceptInvite,
    onSuccess: async (response) => {
      const authData = response.data?.data || response.data;
      await setAuthCookies({
        token: authData.token,
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
      });
      toast.success("Account created successfully! Redirecting...");
      router.push("/dashboard");
    },
    onError: (error: any) => {
      const errors = error?.response?.data?.errorSources;
      if (errors?.length) {
        errors.forEach((err: any) => toast.error(err.message));
      } else {
        toast.error(
          error?.response?.data?.message || "Link expired or invalid.",
        );
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    joinMutation.mutate({ token, name, password });
  };

  // Invalid Token State
  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
        <div className="w-full max-w-[520px] bg-white/90 dark:bg-zinc-900/60 rounded-[2.5rem] p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100/80 dark:border-zinc-800/50 backdrop-blur-2xl text-center">
          <div className="h-16 w-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Invalid Invite Link
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2">
            This link is missing a security token or has expired. Please contact
            your administrator for a new invite.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 font-sans selection:bg-blue-200">
      <div className="w-full max-w-[520px] flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Branding Header */}
        <div className="flex flex-col items-center text-center px-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Join the Workspace
          </h1>
          <p className="text-zinc-400 mt-2.5 text-sm sm:text-base font-medium">
            Complete your profile to accept the invitation.
          </p>
        </div>

        {/* The Soft, Floating Card */}
        <div className="bg-white/90 dark:bg-zinc-900/60 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100/80 dark:border-zinc-800/50 backdrop-blur-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {joinMutation.isError && (
              <div className="p-4 rounded-2xl bg-red-50/80 border border-red-100 text-red-800 flex items-start shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)] dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-300 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5 text-red-500" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-red-900 dark:text-red-200">
                    Setup Failed
                  </h4>
                  <p className="text-sm mt-1 opacity-90 leading-snug">
                    {(joinMutation.error as any)?.response?.data?.message ||
                      "Link expired or invalid."}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label className="text-slate-700 dark:text-slate-300 font-semibold ml-1">
                  Full Name
                </Label>
                <Input
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-14 px-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:bg-white focus-visible:ring-offset-2 focus-visible:ring-blue-600 transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-slate-700 dark:text-slate-300 font-semibold ml-1">
                  Create Password
                </Label>
                <div className="relative w-full flex items-center">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className={`h-14 w-full px-4 pr-12 rounded-2xl bg-slate-50/50 dark:bg-zinc-950 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:bg-white focus-visible:ring-offset-2 transition-all ${
                      confirmPassword && password !== confirmPassword
                        ? "border-red-400 focus-visible:ring-red-600 bg-red-50/30"
                        : "border-slate-200 dark:border-zinc-800 focus-visible:ring-blue-600"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-4 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-slate-700 dark:text-slate-300 font-semibold ml-1">
                  Confirm Password
                </Label>
                <div className="relative w-full flex items-center">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className={`h-14 w-full px-4 pr-12 rounded-2xl bg-slate-50/50 dark:bg-zinc-950 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:bg-white focus-visible:ring-offset-2 transition-all ${
                      confirmPassword && password !== confirmPassword
                        ? "border-red-400 focus-visible:ring-red-600 bg-red-50/30"
                        : "border-slate-200 dark:border-zinc-800 focus-visible:ring-blue-600"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    className="absolute right-4 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 font-semibold ml-1 -mt-3 animate-in fade-in slide-in-from-top-1">
                  Passwords do not match.
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={joinMutation.isPending}
              className="mt-2 h-14 rounded-2xl text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {joinMutation.isPending ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account & Join"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <JoinForm />
    </Suspense>
  );
}
