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
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const PLAN_WEIGHTS: Record<string, number> = {
  FREE: 0,
  PRO: 1,
  ENTERPRISE: 2,
};

const PLAN_GRADIENTS: Record<string, string> = {
  FREE: "from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50",
  PRO: "from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40",
  ENTERPRISE: "from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/40",
};

const PLAN_ACCENT: Record<string, string> = {
  FREE: "text-slate-600 dark:text-slate-400",
  PRO: "text-indigo-600 dark:text-indigo-400",
  ENTERPRISE: "text-violet-600 dark:text-violet-400",
};

const PLAN_BORDER: Record<string, string> = {
  FREE: "border-slate-200 dark:border-slate-700",
  PRO: "border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-300 dark:ring-indigo-700",
  ENTERPRISE: "border-violet-300 dark:border-violet-700",
};

export default function BillingSettingsPage() {
  const { data: companyResponse, isLoading: isCompanyLoading } = useQuery({
    queryKey: ["company-settings"],
    queryFn: MemberService.getCompanySettings,
  });

  const { data: plansResponse, isLoading: isPlansLoading } = useQuery({
    queryKey: ["billing-plans"],
    queryFn: BillingService.getPlans,
  });

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
      toast.success("Subscription will cancel at the end of your billing cycle.");
      queryClient.invalidateQueries({ queryKey: ["company-settings"] });
    },
    onError: () => toast.error("Failed to cancel subscription."),
  });

  const company = companyResponse?.data;
  const currentPlan = company?.subscription?.plan || "FREE";
  const currentPlanWeight = PLAN_WEIGHTS[currentPlan] || 0;
  const activePlans = plansResponse?.data || [];

  const handleUpgrade = (planTier: string) => {
    checkoutMutation.mutate(planTier);
  };

  if (isCompanyLoading || isPlansLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading your plan details…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-12">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-indigo-500" />
            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
              Billing & Plans
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Manage your subscription
          </h1>
          <p className="text-muted-foreground text-sm max-w-md">
            Upgrade your workspace, review limits, and control your billing cycle all in one place.
          </p>
        </div>

        <Link href="/admin/settings/billing/history">
          <Button
            variant="outline"
            className="group border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <ReceiptText className="w-4 h-4 mr-2 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            Payment History
            <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
          </Button>
        </Link>
      </div>

      {/* ── Current Plan Banner ── */}
      <div className={`rounded-2xl bg-gradient-to-br ${PLAN_GRADIENTS[currentPlan]} border ${PLAN_BORDER[currentPlan]} p-6 shadow-sm transition-all duration-300`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Active Plan
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className={`text-2xl font-extrabold uppercase tracking-tight ${PLAN_ACCENT[currentPlan]}`}>
                {currentPlan}
              </h2>
              {currentPlan !== "FREE" && !company?.subscription?.cancelAtPeriodEnd && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              )}
              {company?.subscription?.cancelAtPeriodEnd && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-semibold px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Cancels Soon
                </span>
              )}
            </div>

            {currentPlan !== "FREE" && company?.subscription?.currentPeriodEnd && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <CalendarClock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                {company.subscription.cancelAtPeriodEnd
                  ? "Access ends on"
                  : "Next billing on"}{" "}
                <strong className="text-foreground font-semibold">
                  {new Date(company.subscription.currentPeriodEnd).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </strong>
              </p>
            )}

            {currentPlan === "FREE" && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                Upgrade below to unlock higher limits
              </p>
            )}
          </div>

          <div className="flex-shrink-0">
            {currentPlan !== "FREE" && !company?.subscription?.cancelAtPeriodEnd && (
              <Button
                variant="outline"
                size="sm"
                disabled={cancelMutation.isPending}
                className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:border-red-300 transition-all duration-200"
                onClick={() => {
                  toast("Cancel subscription?", {
                    description: "You will keep access until the end of the billing cycle.",
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
                {cancelMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                ) : null}
                Cancel Subscription
              </Button>
            )}
            {company?.subscription?.cancelAtPeriodEnd && (
              <p className="text-sm font-medium text-red-500 dark:text-red-400">
                Cancellation scheduled.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Section Label ── */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
          Available Plans
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
      </div>

      {/* ── Pricing Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {activePlans.map((plan: any) => {
          const isCurrentPlan = currentPlan === plan.tier;
          const planWeight = PLAN_WEIGHTS[plan.tier] || 0;

          if (planWeight < currentPlanWeight) return null;

          const isEnterprise = plan.tier === "ENTERPRISE";
          const isPro = plan.tier === "PRO";

          return (
            <Card
              key={plan.id}
              className={`
                relative flex flex-col overflow-hidden border transition-all duration-300
                hover:shadow-lg hover:-translate-y-0.5
                ${isCurrentPlan
                  ? "border-indigo-400 dark:border-indigo-600 shadow-md shadow-indigo-100 dark:shadow-indigo-950/50"
                  : isEnterprise
                  ? "border-violet-200 dark:border-violet-800 hover:border-violet-300 dark:hover:border-violet-700"
                  : "border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800"
                }
              `}
            >
              {/* Top accent bar */}
              <div
                className={`h-1 w-full ${
                  isCurrentPlan
                    ? "bg-gradient-to-r from-indigo-400 to-blue-500"
                    : isEnterprise
                    ? "bg-gradient-to-r from-violet-400 to-purple-500"
                    : isPro
                    ? "bg-gradient-to-r from-indigo-300 to-blue-400"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              />

              {/* Current Plan badge */}
              {isCurrentPlan && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-2.5 py-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Current
                  </span>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="mb-3">
                  {isEnterprise ? (
                    <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-lg font-bold uppercase tracking-wide text-foreground">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed min-h-[2.5rem]">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-6">
                {/* Price */}
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-foreground">
                    ${plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm mb-1.5">
                    /{plan.interval}
                  </span>
                </div>

                {/* Divider */}
                <div className="h-px bg-slate-100 dark:bg-slate-800" />

                {/* Features */}
                <ul className="space-y-2.5">
                  {plan.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-4">
                {plan.tier !== "FREE" && (
                  <Button
                    className={`
                      w-full font-semibold transition-all duration-200 group
                      ${isCurrentPlan
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                        : isEnterprise
                        ? "bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-200 dark:shadow-violet-950/50"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 dark:shadow-indigo-950/50"
                      }
                    `}
                    disabled={isCurrentPlan || checkoutMutation.isPending}
                    onClick={() => handleUpgrade(plan.tier)}
                  >
                    {checkoutMutation.isPending && checkoutMutation.variables === plan.tier ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    {isCurrentPlan ? (
                      "Manage in Stripe"
                    ) : (
                      <span className="flex items-center gap-2">
                        Upgrade to {plan.name}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    )}
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