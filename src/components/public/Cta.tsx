"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, CheckCircle2 } from "lucide-react";

export function Cta({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section className="py-24 bg-blue-600 text-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <Building2 className="w-16 h-16 mx-auto mb-6 text-blue-200" />
        <h2 className="text-3xl font-bold sm:text-4xl mb-6">Ready to upgrade your workflow?</h2>
        <p className="text-blue-100 text-lg mb-10">
          Join modern construction companies using KrewOS to build faster, safer, and smarter.
        </p>
        
        {isLoggedIn ? (
          <Link href="/dashboard">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-zinc-100 rounded-full h-14 px-10 text-lg font-bold">
              <span>Return to Dashboard</span>
            </Button>
          </Link>
        ) : (
          <>
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-zinc-100 rounded-full h-14 px-10 text-lg font-bold">
                <span>Create your Workspace</span>
              </Button>
            </Link>
            <div className="mt-8 flex justify-center gap-6 text-sm text-blue-200">
              <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2" /> No credit card required</span>
              <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2" /> 14-day free trial</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}