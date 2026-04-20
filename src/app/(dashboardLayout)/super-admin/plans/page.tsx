/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-children-prop */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BillingService } from "@/services/billing.services";
import { useForm } from "@tanstack/react-form";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Settings2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export default function SuperAdminPlansPage() {
  const queryClient = useQueryClient();
  const [editingPlan, setEditingPlan] = useState<any | null>(null);

  // 1. Fetch all plans from the DB
  const { data: response, isLoading } = useQuery({
    queryKey: ["super-admin-plans"],
    queryFn: BillingService.getPlans,
  });

  // 2. Mutation to update a plan
  const updateMutation = useMutation({
    mutationFn: BillingService.updatePlan,
    onSuccess: () => {
      toast.success("Plan updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["super-admin-plans"] });
      queryClient.invalidateQueries({ queryKey: ["billing-plans"] }); 
      setEditingPlan(null);
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
    },
  });

  // 👉 3. Mutation to Seed Plans
  const seedMutation = useMutation({
    mutationFn: BillingService.seedPlans,
    onSuccess: () => {
      toast.success("Database seeded with default plans!");
      queryClient.invalidateQueries({ queryKey: ["super-admin-plans"] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to seed plans.")
  });

  const plans = response?.data || [];

  if (isLoading)
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  // 👉 4. Empty State UI (If no plans exist in the DB)
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
          {seedMutation.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
          Initialize Database Plans
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            SaaS Pricing Control
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage platform pricing, limits, and features globally.
          </p>
        </div>
        <div className="flex items-center text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
          <ShieldAlert className="w-4 h-4 mr-2" /> Super Admin Access
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan: any) => (
          <Card key={plan.id} className="border-zinc-200 dark:border-zinc-800">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingPlan(plan)}
                >
                  <Settings2 className="w-4 h-4 mr-2" /> Edit Plan
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Price</p>
                <p className="text-2xl font-bold">${plan.price}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 mt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Max Members</p>
                  <p className="font-medium">
                    {plan.maxMembers === 999999 ? "Unlimited" : plan.maxMembers}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Max Projects</p>
                  <p className="font-medium">
                    {plan.maxProjects === 999999
                      ? "Unlimited"
                      : plan.maxProjects}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      <Dialog
        open={!!editingPlan}
        onOpenChange={(open) => !open && setEditingPlan(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editingPlan?.name}</DialogTitle>
          </DialogHeader>

          {editingPlan && (
            <EditPlanForm
              plan={editingPlan}
              onSubmit={(values: any) =>
                updateMutation.mutate({ planId: editingPlan.id, data: values })
              }
              isPending={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ----------------------------------------------------
// TanStack Form Component for Editing
// ----------------------------------------------------
function EditPlanForm({
  plan,
  onSubmit,
  isPending,
}: {
  plan: any;
  onSubmit: any;
  isPending: boolean;
}) {
  const form = useForm({
    defaultValues: {
      price: plan.price,
      maxMembers: plan.maxMembers,
      maxProjects: plan.maxProjects,
    },
    onSubmit: async ({ value }) => {
      // Convert string inputs back to numbers before sending to DB
      onSubmit({
        price: Number(value.price),
        maxMembers: Number(value.maxMembers),
        maxProjects: Number(value.maxProjects),
      });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4 mt-2"
    >
      <form.Field
        name="price"
        children={(field) => (
          <div className="space-y-2">
            <Label>Monthly Price ($)</Label>
            <Input
              type="number"
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(Number(e.target.value))}
            />
          </div>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <form.Field
          name="maxMembers"
          children={(field) => (
            <div className="space-y-2">
              <Label>Max Members</Label>
              <Input
                type="number"
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Use 999999 for Unlimited
              </p>
            </div>
          )}
        />
        <form.Field
          name="maxProjects"
          children={(field) => (
            <div className="space-y-2">
              <Label>Max Projects</Label>
              <Input
                type="number"
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Use 999999 for Unlimited
              </p>
            </div>
          )}
        />
      </div>

      <div className="pt-4 flex justify-end">
        <form.Subscribe
          selector={(state) => [state.canSubmit]}
          children={([canSubmit]) => (
            <Button type="submit" disabled={!canSubmit || isPending}>
              {isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Save Changes
            </Button>
          )}
        />
      </div>
    </form>
  );
}