/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AuthService } from "@/services/auth.services";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MailCheck, ArrowRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [email, setEmail] = useState(emailParam);

  const verifyMutation = useMutation({
    mutationFn: AuthService.verifyEmail,
    onSuccess: () => {
      toast.success("Email verified successfully! You can now log in.");
      router.push("/login");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Invalid or expired verification code.",
      );
    },
  });

  const resendMutation = useMutation({
    mutationFn: (email: string) => AuthService.resendVerificationCode(email),
    onSuccess: () => {
      toast.success("New code sent! Please check your inbox.");
    },
    onError: (error: any) => {
      const errors = error?.response?.data?.errorSources;
      if (errors?.length) {
        errors.forEach((err: any) => toast.error(err.message));
      } else {
        toast.error(error?.response?.data?.message || "Failed to resend code.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code) {
      return toast.error("Please provide both email and the 6-digit code.");
    }
    verifyMutation.mutate({ email, otp: code.trim() });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 font-sans selection:bg-blue-200">
      <div className="w-full max-w-[520px] flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Branding Header */}
        <div className="flex flex-col items-center text-center px-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Verify your Email
          </h1>
          <p className="text-zinc-400 mt-2.5 text-sm sm:text-base font-medium">
            We sent a 6-digit code to your inbox.
          </p>
        </div>

        {/* The Soft, Floating Card */}
        <div className="bg-white/90 dark:bg-zinc-900/60 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100/80 dark:border-zinc-800/50 backdrop-blur-2xl">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <MailCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Enter Code
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1.5">
              Code sent to{" "}
              <span className="font-semibold text-slate-700 dark:text-zinc-200">
                {email || "your email address"}
              </span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Inline Error Banner */}
            {verifyMutation.isError && (
              <div className="p-4 rounded-2xl bg-red-50/80 border border-red-100 text-red-800 flex items-start shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)] dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-300 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5 text-red-500" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-red-900 dark:text-red-200">
                    Verification Failed
                  </h4>
                  <p className="text-sm mt-1 opacity-90 leading-snug">
                    {(verifyMutation.error as any)?.response?.data?.message ||
                      "Invalid or expired verification code."}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-5">
              {!emailParam && (
                <div className="flex flex-col gap-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-semibold ml-1">
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-14 px-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:bg-white focus-visible:ring-offset-2 focus-visible:ring-blue-600 transition-all text-center"
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Input
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  required
                  disabled={verifyMutation.isPending}
                  className={`h-14 px-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] text-center text-2xl tracking-[0.5em] font-mono focus-visible:bg-white focus-visible:ring-offset-2 transition-all ${
                    verifyMutation.isError
                      ? "border-red-400 focus-visible:ring-red-500 bg-red-50/30"
                      : "focus-visible:ring-blue-600"
                  }`}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={verifyMutation.isPending || code.length < 6}
              className="mt-2 h-14 rounded-2xl text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {verifyMutation.isPending ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <span>Verify & Continue</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer Link */}
        <div className="text-center text-sm font-medium text-zinc-400 flex flex-col items-center gap-1">
          <p>Code expired or didn't receive it?</p>
          <button
            type="button"
            disabled={resendMutation.isPending}
            onClick={() => resendMutation.mutate(email)}
            className="text-blue-400 hover:text-blue-300 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md px-1 flex items-center disabled:opacity-50 disabled:no-underline"
          >
            {resendMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Resend Verification Code
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center min-h-screen items-center">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
