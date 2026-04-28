/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MemberService } from "@/services/member.services";
import { BillingService } from "@/services/billing.services";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Zap, Building2, CalendarClock, ReceiptText, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

const PLAN_WEIGHTS: Record<string, number> = { FREE: 0, PRO: 1, ENTERPRISE: 2 };

// Premium gradient dictionaries mapping to KrewOS theme
const PLAN_GRADIENTS: Record<string, string> = {
  FREE: "bg-slate-50 dark:bg-zinc-900/50",
  PRO: "bg-blue-50/50 dark:bg-blue-900/10",
  ENTERPRISE: "bg-indigo-50/50 dark:bg-indigo-900/10",
};
const PLAN_ACCENT: Record<string, string> = {
  FREE: "text-zinc-600 dark:text-zinc-400",
  PRO: "text-blue-600 dark:text-blue-400",
  ENTERPRISE: "text-indigo-600 dark:text-indigo-400",
};
const PLAN_BORDER: Record<string, string> = {
  FREE: "border-slate-200 dark:border-zinc-800",
  PRO: "border-blue-200 dark:border-blue-900/50",
  ENTERPRISE: "border-indigo-200 dark:border-indigo-900/50",
};

export default function BillingSettingsPage() {
  const queryClient = useQueryClient();

  const { data: companyResponse, isLoading: isCompanyLoading } = useQuery({ 
    queryKey: ["company-settings"], 
    queryFn: MemberService.getCompanySettings 
  });
  
  const { data: plansResponse, isLoading: isPlansLoading } = useQuery({ 
    queryKey: ["billing-plans"], 
    queryFn: BillingService.getPlans 
  });

  const checkoutMutation = useMutation({
    mutationFn: BillingService.createCheckoutSession,
    onSuccess: (res) => {
      if (res?.data?.url) window.location.href = res.data.url;
      else toast.error("Failed to generate checkout link.");
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Something went wrong."),
  });

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
  
  // Sort plans by price
  const activePlans = (plansResponse?.data || []).sort((a: any, b: any) => Number(a.price) - Number(b.price));

  const handleUpgrade = (planTier: string) => {
    checkoutMutation.mutate(planTier);
  };

  if (isCompanyLoading || isPlansLoading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-5xl mx-auto space-y-10 pb-12 pt-4">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50 dark:border-blue-800/60 dark:bg-blue-900/30 px-4 py-1.5 text-sm font-bold tracking-wide text-blue-700 dark:text-blue-400 shadow-sm uppercase">
            <ShieldCheck className="w-4 h-4 mr-2" /> Billing & Plans
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Manage Subscription
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg font-medium max-w-md">
            Upgrade your workspace, review limits, and control your billing cycle.
          </p>
        </div>

        <Link href="/admin/settings/billing/history" className="shrink-0">
          <Button className="w-full sm:w-auto h-12 px-6 rounded-xl font-bold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-zinc-900 dark:text-white shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-95 transition-all group">
            <ReceiptText className="w-4 h-4 mr-2 text-zinc-400 group-hover:text-blue-600 transition-colors" />
            Payment History
            <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </Link>
      </div>

      {/* ── Current Plan Banner ── */}
      <div className={`rounded-[2.5rem] ${PLAN_GRADIENTS[currentPlan]} border ${PLAN_BORDER[currentPlan]} p-8 shadow-sm transition-all duration-300`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <p className="text-xs font-extrabold uppercase tracking-widest text-zinc-500">Active Workspace Plan</p>
            <div className="flex items-center gap-4 flex-wrap">
              <h2 className={`text-3xl md:text-4xl font-extrabold uppercase tracking-tight ${PLAN_ACCENT[currentPlan]}`}>
                {currentPlan}
              </h2>
              {currentPlan !== "FREE" && !company?.subscription?.cancelAtPeriodEnd && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-3 py-1.5 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active
                </span>
              )}
              {company?.subscription?.cancelAtPeriodEnd && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold px-3 py-1.5 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> Cancels Soon
                </span>
              )}
            </div>

            {currentPlan !== "FREE" && company?.subscription?.currentPeriodEnd && (
              <p className="text-base text-zinc-600 dark:text-zinc-400 font-medium flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-zinc-400" />
                {company.subscription.cancelAtPeriodEnd ? "Access ends on" : "Next billing on"}{" "}
                <strong className="text-zinc-900 dark:text-white">
                  {new Date(company.subscription.currentPeriodEnd).toLocaleDateString()}
                </strong>
              </p>
            )}

            {currentPlan === "FREE" && (
              <p className="text-base text-zinc-600 dark:text-zinc-400 font-medium flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" /> Upgrade below to unlock higher limits and premium features.
              </p>
            )}
          </div>

          <div className="flex-shrink-0">
            {currentPlan !== "FREE" && !company?.subscription?.cancelAtPeriodEnd && (
              <Button
                variant="outline"
                disabled={cancelMutation.isPending}
                className="h-12 px-6 rounded-xl font-bold border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all active:scale-95"
                onClick={() => {
                  toast("Cancel subscription?", {
                    description: "You will keep access until the end of the billing cycle.",
                    action: { label: "Yes, Cancel", onClick: () => cancelMutation.mutate() },
                    cancel: { label: "Keep Plan", onClick: () => {} },
                  });
                }}
              >
                {cancelMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Cancel Subscription
              </Button>
            )}
            {company?.subscription?.cancelAtPeriodEnd && (
              <p className="text-sm font-bold text-red-500 dark:text-red-400">
                Cancellation scheduled.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Section Label ── */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-zinc-800 to-transparent" />
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          Available Plans
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-zinc-800 to-transparent" />
      </div>

      {/* ── Pricing Cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {activePlans.map((plan: any) => {
          const isCurrentPlan = currentPlan === plan.tier;
          
          // Only show plans that are equal to or higher than the current plan's weight
          if (PLAN_WEIGHTS[plan.tier] < currentPlanWeight) return null;
          
          const isPro = plan.tier === "PRO";

          return (
            <Card key={plan.id} className={cn("flex flex-col overflow-hidden rounded-[2.5rem] border shadow-sm transition-all duration-300 hover:shadow-xl", 
              isCurrentPlan ? "border-blue-400 dark:border-blue-600 ring-2 ring-blue-500/20" : "border-slate-200 dark:border-zinc-800"
            )}>
              
              <CardHeader className="p-8 pb-4 relative">
                {isCurrentPlan && (
                  <div className="absolute top-6 right-6">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold px-3 py-1 uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3" /> Current
                    </span>
                  </div>
                )}
                
                <div className="mb-4">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", 
                    isPro ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" : "bg-slate-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  )}>
                    {isPro ? <Zap className="h-7 w-7" /> : <Building2 className="h-7 w-7" />}
                  </div>
                </div>
                <CardTitle className="text-2xl font-extrabold uppercase tracking-tight text-zinc-900 dark:text-white">{plan.name}</CardTitle>
                <CardDescription className="text-base font-medium mt-2">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-8 p-8 pt-2">
                <div className="flex items-baseline gap-1 pb-6 border-b border-slate-100 dark:border-zinc-800">
                  <span className="text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">${plan.price}</span>
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium text-lg">/{plan.interval.replace("per ", "")}</span>
                </div>
                <ul className="space-y-4">
                  {plan.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-base font-medium text-zinc-700 dark:text-zinc-300">
                      <CheckCircle2 className="h-5 w-5 mt-0.5 text-blue-500 shrink-0" strokeWidth={2.5} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="p-8 pt-0">
                {plan.tier !== "FREE" && (
                  <Button
                    disabled={isCurrentPlan || checkoutMutation.isPending}
                    onClick={() => handleUpgrade(plan.tier)}
                    className={cn("w-full h-14 rounded-2xl text-base font-bold transition-all active:scale-95", 
                      isCurrentPlan 
                        ? "bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700" 
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] active:shadow-none hover:-translate-y-0.5"
                    )}
                  >
                    {checkoutMutation.isPending && checkoutMutation.variables === plan.tier ? <Loader2 className="h-5 w-5 animate-spin" /> : isCurrentPlan ? "Manage in Stripe" : "Upgrade Plan"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
}