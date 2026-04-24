import { CheckCircle2, Zap, Building2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  const plans = [
    {
      tier: "FREE",
      name: "Free Tier",
      price: 0,
      interval: "forever",
      description: "Essential tools to get your construction team started.",
      features: ["Up to 5 Team Members", "1 Active Project", "Basic Safety Reports"],
    },
    {
      tier: "PRO",
      name: "Pro Tier",
      price: 49,
      interval: "per month",
      description: "Perfect for growing construction teams and multiple sites.",
      features: ["Up to 50 Team Members", "10 Active Projects", "Advanced Reporting", "Material Tracking"],
      highlight: true
    },
    {
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
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">Simple, transparent pricing</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that best fits your construction team. No hidden fees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div key={plan.tier} className={`flex flex-col p-8 rounded-3xl border ${plan.highlight ? 'border-blue-600 shadow-xl ring-1 ring-blue-600 relative' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm'}`}>
            {plan.highlight && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-blue-600 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">Most Popular</span>
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-xl font-bold flex items-center mb-2">
                {plan.tier === "ENTERPRISE" ? <Building2 className="w-5 h-5 mr-2 text-indigo-500" /> : <Zap className="w-5 h-5 mr-2 text-blue-500" />}
                {plan.name}
              </h3>
              <p className="text-muted-foreground text-sm h-10">{plan.description}</p>
            </div>
            <div className="mb-6">
              <span className="text-5xl font-extrabold">${plan.price}</span>
              <span className="text-muted-foreground">/{plan.interval}</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start text-sm">
                  <CheckCircle2 className="h-5 w-5 mr-3 text-blue-600 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/register">
              <Button className={`w-full h-12 rounded-xl text-md ${plan.highlight ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700'}`}>
                Get Started
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}