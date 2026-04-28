"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { ModeToggle } from "../ui/toggleTheme";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function Navbar({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 1. Add frosted glass effect when user scrolls past 20px
      setScrolled(currentScrollY > 20);

      // 2. Smart Scroll: Hide navbar if scrolling down, show if scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setHidden(true);
        setIsMobileMenuOpen(false); // Auto-close mobile menu when scrolling down
      } else {
        setHidden(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const navLinks = [
    { label: "About", href: "/about" },
    { label: "Features", href: "/#features" },
    ...(!isLoggedIn ? [{ label: "Pricing", href: "/pricing" }] : []),
  ];

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: hidden ? "-100%" : 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "fixed top-0 inset-x-0 z-50 w-full border-b transition-colors duration-300",
        scrolled || isMobileMenuOpen
          ? "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border-slate-200 dark:border-zinc-800 shadow-[0_4px_30px_rgba(0,0,0,0.03)] supports-[backdrop-filter]:bg-white/60"
          : "bg-transparent border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* ─── Logo ─── */}
          {/* 👉 THE FIX: Removed the extra <Link> wrapper here! */}
          <div className="flex-shrink-0 flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg">
            <Logo />
          </div>

          {/* ─── Desktop Navigation ─── */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-zinc-300">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ─── Desktop Auth Buttons & Theme Toggle ─── */}
          <div className="hidden md:flex items-center gap-4">
            <ModeToggle />
            {isLoggedIn ? (
              <Link href="/dashboard">
                <button className="flex items-center h-11 px-5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-slate-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Sign In
                </Link>
                <Link href="/register">
                  <button className="flex items-center h-11 px-6 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none">
                    Get Started
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* ─── Mobile Menu Toggle Button ─── */}
          <div className="flex md:hidden items-center gap-3">
            <ModeToggle />
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-7 w-7" aria-hidden="true" />
              ) : (
                <Menu className="block h-7 w-7" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Mobile Menu Dropdown ─── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 shadow-2xl"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              
              {/* Mobile Links */}
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3.5 rounded-xl text-base font-bold text-zinc-900 dark:text-white hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Mobile Auth Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-col gap-3 px-2">
                {isLoggedIn ? (
                  <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full h-12 rounded-xl text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md active:scale-95 transition-all">
                      <LayoutDashboard className="w-5 h-5 mr-2" />
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full h-12 rounded-xl text-base font-bold border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white active:scale-95 transition-all">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full h-12 rounded-xl text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md active:scale-95 transition-all">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
              
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}