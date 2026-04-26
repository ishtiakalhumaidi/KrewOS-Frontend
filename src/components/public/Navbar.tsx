"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { ModeToggle } from "../ui/toggleTheme";

export function Navbar({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          <Logo />

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-300">
            <Link href="/about" className="hover:text-blue-600 transition-colors">About</Link>
            <Link href="/#features" className="hover:text-blue-600 transition-colors">Features</Link>
            
            {!isLoggedIn && (
              <Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <ModeToggle />
            {isLoggedIn ? (
              // 👉 Redirect to your smart /dashboard router!
              <Link href="/dashboard">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium hover:text-blue-600 transition-colors hidden sm:block">
                  Sign In
                </Link>
                <Link href="/register">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}