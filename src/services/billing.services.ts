/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpClient } from "@/lib/axios/httpClient";

export const BillingService = {
  getPlans: async () => {
    return await httpClient.get("/billing/plans");
  },
  
  createCheckoutSession: async (plan: string) => {
    return await httpClient.post("/billing/create-checkout-session", { plan });
  },

  updatePlan: async ({ planId, data }: { planId: string; data: any }) => {
    return await httpClient.patch(`/billing/plans/${planId}`, data);
  }
  ,
  seedPlans: async () => {
    return await httpClient.post("/billing/seed",{});
  },
  cancelSubscription: async () => {
    return await httpClient.post("/billing/cancel",{});
  }
  ,
  getPlatformHistory: async (params: any) => {
    return await httpClient.get("/billing/platform-history", { params });
  }
};