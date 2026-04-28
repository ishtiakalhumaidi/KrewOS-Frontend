/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MemberService } from "@/services/member.services";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Link from "next/link";

export default function CompanySettingsPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ name: "", slug: "" });
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ["company-settings"],
    queryFn: MemberService.getCompanySettings,
  });

  const updateMutation = useMutation({
    mutationFn: MemberService.updateCompany,
    onSuccess: () => {
      toast.success("Organization details updated!");
      queryClient.invalidateQueries({ queryKey: ["company-settings"] });
    },
    onError: (error: any) => {
      const errors = error?.response?.data?.errorSources;
      if (errors?.length) {
        errors.forEach((err: any) => toast.error(err.message));
      } else {
        toast.error(error?.response?.data?.message || "Update failed.");
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    if (formData.name) fd.append("name", formData.name);
    if (formData.slug) fd.append("slug", formData.slug);
    if (logoFile) fd.append("logo", logoFile);
    updateMutation.mutate(fd);
  };

  const company = response?.data;

  if (isLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-4xl mx-auto space-y-8 pb-12 pt-4">
      
      <div className="space-y-4 px-1">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Workspace Settings</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-lg font-medium">Manage your company profile, branding, and core workspace preferences.</p>
      </div>

      <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-100 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/10">
          <CardTitle className="flex items-center text-2xl font-bold tracking-tight">
            <Building2 className="h-6 w-6 mr-3 text-blue-600 dark:text-blue-400" /> Organization Profile
          </CardTitle>
          <CardDescription className="text-base mt-2">Update your company branding and workspace slug.</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700 dark:text-slate-300 ml-1">Legal Company Name</Label>
              <Input 
                defaultValue={company?.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                placeholder="Apex Construction LLC"
                className="h-14 px-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] focus-visible:ring-blue-600 transition-all text-base"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="font-bold text-slate-700 dark:text-slate-300 ml-1">Workspace URL Slug</Label>
              <div className="flex items-center shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden bg-slate-50/50 dark:bg-zinc-950 focus-within:ring-2 focus-within:ring-blue-600 transition-all h-14">
                <span className="px-4 text-slate-500 dark:text-slate-400 font-medium border-r border-slate-200 dark:border-zinc-800 bg-slate-100/50 dark:bg-zinc-900 h-full flex items-center select-none">
                  krewos.com/
                </span>
                <Input 
                  defaultValue={company?.slug} 
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })} 
                  className="h-full border-0 rounded-none bg-transparent shadow-none focus-visible:ring-0 text-base" 
                  placeholder="apex-construction"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700 dark:text-slate-300 ml-1">Company Logo (Optional)</Label>
              <Input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="h-14 px-4 rounded-2xl bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)] transition-all pt-3 cursor-pointer"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
              <Button type="submit" disabled={updateMutation.isPending} className="w-full sm:w-auto h-14 px-8 rounded-2xl text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] transition-all active:scale-95">
                {updateMutation.isPending ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : null}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-[2.5rem] border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/10 shadow-sm overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-indigo-800 dark:text-indigo-400 flex items-center text-xl font-bold tracking-tight">
            <ShieldCheck className="h-6 w-6 mr-3" /> Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="text-indigo-900/70 dark:text-indigo-300/70 font-medium mb-1">Current Plan</p>
            <p className="text-3xl font-extrabold text-indigo-900 dark:text-indigo-300 uppercase tracking-tight">
              {company?.subscription?.plan || "FREE TIER"}
            </p>
          </div>
          <Link href="/admin/settings/billing">
            <Button className="w-full sm:w-auto h-12 px-6 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all active:scale-95">
              Manage Billing & Plans
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}