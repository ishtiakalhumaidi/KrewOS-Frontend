"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AuthService } from "@/services/auth.services";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, KeyRound, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Invalid OTP or request failed.");
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

    // 🚀 Send the payload to your backend
    resetMutation.mutate({
      email: email,
      otp: formData.otp,
      newPassword: formData.newPassword, 
    });
  };

  return (
    <div className="flex flex-col space-y-6 w-full sm:w-[400px] mx-auto">
      {/* Out-of-box top header */}
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create new password</h1>
        <p className="text-sm text-muted-foreground">
          Enter the verification code sent to your email and your new password below.
        </p>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-2">
              <Label className="flex items-center text-zinc-700 dark:text-zinc-300">
                <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                Email
              </Label>
              <Input
                type="email"
                value={email}
                disabled
                className="bg-zinc-100 dark:bg-zinc-900 text-zinc-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center text-zinc-700 dark:text-zinc-300">
                <KeyRound className="w-4 h-4 mr-2 text-muted-foreground" />
                Verification Code (OTP)
              </Label>
              <Input
                placeholder="Enter 6-digit code"
                value={formData.otp}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                required
                className="tracking-widest"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center text-zinc-700 dark:text-zinc-300">
                <Lock className="w-4 h-4 mr-2 text-muted-foreground" />
                New Password
              </Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center text-zinc-700 dark:text-zinc-300">
                <Lock className="w-4 h-4 mr-2 text-muted-foreground" />
                Confirm New Password
              </Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={resetMutation.isPending}
            >
              {resetMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Reset Password
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        Remembered your password?{" "}
        <Link href="/login" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
          Sign in
        </Link>
      </div>
    </div>
  );
}


export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin text-zinc-500" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}