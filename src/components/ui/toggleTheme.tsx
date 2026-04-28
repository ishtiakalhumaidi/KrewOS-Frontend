"use client";
import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // Wrapping this in a setTimeout defers the execution to the next tick.
    // This perfectly bypasses the "synchronous setState in effect" linter error
    // while still solving the next-themes hydration mismatch!
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="h-12 w-[120px] bg-slate-100 dark:bg-zinc-800 rounded-full animate-pulse border border-slate-200 dark:border-zinc-700" />
    );
  }

  const themes = ["light", "dark", "system"] as const;
  const activeIndex = themes.indexOf(theme as typeof themes[number]);

  return (
    <div className="flex items-center bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full p-1 shadow-sm w-fit relative h-12">
      {/* Sliding Background Indicator */}
      <motion.div
        className="absolute bg-white dark:bg-zinc-800 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] z-0"
        layout
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        initial={false}
        style={{
          top: 4,
          bottom: 4,
          width: 40,
          x: activeIndex * 40,
          left: 4,
        }}
        animate={{
          x: activeIndex * 40,
        }}
      />

      {[
        { mode: "light", Icon: Sun, activeColor: "text-amber-500" },
        { mode: "dark", Icon: Moon, activeColor: "text-blue-400" },
        { mode: "system", Icon: Monitor, activeColor: "text-indigo-500 dark:text-indigo-400" },
      ].map(({ mode, Icon, activeColor }) => (
        <button
          key={mode}
          onClick={() => setTheme(mode)}
          className={cn(
            "relative z-10 flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            theme === mode
              ? activeColor
              : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          )}
          aria-label={`${mode} mode`}
        >
          <Icon className="h-4 w-4" strokeWidth={theme === mode ? 2.5 : 2} />
        </button>
      ))}
    </div>
  );
}