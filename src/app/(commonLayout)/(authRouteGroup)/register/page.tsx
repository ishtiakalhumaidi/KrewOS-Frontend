/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AuthService } from "@/services/auth.services";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Building2, User, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: "",
    name: "",
    email: "",
    password: "",
  });

  const registerMutation = useMutation({
    mutationFn: AuthService.registerCompany,
    onSuccess: () => {
      toast.success("Account created! Please check your email for the verification code.");
      // 👉 Redirect to the verification page and pass the email in the URL!
      router.push(`/verify?email=${encodeURIComponent(formData.email)}`);
    },
   onError: (error: any) => {
  const errors = error?.response?.data?.errorSources;

  if (errors?.length) {
    errors.forEach((err: any) => {
      toast.error(err.message);
    });
  } else {
    toast.error(error?.response?.data?.message || "Registration failed. Please try again.");
  }
}
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.name || !formData.email || !formData.password) {
      return toast.error("Please fill in all fields.");
    }
    registerMutation.mutate(formData);
  };

  return (
    <div className="flex flex-col space-y-6 w-full sm:w-[400px] mx-auto">
      {/* 👉 Clean, out-of-box top header */}
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your Workspace
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your company details below to get started.
        </p>
      </div>

      {/* 👉 Clean White Card Layout */}
      <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-2">
              <Label className="flex items-center text-zinc-700 dark:text-zinc-300">
                <Building2 className="w-4 h-4 mr-2 text-muted-foreground"/> 
                Company Name
              </Label>
              <Input 
                placeholder="e.g., Apex Construction LLC" 
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center text-zinc-700 dark:text-zinc-300">
                <User className="w-4 h-4 mr-2 text-muted-foreground"/> 
                Full Name
              </Label>
              <Input 
                placeholder="John Doe" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center text-zinc-700 dark:text-zinc-300">
                <Mail className="w-4 h-4 mr-2 text-muted-foreground"/> 
                Work Email
              </Label>
              <Input 
                type="email" 
                placeholder="admin@apexconstruction.com" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center text-zinc-700 dark:text-zinc-300">
                <Lock className="w-4 h-4 mr-2 text-muted-foreground"/> 
                Password
              </Label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white" 
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Register Company
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
          Sign in
        </Link>
      </div>
    </div>
  );
}