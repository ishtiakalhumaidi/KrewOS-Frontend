/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { AuthService } from "@/services/auth.services";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const forgotPasswordMutation = useMutation({
    mutationFn: AuthService.forgotPassword,
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success("Reset link sent! Please check your email.");
    },
    onError: (error: any) => {
      const errors = error?.response?.data?.errorSources;
      if (errors?.length) {
        errors.forEach((err: any) => toast.error(err.message));
      } else {
        toast.error(
          error?.response?.data?.message || "Failed to send reset email.",
        );
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email address.");
    forgotPasswordMutation.mutate(email);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 font-sans selection:bg-blue-200">
      <div className="w-full max-w-130 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Branding Header */}
        <div className="flex flex-col items-center text-center px-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Forgot Password?
          </h1>
          <p className="text-zinc-400 mt-2.5 text-sm sm:text-base font-medium">
            Enter your email and we&apos;ll send a reset link.
          </p>
        </div>

        {/* The Soft, Floating Card */}
        <div className="bg-white/90 dark:bg-zinc-900/60 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100/80 dark:border-zinc-800/50 backdrop-blur-2xl">
          {isSubmitted ? (
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shadow-inner">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Check your email
                </h2>
                <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2">
                  We&apos;ve sent a verification code to <br />
                  <span className="font-semibold text-slate-700 dark:text-zinc-200">
                    {email}
                  </span>
                  .
                </p>
              </div>

              <Link
                href={`/reset-password?email=${encodeURIComponent(email)}`}
                className="w-full"
              >
                <Button className="w-full h-14 rounded-2xl text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none">
                  Enter Code to Reset Password
                </Button>
              </Link>

              <button
                type="button"
                className="text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-300 transition-colors"
                onClick={() => setIsSubmitted(false)}
              >
                Didn&apos;t receive it? Try again
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {forgotPasswordMutation.isError && (
                <div className="p-4 rounded-2xl bg-red-50/80 border border-red-100 text-red-800 flex items-start shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)] dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-300 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5 text-red-500" />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-red-900 dark:text-red-200">
                      Request Failed
                    </h4>
                    <p className="text-sm mt-1 opacity-90 leading-snug">
                      {(forgotPasswordMutation.error as any).response?.data
                        ?.message || "An error occurred."}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label className="text-slate-700 dark:text-slate-300 font-semibold ml-1">
                  Work Email
                </Label>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={forgotPasswordMutation.isPending}
                  className="h-14 px-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:bg-white focus-visible:ring-offset-2 focus-visible:ring-blue-600 transition-all"
                />
              </div>

              <Button
                type="submit"
                disabled={forgotPasswordMutation.isPending}
                className="mt-2 h-14 rounded-2xl text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {forgotPasswordMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span>Send Reset OTP</span>
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          )}
        </div>

        {/* Footer Link */}
        <div className="text-center text-sm font-medium text-zinc-400">
          Remember your password?{" "}
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
