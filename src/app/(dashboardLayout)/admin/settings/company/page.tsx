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
    errors.forEach((err: any) => {
      toast.error(err.message);
    });
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
    if (logoFile) fd.append("logo", logoFile); // Match multer config

    updateMutation.mutate(fd);
  };

  const company = response?.data;

  if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Building2 className="h-5 w-5 mr-2 text-blue-600" /> Organization Profile
          </CardTitle>
          <CardDescription>Update your company branding and workspace slug.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Legal Company Name</Label>
              <Input 
                defaultValue={company?.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                placeholder="Apex Construction LLC"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Workspace URL Slug</Label>
              <div className="flex items-center">
                <span className="bg-zinc-100 dark:bg-zinc-800 px-3 h-10 flex items-center border border-r-0 rounded-l-md text-sm text-muted-foreground">
                  krewos.com/
                </span>
                <Input 
                  defaultValue={company?.slug} 
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })} 
                  className="rounded-l-none focus-visible:ring-0" 
                  placeholder="apex-construction"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Company Logo (Optional)</Label>
              <Input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              />
            </div>

            <Button type="submit" disabled={updateMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Update Organization
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-orange-50/20 shadow-sm">
        <CardHeader>
          <CardTitle className="text-orange-800 flex items-center text-lg">
            <ShieldCheck className="h-5 w-5 mr-2" /> Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-orange-700">
            Current Plan: <strong className="uppercase">{company?.subscription?.plan || "FREE TIER"}</strong>
          </p>
          <Button variant="outline" className="mt-4 border-orange-300 text-orange-800 hover:bg-orange-100">
            View Billing & Usage
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}