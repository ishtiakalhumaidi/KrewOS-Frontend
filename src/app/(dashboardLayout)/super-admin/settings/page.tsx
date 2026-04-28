/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BillingService } from "@/services/billing.services";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Settings2, Save, X, Building2, Zap, ShieldAlert, Star, Check } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function SuperAdminGlobalSettingsPage() {
  const queryClient = useQueryClient();
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  const [editForm, setEditForm] = useState<any>({});

  // 1. Fetch Plans
  const { data: response, isLoading } = useQuery({
    queryKey: ["global-plans"],
    queryFn: BillingService.getPlans,
  });

  // 2. Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ planId, data }: { planId: string; data: any }) =>
      BillingService.updatePlan({ planId, data }),
    onSuccess: () => {
      toast.success("Plan configuration updated successfully!");
      setEditingPlanId(null);
      queryClient.invalidateQueries({ queryKey: ["global-plans"] });
    },
    onError: (error: any) => {
      const errors = error?.response?.data?.errorSources;
      if (errors?.length) {
        errors.forEach((err: any) => toast.error(err.message));
      } else {
        toast.error(error?.response?.data?.message || "Failed to update plan.");
      }
    }
  });
    
  const seedMutation = useMutation({
    mutationFn: BillingService.seedPlans,
    onSuccess: () => {
      toast.success("Database seeded with default plans!");
      queryClient.invalidateQueries({ queryKey: ["global-plans"] });
    },
    onError: (error: any) => {
      const errors = error?.response?.data?.errorSources;
      if (errors?.length) {
        errors.forEach((err: any) => toast.error(err.message));
      } else {
        toast.error(error?.response?.data?.message || "Failed to seed plans.");
      }
    }
  });

  if (isLoading)
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );

  let plans = response?.data?.data || response?.data || [];
  plans = plans.sort((a: any, b: any) => Number(a.price) - Number(b.price));

  // 🌟 EMPTY STATE
  if (plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <ShieldAlert className="w-16 h-16 text-amber-500 mb-2" />
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">No Pricing Plans Found</h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-md">
          Your database is currently empty. You must initialize the core Subscription Plans (FREE, PRO, ENTERPRISE) before companies can register or upgrade.
        </p>
        <Button
          size="lg"
          onClick={() => seedMutation.mutate()}
          disabled={seedMutation.isPending}
          className="bg-amber-600 hover:bg-amber-700 text-white mt-4 rounded-xl font-bold"
        >
          {seedMutation.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
          Initialize Database Plans
        </Button>
      </div>
    );
  }

  const handleEditClick = (plan: any) => {
    setEditingPlanId(plan.id);
    setEditForm({
      name: plan.name,
      price: plan.price,
      description: plan.description,
      features: (Array.isArray(plan.features) ? plan.features : []).join("\n"),
      maxProjects: plan.maxProjects,
      maxMembers: plan.maxMembers,
      maxStorage: plan.maxStorage,
    });
  };

  const handleSave = (planId: string) => {
    const featuresArray = editForm.features
      .split("\n")
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0);

    updateMutation.mutate({
      planId,
      data: {
        ...editForm,
        features: featuresArray,
        price: Number(editForm.price),
        maxProjects: Number(editForm.maxProjects),
        maxMembers: Number(editForm.maxMembers),
        maxStorage: Number(editForm.maxStorage),
      },
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Global Platform Settings
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-lg">
          Configure pricing tiers, system limits, and display features for your SaaS.
        </p>
      </div>

      <div className="flex items-center text-sm font-medium text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 px-5 py-3 rounded-xl border border-blue-200 dark:border-blue-800/50 w-fit">
        <Settings2 className="w-5 h-5 mr-3 shrink-0" /> 
        Changes made here will instantly reflect on the public pricing page and customer checkouts.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6 items-stretch">
        {plans.map((plan: any) => {
          const isEditing = editingPlanId === plan.id;
          const PlanIcon = plan.tier === "ENTERPRISE" ? Building2 : plan.tier === "PRO" ? Zap : Star;
          const isHighlight = plan.tier === "PRO";

          return (
            <Card
              key={plan.id}
              className={cn(
                "flex flex-col relative transition-all duration-300 rounded-[2rem] border overflow-hidden h-full",
                isEditing 
                  ? "ring-2 ring-blue-500 shadow-xl border-blue-500 bg-white dark:bg-zinc-900" 
                  : isHighlight 
                    ? "border-blue-200 dark:border-blue-800/60 shadow-lg bg-white dark:bg-zinc-900" 
                    : "border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md bg-white dark:bg-zinc-900"
              )}
            >
              {/* ─── DISPLAY MODE ─── */}
              {!isEditing ? (
                <>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <Badge className={cn("uppercase font-bold tracking-wider rounded-lg px-3 py-1 shadow-none", isHighlight ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300")}>
                        {plan.tier}
                      </Badge>
                      <div className={cn("p-2 rounded-xl", isHighlight ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400")}>
                        <PlanIcon className="w-5 h-5" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-white">{plan.name}</CardTitle>
                    <CardDescription className="mt-2 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col space-y-6">
                    <div className="flex items-baseline gap-1 pb-4 border-b border-slate-100 dark:border-zinc-800">
                      <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">
                        ${plan.price}
                      </span>
                      <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                        /{plan.interval.replace("per ", "")}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Public Features</p>
                      {(Array.isArray(plan.features) ? plan.features : []).map((feature: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 text-sm">
                          <Check className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" strokeWidth={3} />
                          <span className="text-zinc-700 dark:text-zinc-300">{feature}</span>
                        </div>
                      ))}
                    </div>

                  
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800">
                      <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">System Limits</p>
                      <div className="grid grid-cols-2 gap-3">
                        
                        {/* Max Projects Block */}
                        <div className="bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800 flex flex-col justify-center">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 mb-1">Projects</span>
                          <span className={cn("font-bold text-lg leading-none", plan.maxProjects === 999999 ? "text-blue-600 dark:text-blue-400 text-base" : "text-zinc-900 dark:text-white")}>
                            {plan.maxProjects === 999999 ? "Unlimited" : plan.maxProjects}
                          </span>
                        </div>

                        {/* Max Members Block */}
                        <div className="bg-slate-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800 flex flex-col justify-center">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 mb-1">Members</span>
                          <span className={cn("font-bold text-lg leading-none", plan.maxMembers === 999999 ? "text-blue-600 dark:text-blue-400 text-base" : "text-zinc-900 dark:text-white")}>
                            {plan.maxMembers === 999999 ? "Unlimited" : plan.maxMembers}
                          </span>
                        </div>
                        
                      </div>
                    </div>

                  </CardContent>

                  <CardFooter className="mt-auto pt-4 pb-6 px-6">
                    <Button
                      variant="outline"
                      className="w-full h-12 rounded-xl font-bold bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all active:scale-95"
                      onClick={() => handleEditClick(plan)}
                    >
                      <Settings2 className="w-4 h-4 mr-2" />
                      Edit Configuration
                    </Button>
                  </CardFooter>
                </>
              ) : (
                /* ─── EDITING MODE ─── */
                <>
                  <CardHeader className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/40 pb-5">
                    <CardTitle className="text-lg flex items-center text-blue-700 dark:text-blue-400">
                      <Settings2 className="w-5 h-5 mr-2" />
                      Editing {plan.tier}
                    </CardTitle>
                    <CardDescription className="text-blue-600/70 dark:text-blue-400/70">
                      Changes map directly to your live database.
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-5 pt-6 flex-1">
                    <div className="space-y-1.5">
                      <Label className="text-zinc-700 dark:text-zinc-300">Display Name</Label>
                      <Input
                        className="rounded-xl h-11 bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    </div>

                    {plan.tier !== "FREE" && (
                      <div className="space-y-1.5">
                        <Label className="text-zinc-700 dark:text-zinc-300">Monthly Price ($)</Label>
                        <Input
                          type="number"
                          className="rounded-xl h-11 bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 font-bold text-zinc-900 dark:text-white"
                          value={editForm.price}
                          onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label className="text-zinc-700 dark:text-zinc-300">Short Description</Label>
                      <Textarea
                        value={editForm.description}
                        className="min-h-[80px] rounded-xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
                      <Label className="text-zinc-700 dark:text-zinc-300 font-bold">Public Features List</Label>
                      <p className="text-xs text-zinc-500 mb-2">Put each feature on a new line. These display as bullet points.</p>
                      <Textarea
                        value={editForm.features}
                        className="min-h-[140px] rounded-xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 leading-relaxed text-zinc-900 dark:text-white"
                        onChange={(e) => setEditForm({ ...editForm, features: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-zinc-800">
                      <div className="space-y-1.5">
                        <Label className="text-zinc-700 dark:text-zinc-300 font-bold text-xs uppercase">Hard Limit: Projects</Label>
                        <Input
                          type="number"
                          className="rounded-xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                          value={editForm.maxProjects}
                          onChange={(e) => setEditForm({ ...editForm, maxProjects: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-zinc-700 dark:text-zinc-300 font-bold text-xs uppercase">Hard Limit: Members</Label>
                        <Input
                          type="number"
                          className="rounded-xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                          value={editForm.maxMembers}
                          onChange={(e) => setEditForm({ ...editForm, maxMembers: e.target.value })}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400 font-medium text-center bg-slate-50 dark:bg-zinc-950 py-2 rounded-lg mt-2 border border-slate-100 dark:border-zinc-800">
                      * Use <span className="font-mono text-zinc-900 dark:text-white font-bold">999999</span> for Unlimited.
                    </p>
                  </CardContent>

                  <CardFooter className="flex gap-3 bg-slate-50 dark:bg-zinc-950 p-6 mt-auto border-t border-slate-200 dark:border-zinc-800">
                    <Button
                      variant="outline"
                      className="flex-1 h-12 rounded-xl font-bold bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800"
                      onClick={() => setEditingPlanId(null)}
                      disabled={updateMutation.isPending}
                    >
                      <X className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                    <Button
                      className="flex-1 h-12 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-0.5 active:translate-y-0"
                      onClick={() => handleSave(plan.id)}
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-5 h-5 mr-2" />
                      )}
                      Save Changes
                    </Button>
                  </CardFooter>
                </>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}