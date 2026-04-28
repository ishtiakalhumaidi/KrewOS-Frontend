/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AuthService } from "@/services/auth.services";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function RegisterForm() {
  const router = useRouter();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "", 
  });

  const registerMutation = useMutation({
    mutationFn: AuthService.registerCompany,
    onSuccess: () => {
      toast.success("Welcome to KrewOS!", {
        description: "Please check your email for the verification code.",
      });
      router.push(`/verify?email=${encodeURIComponent(formData.email)}`);
    },
    onError: (error: any) => {
      const errors = error?.response?.data?.errorSources;

      if (errors?.length) {
        errors.forEach((err: any) => {
          toast.error("Registration Issue", { description: err.message });
        });
      } else {
        toast.error("Registration Failed", {
          description: error?.response?.data?.message || "Please try again.",
        });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      return toast.error("Missing Information", {
        description: "Please fill in all fields to continue.",
      });
    }

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match", {
        description: "Please ensure both password fields are exactly the same.",
      });
    }

    const { confirmPassword, ...apiPayload } = formData;
    registerMutation.mutate(apiPayload);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
      
      {/* Inline Error Banner */}
      {registerMutation.isError && (
        <div className="p-4 rounded-2xl bg-red-50/80 border border-red-100 text-red-800 flex items-start shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)] dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-300 animate-in fade-in slide-in-from-top-2 w-full">
          <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-red-900 dark:text-red-200">Registration Failed</h4>
            <p className="text-sm mt-1 opacity-90 leading-snug">
              {(registerMutation.error as any)?.response?.data?.message ||
                "There was a problem creating your workspace. Please verify your details."}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-5 w-full">
        
        {/* Company Name */}
        <div className="flex flex-col gap-2 w-full">
          <Label className="text-slate-700 dark:text-slate-300 font-semibold ml-1">
            Company Name
          </Label>
          <Input
            placeholder="e.g., Apex Construction LLC"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            required
            disabled={registerMutation.isPending}
            className="h-14 px-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:bg-white focus-visible:ring-offset-2 focus-visible:ring-blue-600 transition-all w-full"
          />
        </div>

        {/* Full Name */}
        <div className="flex flex-col gap-2 w-full">
          <Label className="text-slate-700 dark:text-slate-300 font-semibold ml-1">
            Full Name
          </Label>
          <Input
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={registerMutation.isPending}
            className="h-14 px-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:bg-white focus-visible:ring-offset-2 focus-visible:ring-blue-600 transition-all w-full"
          />
        </div>

        {/* Work Email */}
        <div className="flex flex-col gap-2 w-full">
          <Label className="text-slate-700 dark:text-slate-300 font-semibold ml-1">
            Work Email
          </Label>
          <Input
            type="email"
            placeholder="admin@apexconstruction.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={registerMutation.isPending}
            className="h-14 px-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:bg-white focus-visible:ring-offset-2 focus-visible:ring-blue-600 transition-all w-full"
          />
        </div>

        {/* 👉 THE FIX: Changed grid to a strict flex-col to force stacked inputs! */}
        <div className="flex flex-col gap-5 w-full">
          {/* Password */}
          <div className="flex flex-col gap-2 w-full">
            <Label className="text-slate-700 dark:text-slate-300 font-semibold ml-1">
              Password
            </Label>
            <div className="relative w-full flex items-center">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
                disabled={registerMutation.isPending}
                className={`h-14 w-full px-4 pr-12 rounded-2xl bg-slate-50/50 dark:bg-zinc-950 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:bg-white focus-visible:ring-offset-2 transition-all ${
                  formData.confirmPassword && formData.password !== formData.confirmPassword 
                  ? "border-red-400 focus-visible:ring-red-600 bg-red-50/30" 
                  : "border-slate-200 dark:border-zinc-800 focus-visible:ring-blue-600"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={registerMutation.isPending}
                tabIndex={-1}
                className="absolute right-4 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-2 w-full">
            <Label className="text-slate-700 dark:text-slate-300 font-semibold ml-1">
              Confirm Password
            </Label>
            <div className="relative w-full flex items-center">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                minLength={8}
                disabled={registerMutation.isPending}
                className={`h-14 w-full px-4 pr-12 rounded-2xl bg-slate-50/50 dark:bg-zinc-950 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:bg-white focus-visible:ring-offset-2 transition-all ${
                  formData.confirmPassword && formData.password !== formData.confirmPassword 
                  ? "border-red-400 focus-visible:ring-red-600 bg-red-50/30" 
                  : "border-slate-200 dark:border-zinc-800 focus-visible:ring-blue-600"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={registerMutation.isPending}
                tabIndex={-1}
                className="absolute right-4 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Dynamic Password Hint */}
        {formData.confirmPassword && formData.password !== formData.confirmPassword ? (
           <p className="text-xs text-red-500 font-semibold ml-1 -mt-3 animate-in fade-in slide-in-from-top-1">
             Passwords do not match.
           </p>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400 ml-1 -mt-3">
            Must be at least 8 characters.
          </p>
        )}

      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={registerMutation.isPending}
        className="mt-2 w-full h-14 rounded-2xl text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none disabled:opacity-70 disabled:hover:translate-y-0"
      >
        {registerMutation.isPending ? (
          <>
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            Creating Workspace...
          </>
        ) : (
          "Register Company"
        )}
      </Button>
    </form>
  );
}