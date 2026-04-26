/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { AuthService } from "@/services/auth.services";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
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
    errors.forEach((err: any) => {
      toast.error(err.message);
    });
  } else {
    toast.error(error?.response?.data?.message || "Failed to send reset email.");
  }
}
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email address.");
    forgotPasswordMutation.mutate(email);
  };

 if (isSubmitted) {
    return (
      <div className="flex flex-col space-y-6 w-full sm:w-[400px] mx-auto text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            We&apos;ve sent a verification code to <span className="font-medium text-zinc-900 dark:text-zinc-100">{email}</span>.
          </p>
        </div>
        
       
        <Link href={`/reset-password?email=${encodeURIComponent(email)}`}>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Enter Code to Reset Password
          </Button>
        </Link>
        
        <Button variant="ghost" className="w-full" onClick={() => setIsSubmitted(false)}>
          Didn&apos;t receive it? Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 w-full sm:w-[400px] mx-auto">
      {/* Out-of-box top header matching login/register */}
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Forgot password?</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a link to reset it.
        </p>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center text-zinc-700 dark:text-zinc-300">
                <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                Work Email
              </Label>
              <Input
                type="email"
                placeholder="admin@apexconstruction.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              <span>Send Reset OTP</span>
              {!forgotPasswordMutation.isPending && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/login" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
          Sign in
        </Link>
      </div>
    </div>
  );
}