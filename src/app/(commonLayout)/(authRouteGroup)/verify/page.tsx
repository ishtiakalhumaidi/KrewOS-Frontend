/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AuthService } from "@/services/auth.services";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, MailCheck, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function VerifyEmailPage() {
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
      toast.error(error?.response?.data?.message || "Failed to resend code.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code) {
      return toast.error("Please provide both email and the 6-digit code.");
    }
    // Remove spaces just in case
    verifyMutation.mutate({ email, otp: code.trim() });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <Card className="w-full max-w-md shadow-lg border-zinc-200 dark:border-zinc-800 text-center">
        <CardHeader className="space-y-3 pb-6">
          <div className="flex justify-center mb-2">
            <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <MailCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Verify your Email
          </CardTitle>
          <CardDescription className="text-base">
            We sent a 6-digit code to <br />
            <span className="font-semibold text-zinc-900 dark:text-white">
              {email || "your email address"}
            </span>
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {!emailParam && (
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-center"
                required
              />
            )}

            <Input
              type="text"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="text-center text-2xl tracking-[0.5em] font-mono h-14"
              maxLength={6}
              required
            />
          </CardContent>
          <CardFooter className="flex flex-col pt-4">
            <Button
              type="submit"
              className="w-full h-11 bg-zinc-900 dark:bg-zinc-100 text-md"
              disabled={verifyMutation.isPending || code.length < 6}
            >
              {verifyMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <ArrowRight className="h-5 w-5 mr-2" />
              )}
              Verify & Continue
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="text-center mt-4">
        <p className="text-sm text-muted-foreground">
          Code expired or didn't receive it?
        </p>
        <Button
          variant="link"
          type="button"
          disabled={resendMutation.isPending}
          onClick={() => resendMutation.mutate(email)}
          className="text-blue-600 font-semibold"
        >
          {resendMutation.isPending && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          Resend Verification Code
        </Button>
      </div>
    </div>
  );
}
