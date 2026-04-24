"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldAlert, FolderKanban, Clock } from "lucide-react";
import CardSwap, { Card } from "@/components/CardSwap";

export function Hero() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (localStorage.getItem("accessToken")) setIsLoggedIn(true);
  }, []);

  return (
    <section className="relative overflow-hidden bg-zinc-50 dark:bg-zinc-950 pt-20 pb-24 md:pt-28 md:pb-32">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          <div className="text-left z-10 pt-10 lg:pt-0">
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 mb-6 border border-blue-200 dark:border-blue-800">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
              KrewOS is now live
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-zinc-900 dark:text-white leading-[1.1]">
              Build Better, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Together.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg">
              The all-in-one operating system for construction. Manage your workforce, track daily site reports, monitor safety incidents, and automate payroll without the paperwork.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 h-12">
              {/* 👉 DYNAMIC HERO BUTTONS */}
              {!isMounted ? null : isLoggedIn ? (
                <Link href="/admin" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white text-base h-12 px-8 shadow-lg shadow-blue-600/20">
                    <span>Go to your Workspace</span> <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white text-base h-12 px-8 shadow-lg shadow-blue-600/20">
                      <span>Start your free trial</span> <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full rounded-full text-base h-12 px-8 bg-white dark:bg-zinc-900 shadow-sm border-zinc-200 dark:border-zinc-800">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Column: 3D CardSwap Component */}
          <div className="relative h-[450px] w-full z-0 flex items-center justify-center lg:justify-end">
            <CardSwap width={360} height={220} cardDistance={40} verticalDistance={45} delay={4000} pauseOnHover={true}>
              {/* WIDGET 1: Project Management */}
              <Card customClass="!bg-white dark:!bg-zinc-900 !border-zinc-200 dark:!border-zinc-800 shadow-2xl p-6 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
                    <FolderKanban size={22} />
                  </div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white tracking-tight">Active Project</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-zinc-600 dark:text-zinc-300">Downtown Highrise</span>
                    <span className="text-blue-600 dark:text-blue-400">75%</span>
                  </div>
                  <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 w-[75%] rounded-full"></div>
                  </div>
                </div>
              </Card>

              {/* WIDGET 2: Safety Incident */}
              <Card customClass="!bg-white dark:!bg-zinc-900 !border-zinc-200 dark:!border-zinc-800 shadow-2xl p-6 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg">
                    <ShieldAlert size={22} />
                  </div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white tracking-tight">Safety Alert</h3>
                </div>
                <div className="p-3.5 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
                  <p className="text-sm font-bold text-red-800 dark:text-red-400">High Severity: Scaffolding Issue</p>
                </div>
              </Card>

              {/* WIDGET 3: Timesheet / Payroll */}
              <Card customClass="!bg-white dark:!bg-zinc-900 !border-zinc-200 dark:!border-zinc-800 shadow-2xl p-6 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
                    <Clock size={22} />
                  </div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white tracking-tight">Weekly Payroll</h3>
                </div>
                <div className="flex justify-between items-end border-t border-zinc-100 dark:border-zinc-800 pt-4">
                  <div className="space-y-1">
                    <p className="font-bold text-xl text-zinc-900 dark:text-white">1,240 <span className="text-sm font-normal text-muted-foreground">hrs</span></p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="font-bold text-xl text-emerald-600 dark:text-emerald-400">$48,500</p>
                  </div>
                </div>
              </Card>
            </CardSwap>
          </div>
        </div>
      </div>
    </section>
  );
}