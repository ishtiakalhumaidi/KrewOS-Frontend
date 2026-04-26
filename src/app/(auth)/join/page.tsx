/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AuthService } from "@/services/auth.services";

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
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { setAuthCookies } from "@/app/actions/auth";

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
        errors.forEach((err: any) => {
          toast.error(err.message);
        });
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
      toast.error("Passwords do not match");
      return;
    }

    // Hits your backend: POST /auth/accept-invite
    joinMutation.mutate({
      token,
      name,
      password,
    });
  };

  if (!token) {
    return (
      <Card className="max-w-md mx-auto mt-20 border-destructive">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold">Invalid Invite Link</h2>
          <p className="text-muted-foreground mt-2">
            This link is missing a security token or has expired.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
      <Card className="w-full max-w-md shadow-xl border-zinc-200 dark:border-zinc-800">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            You've been invited to join the company on KrewOS.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Create Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* DYNAMIC ERROR CATCHER */}
            {joinMutation.isError && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md space-y-1">
                {(joinMutation.error as any)?.response?.data?.errorSources?.map(
                  (err: any, index: number) => (
                    <div key={index} className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {err.message}
                    </div>
                  ),
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11"
              disabled={joinMutation.isPending}
            >
              {joinMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Create Account & Join
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      }
    >
      <JoinForm />
    </Suspense>
  );
}
