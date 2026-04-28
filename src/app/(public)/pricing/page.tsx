"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Zap, Building2, Loader2, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BillingService } from "@/services/billing.services"; // Adjust path if needed
import { cn } from "@/lib/utils";

// Define the Plan type based on your Prisma schema
interface Plan {
  id: string;
  tier: string;
  name: string;
  price: number;
  interval: string;
  description: string;
  features: string[];
  highlight?: boolean;
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await BillingService.getPlans();
        let fetchedPlans = response.data?.data || response.data || [];
        
        // 1. Sort plans by price
        fetchedPlans = fetchedPlans.sort((a: Plan, b: Plan) => Number(a.price) - Number(b.price));
        
        // 2. Dynamically add the "highlight" flag to the PRO tier so the badge shows up!
        fetchedPlans = fetchedPlans.map((plan: Plan) => ({
          ...plan,
          highlight: plan.tier === "PRO" || plan.name === "PRO TIER"
        }));

        setPlans(fetchedPlans);
      } catch (error) {
        console.error("Failed to fetch plans from the database:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Fallback to default plans if the database is empty or the API is unreachable
  const displayPlans = plans.length > 0 ? plans : [
    {
      id: "fallback-1",
      tier: "FREE",
      name: "FREE TIER",
      price: 0,
      interval: "forever",
      description: "Essential tools to get your construction team started.",
      features: ["Up to 5 Team Members", "1 Active Project", "Basic Safety Reports"],
      highlight: false
    },
    {
      id: "fallback-2",
      tier: "PRO",
      name: "PRO TIER",
      price: 49,
      interval: "per month",
      description: "Perfect for growing construction teams and multiple sites.",
      features: ["Up to 50 Team Members", "10 Active Projects", "Advanced Reporting", "Material Tracking"],
      highlight: true
    },
    {
      id: "fallback-3",
      tier: "ENTERPRISE",
      name: "ENTERPRISE",
      price: 159,
      interval: "per month",
      description: "For large-scale operations requiring maximum limits.",
      features: ["Unlimited Team Members", "Unlimited Projects", "Custom API Access", "Dedicated Support Manager"],
      highlight: false
    }
  ];

  return (
    // 👉 THE FIX: Used pt-32 and pb-40 to safely clear the fixed Navbar and Footer on mobile
    <div className="relative flex w-full flex-col gap-12 overflow-hidden px-4 pt-32 pb-40 sm:px-8 max-w-7xl mx-auto z-10">
      
      {/* ─── Ambient Background Glow ─── */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[5%] left-[50%] h-[40%] w-[60%] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-500/15" />
        <div className="absolute bottom-[10%] right-[10%] h-[40%] w-[40%] rounded-full bg-indigo-500/10 blur-[100px] dark:bg-indigo-500/15" />
      </div>

      {/* ─── Header Section ─── */}
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex flex-col items-center space-y-6">
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50 dark:border-blue-800/60 dark:bg-blue-900/30 px-5 py-2.5 text-sm font-bold tracking-widest text-blue-700 dark:text-blue-400 shadow-sm backdrop-blur-md uppercase"
          >
            <Sparkles className="mr-2.5 h-4 w-4 animate-pulse" />
            Pricing Plans
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-2 text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-6xl lg:text-7xl leading-[1.1]"
          >
            Simple,{" "}
            <span className="italic font-semibold text-blue-600 dark:text-blue-400">
             transparent pricing.
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-zinc-600 dark:text-zinc-400 max-w-xl text-lg sm:text-xl font-medium leading-relaxed"
          >
            Choose the perfect plan for your construction team. No hidden fees, no surprises. Scales with your business.
          </motion.p>
        </div>
      </div>

      {/* ─── Pricing Grid ─── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 w-full">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-6" />
          <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium tracking-wide animate-pulse">Loading live pricing...</p>
        </div>
      ) : (
        <div className="mt-8 grid w-full grid-cols-1 gap-8 lg:gap-10 lg:grid-cols-3 items-stretch">
          {displayPlans.map((plan, index) => {
            const PlanIcon = plan.tier === "ENTERPRISE" ? Building2 : plan.tier === "PRO" ? Zap : Star;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.15, ease: "easeOut" }}
                className="flex h-full"
              >
                <div
                  className={cn(
                    "relative flex flex-col w-full text-left rounded-[2.5rem] p-8 lg:p-10 transition-all duration-300 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border h-full",
                    plan.highlight
                      ? "border-blue-500 shadow-[0_0_40px_rgba(37,99,235,0.15)] ring-2 ring-blue-500 md:-translate-y-4"
                      : "border-slate-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/30 dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-slate-300 dark:hover:border-zinc-700"
                  )}
                >
                  {/* Glowing "Most Popular" Badge */}
                  {plan.highlight && (
                    <div className="absolute -top-4 left-0 right-0 mx-auto w-fit z-20">
                      <div className="flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-extrabold tracking-widest py-1.5 px-4 rounded-full shadow-[0_4px_14px_rgba(37,99,235,0.4)] border border-white/10 uppercase">
                        <Sparkles className="mr-1.5 h-3.5 w-3.5 fill-white/20" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  {/* Card Header */}
                  <div className={cn("mb-6 flex flex-col gap-4", plan.highlight && "mt-2")}>
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm border",
                          plan.highlight
                            ? "bg-blue-100 border-blue-200 dark:border-blue-800/50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                            : "bg-slate-50 border-slate-200 dark:border-zinc-700 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                        )}
                      >
                        <PlanIcon className="h-6 w-6" />
                      </div>
                      <h3 className={cn("text-2xl font-extrabold tracking-tight", plan.highlight ? "text-blue-600 dark:text-blue-400" : "text-zinc-900 dark:text-white")}>
                        {plan.name}
                      </h3>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 h-10 leading-relaxed font-medium">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-10 flex items-baseline gap-1">
                    <span className={cn("text-6xl font-extrabold tracking-tight", plan.highlight ? "text-zinc-900 dark:text-white" : "text-zinc-900 dark:text-white")}>
                      ${plan.price}
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-400 font-medium text-lg">
                      /{plan.interval.replace("per ", "")}
                    </span>
                  </div>

                  {/* Features List */}
                  <div className="flex-1 space-y-4 mb-10">
                    {(Array.isArray(plan.features) ? plan.features : []).map((feature: string, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                        className="flex items-start gap-3.5 text-base font-medium"
                      >
                        <div
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full mt-0.5",
                            plan.highlight
                              ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                          )}
                        >
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </div>
                        <span className="text-zinc-700 dark:text-zinc-300 leading-snug">
                          {feature}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Call to Action Button */}
                  <Link href="/register" className="mt-auto relative z-10 w-full">
                    <Button
                      className={cn(
                        "w-full h-14 rounded-xl text-lg font-bold transition-all duration-300 active:scale-95",
                        plan.highlight
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
                          : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100 hover:-translate-y-0.5"
                      )}
                    >
                      {plan.price === 0 ? "Get Started for Free" : "Choose " + plan.tier}
                    </Button>
                  </Link>

                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}