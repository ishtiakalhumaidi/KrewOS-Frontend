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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, HardHat, Building2, User, Mail, Lock } from "lucide-react";
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
      toast.error(error?.response?.data?.message || "Registration failed. Please try again.");
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
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-lg shadow-lg border-zinc-200 dark:border-zinc-800">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-inner">
              <HardHat className="h-7 w-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Create your Workspace</CardTitle>
          <CardDescription>
            Register your company to start managing projects and teams.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center"><Building2 className="w-4 h-4 mr-2 text-muted-foreground"/> Company Name</Label>
              <Input 
                placeholder="e.g., Apex Construction LLC" 
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center"><User className="w-4 h-4 mr-2 text-muted-foreground"/> Full Name</Label>
              <Input 
                placeholder="John Doe" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center"><Mail className="w-4 h-4 mr-2 text-muted-foreground"/> Work Email</Label>
              <Input 
                type="email" 
                placeholder="admin@apexconstruction.com" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center"><Lock className="w-4 h-4 mr-2 text-muted-foreground"/> Password</Label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-4">
            <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-md" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              Register Company
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}