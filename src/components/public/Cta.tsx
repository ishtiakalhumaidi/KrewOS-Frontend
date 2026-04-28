"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight, LayoutDashboard, HardHat } from "lucide-react";

export function Cta({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    // 👉 FIX 1: Proper outer margins and padding
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto z-10">
      
      {/* 👉 FIX 2: Main container is now fully dynamic. Solid borders and shadow. */}
      <div className="relative flex flex-col lg:flex-row overflow-hidden rounded-[2.5rem] border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-[0_0_40px_rgba(0,0,0,0.3)] transition-colors duration-300">
        
        {/* ─── LEFT SIDE: Value Proposition ─── */}
        {/* 👉 FIX 3: Spaced out padding (p-8 to p-16) and distinct background */}
        <div className="flex-1 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white dark:bg-zinc-900">
          
          <div className="mb-6 inline-flex w-max items-center rounded-full border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 text-xs font-bold tracking-wide text-blue-700 dark:text-blue-400 uppercase">
            <HardHat className="w-4 h-4 mr-2" />
            Take Action Now
          </div>
          
          <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white md:text-4xl lg:text-5xl">
            Ready to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Upgrade
            </span>{" "}
            Your Workflow?
          </h2>
          
          <p className="text-zinc-600 dark:text-zinc-400 mb-8 text-lg leading-relaxed">
            Join modern construction companies using KrewOS to replace fragmented apps and spreadsheets with one unified, intelligent platform.
          </p>

          <div className="space-y-5 mb-10">
            <div className="flex items-center">
              <div className="mr-4 rounded-full bg-blue-100 dark:bg-blue-900/30 p-1.5 text-blue-600 dark:text-blue-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="font-medium text-zinc-700 dark:text-zinc-300">14-day unrestricted free trial</p>
            </div>
            <div className="flex items-center">
              <div className="mr-4 rounded-full bg-blue-100 dark:bg-blue-900/30 p-1.5 text-blue-600 dark:text-blue-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="font-medium text-zinc-700 dark:text-zinc-300">No credit card required</p>
            </div>
            <div className="flex items-center">
              <div className="mr-4 rounded-full bg-blue-100 dark:bg-blue-900/30 p-1.5 text-blue-600 dark:text-blue-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="font-medium text-zinc-700 dark:text-zinc-300">Free onboarding session for your team</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div>
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center h-14 px-8 rounded-2xl text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
              >
                <LayoutDashboard className="w-5 h-5 mr-2.5" />
                Return to Dashboard
              </Link>
            ) : (
              <Link
                href="/register"
                className="inline-flex items-center justify-center h-14 px-8 rounded-2xl text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none group"
              >
                Create your Workspace
                <ArrowRight className="w-5 h-5 ml-2.5 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        </div>

        {/* ─── RIGHT SIDE: Pain Points & Testimonial ─── */}
        {/* 👉 FIX 4: Made this side strictly adapt to light/dark themes (bg-zinc-50 / bg-zinc-950) */}
        <div className="flex-1 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-zinc-50 dark:bg-zinc-950 border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-800 relative">
          
          <h3 className="mb-6 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-3xl leading-snug">
            Don&apos;t Let Another Day Pass With Fragmented Systems
          </h3>
          <p className="mb-8 text-zinc-600 dark:text-zinc-400 text-lg">
            Every day without a unified platform is costing your company:
          </p>

          <div className="space-y-6">
            <div className="flex items-center">
              <div className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-zinc-200 dark:border-zinc-800 bg-white pl dark:bg-zinc-900 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                1
              </div>
              <p className="text-lg text-zinc-700 dark:text-zinc-300 font-medium">Lost hours tracking down blueprints and logs</p>
            </div>

            <div className="flex items-center">
              <div className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                2
              </div>
              <p className="text-lg text-zinc-700 dark:text-zinc-300 font-medium">Payroll inaccuracies from manual timesheets</p>
            </div>

            <div className="flex items-center">
              <div className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                3
              </div>
              <p className="text-lg text-zinc-700 dark:text-zinc-300 font-medium">Severe compliance risks due to delayed safety reporting</p>
            </div>
          </div>

          {/* Testimonial Box */}
          <div className="mt-6 rounded-2xl bg-white dark:bg-zinc-900 p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <p className="text-lg font-medium italic text-zinc-700 dark:text-zinc-300">
              &quot;KrewOS saved our project managers over 15 hours a week. We finally have real-time visibility into every active site without leaving the office.&quot;
            </p>
            <p className="mt-4 font-semibold text-blue-600 dark:text-blue-400">
              — Ishtiak, Operations Director
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}