/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AuthService } from "@/services/auth.services";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "sonner";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const resetMutation = useMutation({
    mutationFn: AuthService.resetPassword,
    onSuccess: () => {
      toast.success("Password reset successfully! You can now log in.");
      router.push("/login");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Invalid OTP or request failed.",
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("Passwords do not match!");
    }
    if (formData.otp.length < 4) {
      return toast.error("Please enter a valid OTP code.");
    }
    resetMutation.mutate({
      email: email,
      otp: formData.otp,
      newPassword: formData.newPassword,
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 font-sans selection:bg-blue-200">
      <div className="w-full max-w-[520px] flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Branding Header */}
        <div className="flex flex-col items-center text-center px-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Create New Password
          </h1>
          <p className="text-zinc-400 mt-2.5 text-sm sm:text-base font-medium">
            Enter the verification code and your new password.
          </p>
        </div>

        {/* The Soft, Floating Card */}
        <div className="bg-white/90 dark:bg-zinc-900/60 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100/80 dark:border-zinc-800/50 backdrop-blur-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {resetMutation.isError && (
              <div className="p-4 rounded-2xl bg-red-50/80 border border-red-100 text-red-800 flex items-start shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)] dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-300 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5 text-red-500" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-red-900 dark:text-red-200">
                    Reset Failed
                  </h4>
                  <p className="text-sm mt-1 opacity-90 leading-snug">
                    {(resetMutation.error as any).response?.data?.message ||
                      "Invalid OTP or request failed."}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-5">
              {/* Email (Disabled) */}
              <div className="flex flex-col gap-2">
                <Label className="text-slate-700 dark:text-slate-300 font-semibold ml-1">
                  Email
                </Label>
                <Input
                  type="email"
                  value={email}
                  disabled
                  className="h-14 px-4 rounded-2xl bg-slate-100/50 dark:bg-zinc-950/50 border-slate-200 dark:border-zinc-800 text-slate-500"
                />
              </div>

              {/* OTP */}
              <div className="flex flex-col gap-2">
                <Label className="text-slate-700 dark:text-slate-300 font-semibold ml-1">
                  Verification Code
                </Label>
                <Input
                  placeholder="Enter 6-digit code"
                  value={formData.otp}
                  onChange={(e) =>
                    setFormData({ ...formData, otp: e.target.value })
                  }
                  required
                  className="h-14 px-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] tracking-widest text-center text-lg font-bold focus-visible:bg-white focus-visible:ring-offset-2 focus-visible:ring-blue-600 transition-all"
                />
              </div>

              {/* New Password */}
              <div className="flex flex-col gap-2">
                <Label className="text-slate-700 dark:text-slate-300 font-semibold ml-1">
                  New Password
                </Label>
                <div className="relative w-full flex items-center">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                    required
                    minLength={8}
                    className={`h-14 w-full px-4 pr-12 rounded-2xl bg-slate-50/50 dark:bg-zinc-950 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:bg-white focus-visible:ring-offset-2 transition-all ${
                      formData.confirmPassword &&
                      formData.newPassword !== formData.confirmPassword
                        ? "border-red-400 focus-visible:ring-red-600 bg-red-50/30"
                        : "border-slate-200 dark:border-zinc-800 focus-visible:ring-blue-600"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex={-1}
                    className="absolute right-4 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors focus:outline-none"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-2">
                <Label className="text-slate-700 dark:text-slate-300 font-semibold ml-1">
                  Confirm New Password
                </Label>
                <div className="relative w-full flex items-center">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    minLength={8}
                    className={`h-14 w-full px-4 pr-12 rounded-2xl bg-slate-50/50 dark:bg-zinc-950 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:bg-white focus-visible:ring-offset-2 transition-all ${
                      formData.confirmPassword &&
                      formData.newPassword !== formData.confirmPassword
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

              {formData.confirmPassword &&
                formData.newPassword !== formData.confirmPassword && (
                  <p className="text-xs text-red-500 font-semibold ml-1 -mt-3 animate-in fade-in slide-in-from-top-1">
                    Passwords do not match.
                  </p>
                )}
            </div>

            <Button
              type="submit"
              disabled={resetMutation.isPending}
              className="mt-2 h-14 rounded-2xl text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {resetMutation.isPending ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </div>

        {/* Footer Link */}
        <div className="text-center text-sm font-medium text-zinc-400">
          Remembered your password?{" "}
          <Link
            href="/login"
            className="text-blue-400 hover:text-blue-300 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md px-1"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
