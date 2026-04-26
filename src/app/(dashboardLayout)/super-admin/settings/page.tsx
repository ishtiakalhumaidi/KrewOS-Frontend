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
import { Loader2, Settings2, Save, X, Building2, Zap, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

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
        errors.forEach((err: any) => {
          toast.error(err.message);
        });
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
    errors.forEach((err: any) => {
      toast.error(err.message);
    });
  } else {
    toast.error(error?.response?.data?.message || "Failed to seed plans.");
  }
}
  });

  if (isLoading)
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  const plans = response?.data || [];

  // 🌟 EMPTY STATE: If no plans exist, show the Seed button
  if (plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <ShieldAlert className="w-16 h-16 text-amber-500 mb-2" />
        <h2 className="text-2xl font-bold">No Pricing Plans Found</h2>
        <p className="text-muted-foreground max-w-md">
          Your database is currently empty. You must initialize the core Subscription Plans (FREE, PRO, ENTERPRISE) before companies can register or upgrade.
        </p>
        <Button
          size="lg"
          onClick={() => seedMutation.mutate()}
          disabled={seedMutation.isPending}
          className="bg-amber-600 hover:bg-amber-700 text-white mt-4"
        >
          {seedMutation.isPending ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : null}
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
      maxProjects: plan.maxProjects,
      maxMembers: plan.maxMembers,
      maxStorage: plan.maxStorage,
    });
  };

  const handleSave = (planId: string) => {
    updateMutation.mutate({
      planId,
      data: {
        ...editForm,
        price: Number(editForm.price),
        maxProjects: Number(editForm.maxProjects),
        maxMembers: Number(editForm.maxMembers),
        maxStorage: Number(editForm.maxStorage),
      },
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Global Platform Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure pricing tiers, system limits, and features for your SaaS.
        </p>
      </div>

      <div className="flex items-center text-sm font-medium text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200 w-fit">
        <Settings2 className="w-4 h-4 mr-2" /> Changes made here will instantly
        reflect on the customer checkout pages.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {plans.map((plan: any) => {
          const isEditing = editingPlanId === plan.id;

          return (
            <Card
              key={plan.id}
              className={`flex flex-col relative transition-all ${
                plan.tier === "ENTERPRISE" ? "border-indigo-200 shadow-sm" : ""
              } ${isEditing ? "ring-2 ring-primary/20" : ""}`}
            >
              {/* DISPLAY MODE */}
              {!isEditing ? (
                <>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge
                        variant="outline"
                        className="uppercase bg-zinc-100 dark:bg-zinc-800"
                      >
                        {plan.tier}
                      </Badge>
                      {plan.tier === "ENTERPRISE" ? (
                        <Building2 className="w-5 h-5 text-indigo-500" />
                      ) : (
                        <Zap className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="h-10">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <div>
                      <span className="text-4xl font-extrabold">
                        ${plan.price}
                      </span>
                      <span className="text-muted-foreground">
                        {" "}
                        /{plan.interval}
                      </span>
                    </div>

                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg space-y-3 text-sm border border-zinc-100 dark:border-zinc-800">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Max Projects:
                        </span>
                        <span className="font-medium">
                          {plan.maxProjects === 999999
                            ? "Unlimited"
                            : plan.maxProjects}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Max Members:
                        </span>
                        <span className="font-medium">
                          {plan.maxMembers === 999999
                            ? "Unlimited"
                            : plan.maxMembers}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Storage (MB):
                        </span>
                        <span className="font-medium">
                          {plan.maxStorage === 999999
                            ? "Unlimited"
                            : plan.maxStorage}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleEditClick(plan)}
                    >
                      <Settings2 className="w-4 h-4 mr-2" />
                      Edit Configuration
                    </Button>
                  </CardFooter>
                </>
              ) : (
                /* EDITING MODE */
                <>
                  <CardHeader className="bg-zinc-50 dark:bg-zinc-900/80 border-b">
                    <CardTitle className="text-lg flex items-center">
                      <Settings2 className="w-5 h-5 mr-2 text-primary" />
                      Editing {plan.tier}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6 flex-1">
                    <div className="space-y-1">
                      <Label>Display Name</Label>
                      <Input
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                      />
                    </div>

                    {plan.tier !== "FREE" && (
                      <div className="space-y-1">
                        <Label>Monthly Price ($)</Label>
                        <Input
                          type="number"
                          value={editForm.price}
                          onChange={(e) =>
                            setEditForm({ ...editForm, price: e.target.value })
                          }
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <Label>Description</Label>
                      <Textarea
                        value={editForm.description}
                        className="resize-none h-20"
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>Max Projects</Label>
                        <Input
                          type="number"
                          value={editForm.maxProjects}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              maxProjects: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Max Members</Label>
                        <Input
                          type="number"
                          value={editForm.maxMembers}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              maxMembers: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      * Use 999999 for Unlimited.
                    </p>
                  </CardContent>

                  <CardFooter className="flex gap-2 bg-zinc-50 dark:bg-zinc-900/50 pt-4 rounded-b-xl border-t">
                    <Button
                      variant="outline"
                      className="flex-1 bg-white dark:bg-zinc-950"
                      onClick={() => setEditingPlanId(null)}
                      disabled={updateMutation.isPending}
                    >
                      <X className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => handleSave(plan.id)}
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save
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