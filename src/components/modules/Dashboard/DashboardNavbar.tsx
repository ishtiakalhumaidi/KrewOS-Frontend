"use client";

import { useQueryClient, useMutation } from "@tanstack/react-query";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/services/auth.services";
import { clearAuthCookies } from "@/app/actions/auth";

import MobileSidebar from "./MobileSidebar";
import { ModeToggle } from "@/components/ui/toggleTheme";

export default function DashboardNavbar({ role = "MEMBER" }: { role?: string }) {
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: AuthService.logout,
    onSettled: async () => {
      await clearAuthCookies();
      queryClient.clear();
      window.location.href = "/login";
    },
  });

  return (
    <header className="h-20 sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-zinc-950/80 border-b border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between px-6 sm:px-10 transition-all">
      <div className="flex items-center">
        <MobileSidebar role={role} />
      </div>

      <div className="flex items-center space-x-4 sm:space-x-6">
        <ModeToggle />

        <Button
          variant="outline"
          className="h-12 px-6 rounded-2xl font-bold border-slate-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-800 transition-all active:scale-95"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? (
            <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4 sm:mr-2" />
          )}
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}