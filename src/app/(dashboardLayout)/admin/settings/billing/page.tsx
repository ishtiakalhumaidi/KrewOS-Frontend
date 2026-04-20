/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { MemberService } from "@/services/member.services";
import { BillingService } from "@/services/billing.services";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, Zap, Building2 } from "lucide-react";
import { toast } from "sonner";

export default function BillingSettingsPage() {
  // 1. Fetch current company settings to see active plan
  const { data: companyResponse, isLoading: isCompanyLoading } = useQuery({
    queryKey: ["company-settings"],
    queryFn: MemberService.getCompanySettings,
  });

  // 2. 👉 Fetch Dynamic Plans from Backend Database
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
    }
  });

  const company = companyResponse?.data;
  const currentPlan = company?.subscription?.plan || "FREE";
  
  // Extract plans array from backend response
  const activePlans = plansResponse?.data || [];

  const handleUpgrade = (planTier: string) => {
    checkoutMutation.mutate(planTier);
  };

  if (isCompanyLoading || isPlansLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Plans & Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and upgrade your workspace limits.</p>
      </div>

      {/* Current Plan Banner */}
      <Card className="bg-zinc-50 dark:bg-zinc-900/50 border-dashed">
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Current Plan</p>
            <div className="flex items-center">
              <span className="text-2xl font-bold uppercase mr-3">{currentPlan} TIER</span>
              {currentPlan !== "FREE" && <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>}
            </div>
          </div>
          {currentPlan === "FREE" && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">You are currently on the free tier.</p>
              <p className="text-sm font-medium text-blue-600">Upgrade below to unlock limits.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dynamic Pricing Cards mapped from Backend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {activePlans.map((plan: any) => {
          const isCurrentPlan = currentPlan === plan.tier; // Compare with tier enum (e.g. "PRO")
          
          // Optional: Hide the free tier if they are already on a paid plan
          if (plan.tier === "FREE" && currentPlan !== "FREE") return null;

          return (
            <Card key={plan.id} className={`relative flex flex-col ${isCurrentPlan ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : ''}`}>
              {isCurrentPlan && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Badge className="bg-blue-600 text-white hover:bg-blue-600">Current Plan</Badge>
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  {/* Dynamic Icons based on Tier */}
                  {plan.tier === "ENTERPRISE" ? (
                    <Building2 className="h-6 w-6 text-indigo-500" />
                  ) : (
                    <Zap className="h-6 w-6 text-blue-500" />
                  )}
                </div>
                <CardTitle className="text-xl uppercase tracking-wide">{plan.name}</CardTitle>
                <CardDescription className="h-10">{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-extrabold">${plan.price}</span>
                  <span className="text-muted-foreground"> /{plan.interval}</span>
                </div>
                
                <ul className="space-y-3">
                  {plan.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start text-sm text-zinc-700 dark:text-zinc-300">
                      <CheckCircle2 className="h-4 w-4 mr-3 mt-0.5 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                {plan.tier !== "FREE" && (
                  <Button 
                    className={`w-full ${isCurrentPlan ? 'bg-zinc-200 text-zinc-800 hover:bg-zinc-300' : 'bg-blue-600 hover:bg-blue-700'}`}
                    disabled={isCurrentPlan || checkoutMutation.isPending}
                    onClick={() => handleUpgrade(plan.tier)}
                  >
                    {checkoutMutation.isPending && checkoutMutation.variables === plan.tier ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    {isCurrentPlan ? "Manage Billing" : `Upgrade to ${plan.tier}`}
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