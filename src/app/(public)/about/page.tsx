"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  HardHat, Target, CheckCircle2, ShieldCheck,
  Zap, Users, ArrowRight, Rocket, AlertCircle, X
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CORE_VALUES = [
  {
    title: "Safety First",
    description: "Incidents are reported and resolved instantly. Compliance is never an afterthought.",
    icon: ShieldCheck,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/30",
  },
  {
    title: "Reliability",
    description: "Software as sturdy and dependable as the physical structures our clients construct.",
    icon: HardHat,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/30",
  },
  {
    title: "Efficiency",
    description: "Scattered spreadsheets replaced with automated, real-time workflows. No wasted hours.",
    icon: Zap,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/30",
  },
  {
    title: "One Team",
    description: "Field and office operating from a single source of truth. No gaps, no silos.",
    icon: Users,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-900/30",
  },
];

export default function AboutPage() {
  const headerRef = useRef(null);
  const missionRef = useRef(null);
  const valuesRef = useRef(null);

  const headerInView = useInView(headerRef, { once: true, amount: 0.3 });
  const missionInView = useInView(missionRef, { once: true, amount: 0.2 });
  const valuesInView = useInView(valuesRef, { once: true, amount: 0.2 });

  return (
    <div className="relative w-full overflow-hidden bg-zinc-50 dark:bg-zinc-950 pt-24 pb-32 mb-10">

      {/* Subtle ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-blue-500/8 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 24 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <div className="mt-10  inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-xs font-semibold tracking-widest text-zinc-500 dark:text-zinc-400 uppercase shadow-sm">
            <Rocket className="h-3.5 w-3.5 text-blue-500" />
            Our Story
          </div>

          <h1 className="mb-5 text-5xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-6xl lg:text-7xl leading-[1.1]">
            Built for the{" "}
            <span className="italic font-semibold text-blue-600 dark:text-blue-400">
              modern site.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl mx-auto">
            KrewOS was founded to eliminate construction management chaos and bring everything into one unified, digital workspace.
          </p>
        </motion.div>

        {/* ── Mission & Vision Cards ── */}
        <div ref={missionRef} className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-20">

          {/* Problem Card */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={missionInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="flex flex-col rounded-[3.5em] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 lg:p-10 shadow-sm"
          >
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              <AlertCircle className="h-5 w-5" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
              The problem with paper
            </h2>
            <p className="mb-8 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 flex-1">
              For decades, construction teams have relied on scattered spreadsheets, paper timesheets, and disconnected apps — leading to lost data, missed safety reports, and delayed payroll.
            </p>

            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 p-2 space-y-3 mt-auto">
              {["Lost safety reports", "Inaccurate payroll hours", "Mismanaged materials"].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40 shrink-0">
                    <X className="h-3 w-3 text-red-500" />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Vision Card */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={missionInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col rounded-[3.5em] border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 p-8 lg:p-10 shadow-sm"
          >
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
              <HardHat className="h-5 w-5" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Our vision
            </h2>
            <p className="mb-8 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 flex-1">
              Every site manager, safety officer, and worker deserves software as reliable as the structures they build. KrewOS connects the office to the field in real-time — no more guesswork, no more gaps.
            </p>

            <Link href="/register" className="mt-auto">
              <Button className="w-full h-12 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-2 group transition-all">
                Join the revolution
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* ── Core Values ── */}
        <div ref={valuesRef}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={valuesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-10 pt-16 text-center"
          >
            <p className="mb-2 text-xs font-semibold tracking-widest text-zinc-400 uppercase">
              What we stand for
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl mb-3">
              Our core values
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
              The principles that guide how we build KrewOS and serve the construction industry.
            </p>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ">
            {CORE_VALUES.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={valuesInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex flex-col gap-4 rounded-[3.5em] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm"
                >
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", value.bg, value.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-sm font-bold text-zinc-900 dark:text-white">
                      {value.title}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}