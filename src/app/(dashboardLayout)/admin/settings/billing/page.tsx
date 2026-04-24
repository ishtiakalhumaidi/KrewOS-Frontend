/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MemberService } from "@/services/member.services";
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
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CheckCircle2,
  Zap,
  Building2,
  CalendarClock,
  ReceiptText,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// 👉 Plan hierarchy to easily compare and hide lower tiers
const PLAN_WEIGHTS: Record<string, number> = {
  FREE: 0,
  PRO: 1,
  ENTERPRISE: 2,
};

export default function BillingSettingsPage() {
  // 1. Fetch current company settings to see active plan
  const { data: companyResponse, isLoading: isCompanyLoading } = useQuery({
    queryKey: ["company-settings"],
    queryFn: MemberService.getCompanySettings,
  });

  // 2. Fetch Dynamic Plans from Backend Database
  const { data: plansResponse, isLoading: isPlansLoading } = useQuery({
    queryKey: ["billing-plans"],
    queryFn: BillingService.getPlans,
  });

  // 3. Mutation to create Stripe Checkout session
  const checkoutMutation = useMutation({
    mutationFn: BillingService.createCheckoutSession,
    onSuccess: (res) => {
      const checkoutUrl = res?.data?.url;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        toast.error("Failed to generate checkout link.");
      }
    },
    onError: (error: any) => {
      const errors = error?.response?.data?.errorSources;
      if (errors?.length) {
        errors.forEach((err: any) => toast.error(err.message));
      } else {
        toast.error(error?.response?.data?.message || "Something went wrong.");
      }
    },
  });

  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: BillingService.cancelSubscription,
    onSuccess: () => {
      toast.success(
        "Subscription will cancel at the end of your billing cycle.",
      );
      queryClient.invalidateQueries({ queryKey: ["company-settings"] });
    },
    onError: () => toast.error("Failed to cancel subscription."),
  });

  const company = companyResponse?.data;
  const currentPlan = company?.subscription?.plan || "FREE";
  const currentPlanWeight = PLAN_WEIGHTS[currentPlan] || 0;

  const activePlans = plansResponse?.data || [];
  console.log(activePlans);

  const handleUpgrade = (planTier: string) => {
    checkoutMutation.mutate(planTier);
  };

  if (isCompanyLoading || isPlansLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plans & Billing</h1>
          <p className="text-muted-foreground">
            Manage your subscription and upgrade your workspace limits.
          </p>
        </div>

        {/* 👉 1. Payment History Button added to the top right */}
        <Link href="/admin/settings/billing/history">
          <Button variant="outline" className="bg-white">
            <ReceiptText className="w-4 h-4 mr-2" />
            View Payment History
          </Button>
        </Link>
      </div>

      {/* Current Plan Banner */}
      <Card className="bg-zinc-50 dark:bg-zinc-900/50 border-dashed">
        <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Current Plan
            </p>
            <div className="flex items-center">
              <span className="text-2xl font-bold uppercase mr-3">
                {currentPlan} TIER
              </span>

             
              {currentPlan !== "FREE" &&
                !company?.subscription?.cancelAtPeriodEnd && (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    Active
                  </Badge>
                )}
              {company?.subscription?.cancelAtPeriodEnd && (
                <Badge
                  variant="destructive"
                  className="bg-red-100 text-red-700 hover:bg-red-100"
                >
                  Cancels Soon
                </Badge>
              )}
            </div>

            {currentPlan !== "FREE" &&
              company?.subscription?.currentPeriodEnd && (
                <p className="text-sm text-muted-foreground mt-2 flex items-center">
                  <CalendarClock className="w-4 h-4 mr-1.5 text-zinc-500" />
                  {company.subscription.cancelAtPeriodEnd
                    ? "You will lose premium access on "
                    : "Billing cycle ends on "}
                  <strong className="mx-1">
                    {new Date(
                      company.subscription.currentPeriodEnd,
                    ).toLocaleDateString()}
                  </strong>
                  .
                </p>
              )}
          </div>

          <div className="text-left md:text-right flex flex-col md:items-end space-y-2">
            {currentPlan === "FREE" ? (
              <>
                <p className="text-sm text-muted-foreground">
                  You are currently on the free tier.
                </p>
                <p className="text-sm font-medium text-blue-600">
                  Upgrade below to unlock limits.
                </p>
              </>
            ) : // 🌟 THE CANCEL BUTTON LOGIC
            !company?.subscription?.cancelAtPeriodEnd ? (
              <Button
                variant="destructive"
                size="sm"
                disabled={cancelMutation.isPending}
                onClick={() => {
                  toast("Cancel subscription?", {
                    description:
                      "You will keep access until the end of the billing cycle.",
                    action: {
                      label: "Yes, Cancel",
                      onClick: () => cancelMutation.mutate(),
                    },
                    cancel: {
                      label: "Keep Plan",
                      onClick: () => {},
                    },
                  });
                }}
              >
                {cancelMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Cancel Subscription
              </Button>
            ) : (
              <p className="text-sm font-medium text-red-600">
                Your cancellation is scheduled.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Pricing Cards mapped from Backend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {activePlans.map((plan: any) => {
          const isCurrentPlan = currentPlan === plan.tier;
          const planWeight = PLAN_WEIGHTS[plan.tier] || 0;

          // 👉 3. Hide ANY plan that is lower than the current plan!
          if (planWeight < currentPlanWeight) return null;

          return (
            <Card
              key={plan.id}
              className={`relative flex flex-col ${isCurrentPlan ? "border-blue-500 shadow-md ring-1 ring-blue-500" : ""}`}
            >
              {isCurrentPlan && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Badge className="bg-blue-600 text-white hover:bg-blue-600">
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  {plan.tier === "ENTERPRISE" ? (
                    <Building2 className="h-6 w-6 text-indigo-500" />
                  ) : (
                    <Zap className="h-6 w-6 text-blue-500" />
                  )}
                </div>
                <CardTitle className="text-xl uppercase tracking-wide">
                  {plan.name}
                </CardTitle>
                <CardDescription className="h-10">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-extrabold">${plan.price}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    /{plan.interval}
                  </span>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature: string, i: number) => (
                    <li
                      key={i}
                      className="flex items-start text-sm text-zinc-700 dark:text-zinc-300"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-3 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                {plan.tier !== "FREE" && (
                  <Button
                    className={`w-full ${isCurrentPlan ? "bg-zinc-200 text-zinc-800 hover:bg-zinc-300" : "bg-blue-600 hover:bg-blue-700"}`}
                    disabled={isCurrentPlan || checkoutMutation.isPending}
                    onClick={() => handleUpgrade(plan.tier)}
                  >
                    {checkoutMutation.isPending &&
                    checkoutMutation.variables === plan.tier ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    {isCurrentPlan
                      ? "Manage Billing in Stripe"
                      : `Upgrade to ${plan.tier}`}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
