"use client";

import Link from "next/link";
import { ArrowRight, ShieldAlert, FolderKanban, Clock } from "lucide-react";
import CardSwap, { Card } from "@/components/CardSwap";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Floating Ambient Shapes ────────────────────────────────────────────────

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
  borderRadius = 16,
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
  borderRadius?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute -z-10", className)}
    >
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
        style={{ width, height }}
      >
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-r to-transparent backdrop-blur-[2px]",
            gradient,
            "ring-1 ring-white/10 dark:ring-white/[0.03]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.05)]",
            "after:absolute after:inset-0 after:rounded-[inherit]",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]"
          )}
          style={{ borderRadius }}
        />
      </motion.div>
    </motion.div>
  );
}

// ─── Main Hero Component ──────────────────────────────────────────────────

export function Hero({ isLoggedIn }: { isLoggedIn: boolean }) {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.2 + i * 0.15,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  };

  return (
    // 👉 FIX 1: Changed to min-h-[95vh] and flex items-center to create massive, premium vertical whitespace
    <section className="relative flex min-h-[95vh] items-center overflow-visible py-24 w-full z-10">
      
      {/* ─── Ambient Background Glow ─── */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] via-transparent to-indigo-500/[0.03] blur-3xl dark:from-blue-500/[0.08] dark:via-transparent dark:to-indigo-500/[0.05] -z-20" />

      {/* ─── Zigzag Ambient Shapes ─── */}
      {/* 👉 FIX 2: Arranged the 4 shapes in a sweeping Z-pattern across the background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        {/* 1. Top Left */}
        <ElegantShape
          delay={0.2}
          width={450}
          height={140}
          rotate={-12}
          gradient="from-blue-600/[0.15] dark:from-blue-500/[0.2]"
          className="top-[5%] left-[-5%]"
          borderRadius={32}
        />
        {/* 2. Middle Right */}
        <ElegantShape
          delay={0.4}
          width={550}
          height={180}
          rotate={18}
          gradient="from-indigo-500/[0.1] dark:from-indigo-400/[0.15]"
          className="top-[30%] right-[-10%]"
          borderRadius={40}
        />
        {/* 3. Bottom Left */}
        <ElegantShape
          delay={0.6}
          width={300}
          height={200}
          rotate={-8}
          gradient="from-emerald-500/[0.1] dark:from-emerald-500/[0.15]"
          className="bottom-[15%] left-[5%]"
          borderRadius={40}
        />
        {/* 4. Bottom Right */}
        <ElegantShape
          delay={0.8}
          width={400}
          height={120}
          rotate={15}
          gradient="from-blue-500/[0.15] dark:from-blue-400/[0.15]"
          className="bottom-[5%] right-[15%]"
          borderRadius={24}
        />
      </div>

      {/* ─── Content Container ─── */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 👉 FIX 3: Increased horizontal gap (gap-16 lg:gap-24) to push content apart for a cleaner layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* ─── LEFT COLUMN: Text & CTA ─── */}
          <div className="text-left z-10 pt-10 lg:pt-0">
            
            <motion.div custom={0} initial="hidden" animate="visible">
              <div className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold text-blue-700 bg-blue-100/80 dark:bg-blue-900/40 dark:text-blue-300 mb-8 border border-blue-200/80 dark:border-blue-800/60 shadow-sm backdrop-blur-sm">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 mr-2.5 animate-pulse"></span>
                KrewOS is now live
              </div>
            </motion.div>

            <motion.div custom={1} initial="hidden" animate="visible" >
              {/* 👉 FIX 4: Tightened the line-height (leading-[1.1]) to make the huge text look sharp and intentional */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5rem] font-extrabold tracking-tight mb-8 text-zinc-900 dark:text-white leading-[1.1]">
                Build Better, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 pb-2 inline-block">
                  Together.
                </span>
              </h1>
            </motion.div>

            <motion.div custom={2} initial="hidden" animate="visible" >
              {/* 👉 FIX 5: Increased text-lg to text-xl for easier reading with the extra whitespace */}
              <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 mb-12 max-w-lg leading-relaxed font-medium">
                The all-in-one operating system for construction. Manage your workforce, track daily site reports, monitor safety incidents, and automate payroll without the paperwork.
              </p>
            </motion.div>

            <motion.div custom={3} initial="hidden" animate="visible"  className="flex flex-col sm:flex-row items-center gap-4">
              {isLoggedIn ? (
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <button className="flex w-full items-center justify-center h-14 px-8 rounded-2xl text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none group">
                    Go to your Workspace
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/register" className="w-full sm:w-auto">
                    <button className="flex w-full items-center justify-center h-14 px-8 rounded-2xl text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none group">
                      Start your free trial
                      <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <button className="flex w-full items-center justify-center h-14 px-8 rounded-2xl text-base font-bold bg-white dark:bg-zinc-900/80 text-zinc-900 dark:text-white border border-slate-200 dark:border-zinc-800 shadow-sm backdrop-blur-md transition-all hover:bg-slate-50 dark:hover:bg-zinc-800 hover:-translate-y-0.5 active:translate-y-0">
                      Sign In
                    </button>
                  </Link>
                </>
              )}
            </motion.div>
          </div>

          {/* ─── RIGHT COLUMN: CardSwap ─── */}
          <motion.div 
            custom={4} 
            initial="hidden" 
            animate="visible" 
            className="relative h-[450px] w-full z-0 flex items-center justify-center lg:justify-end"
          >
            <CardSwap width={360} height={220} cardDistance={40} verticalDistance={45} delay={4000} pauseOnHover={true}>
              
              {/* WIDGET 1: Project Management */}
              <Card customClass="!bg-white/95 dark:!bg-zinc-900/90 !border-slate-100/80 dark:!border-zinc-800 !backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] !rounded-3xl p-6 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
                    <FolderKanban size={22} />
                  </div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white tracking-tight">Active Project</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-zinc-600 dark:text-zinc-400">Downtown Highrise</span>
                    <span className="text-blue-600 dark:text-blue-400">75%</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 w-[75%] rounded-full"></div>
                  </div>
                </div>
              </Card>

              {/* WIDGET 2: Safety Incident */}
              <Card customClass="!bg-white/95 dark:!bg-zinc-900/90 !border-slate-100/80 dark:!border-zinc-800 !backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] !rounded-3xl p-6 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl">
                    <ShieldAlert size={22} />
                  </div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white tracking-tight">Safety Alert</h3>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 rounded-2xl">
                  <p className="text-sm font-bold text-red-800 dark:text-red-400">High Severity: Scaffolding Issue</p>
                </div>
              </Card>

              {/* WIDGET 3: Timesheet / Payroll */}
              <Card customClass="!bg-white/95 dark:!bg-zinc-900/90 !border-slate-100/80 dark:!border-zinc-800 !backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] !rounded-3xl p-6 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <Clock size={22} />
                  </div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white tracking-tight">Weekly Payroll</h3>
                </div>
                <div className="flex justify-between items-end border-t border-slate-100 dark:border-zinc-800 pt-4 mt-2">
                  <div className="space-y-1">
                    <p className="font-bold text-2xl text-zinc-900 dark:text-white tracking-tight">1,240 <span className="text-sm font-normal text-zinc-500">hrs</span></p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="font-bold text-2xl text-emerald-600 dark:text-emerald-400 tracking-tight">$48,500</p>
                  </div>
                </div>
              </Card>

            </CardSwap>
          </motion.div>
        </div>
      </div>
    </section>
  );
}