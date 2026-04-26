"use client";

import { CheckCircle2, Zap, Building2, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

// 👉 Adjust this import path to match where your billing.services.ts is located
import { BillingService } from "@/services/billing.services"; 

// Optional: Define a type for your plan based on your Prisma schema
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
        // 1. Fetch from your public API route
        const response = await BillingService.getPlans();
        
        // 2. Extract data (Assuming your standard { success: true, data: [...] } format)
        let fetchedPlans = response.data?.data || response.data || [];

        // 3. Sort plans by price (Free -> Pro -> Enterprise)
        fetchedPlans = fetchedPlans.sort((a: Plan, b: Plan) => Number(a.price) - Number(b.price));

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
      name: "Free Tier",
      price: 0,
      interval: "forever",
      description: "Essential tools to get your construction team started.",
      features: ["Up to 5 Team Members", "1 Active Project", "Basic Safety Reports"],
    },
    {
      id: "fallback-2",
      tier: "PRO",
      name: "Pro Tier",
      price: 49,
      interval: "per month",
      description: "Perfect for growing construction teams and multiple sites.",
      features: ["Up to 50 Team Members", "10 Active Projects", "Advanced Reporting", "Material Tracking"],
      highlight: true
    },
    {
      id: "fallback-3",
      tier: "ENTERPRISE",
      name: "Enterprise",
      price: 199,
      interval: "per month",
      description: "For large-scale operations requiring maximum limits.",
      features: ["Unlimited Team Members", "Unlimited Projects", "Custom API Access", "Dedicated Support Manager"],
    }
  ];

  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan for your construction team. No hidden fees.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
          <p className="text-muted-foreground font-medium">Loading live pricing...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayPlans.map((plan) => (
            <div
              key={plan.id || plan.tier}
              className={`relative flex flex-col p-8 rounded-3xl border ${
                plan.highlight
                  ? "border-blue-600 shadow-xl shadow-blue-600/10 scale-105 z-10 bg-white dark:bg-zinc-900"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="bg-blue-600 text-white text-xs font-bold tracking-wider py-1 px-3 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold flex items-center mb-2">
                  {plan.tier === "ENTERPRISE" ? (
                    <Building2 className="w-5 h-5 mr-2 text-indigo-500" />
                  ) : (
                    <Zap className="w-5 h-5 mr-2 text-blue-500" />
                  )}
                  {plan.name}
                </h3>
                <p className="text-muted-foreground text-sm h-10">{plan.description}</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-extrabold">${plan.price}</span>
                <span className="text-muted-foreground">/{plan.interval}</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {/* Ensure features is always treated as an array even if the DB returns a JSON string */}
                {(Array.isArray(plan.features) ? plan.features : []).map((feature: string, i: number) => (
                  <li key={i} className="flex items-start text-sm">
                    <CheckCircle2 className="h-5 w-5 mr-3 text-blue-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register">
                <Button
                  className={`w-full h-12 rounded-xl text-md ${
                    plan.highlight
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100"
                  }`}
                >
                  Get Started
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}