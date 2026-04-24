"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { ModeToggle } from "../ui/toggleTheme";
import { Logo } from "../shared/Logo";

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem("accessToken"); 
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* LOGO */}
          <Logo />

          {/* CENTER LINKS */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-300">
            <Link href="/about" className="hover:text-blue-600 transition-colors">About</Link>
            <Link href="/#features" className="hover:text-blue-600 transition-colors">Features</Link>
            
            {/* 👉 Hide Pricing if logged in! */}
            {(!isMounted || !isLoggedIn) && (
              <Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
            )}
          </nav>
          

          {/* AUTH BUTTONS */}
          <div className="flex items-center gap-4">
            <ModeToggle />
            {!isMounted ? (
              <div className="w-24 h-10"></div>
            ) : isLoggedIn ? (
              <Link href="/admin">
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